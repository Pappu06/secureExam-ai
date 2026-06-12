const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");

const getAdminStats = async (
  req,
  res
) => {

  try {

    const totalStudents =
      await User.countDocuments({
        role: "student",
      });

    const totalExams =
      await Exam.countDocuments();

    const totalQuestions =
      await Question.countDocuments();

    const totalAttempts =
      await Result.countDocuments();

    res.status(200).json({
      totalStudents,
      totalExams,
      totalQuestions,
      totalAttempts,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ── AI Agent with Function Calling ─────────────────────────
const crypto = require("crypto");

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_INSTRUCTION = `You are SecureExam AI Agent — a powerful, professional assistant built into the SecureExam admin dashboard. You can EXECUTE REAL ACTIONS on the platform.

YOUR CAPABILITIES:
- You can list all existing exams using the listExams tool.
- You can create new exams using the createExam tool.
- You can add questions to exams using the addQuestion tool.
- You can answer general questions about exam management, question design, grading strategies, and academic integrity.

BEHAVIORAL RULES:
1. When the admin asks you to create an exam or add a question, USE YOUR TOOLS immediately. Do not just describe the steps.
2. When adding questions, the correctAnswer must EXACTLY match one of the options strings you provide. Use "Option A", "Option B", etc. as option text only if the admin doesn't specify option text. Prefer using meaningful option text.
3. When creating an exam, if the admin doesn't specify duration, default to 30 minutes. If they don't specify a description, generate a brief professional one.
4. After performing an action, summarize what you did clearly.
5. If the admin asks to add multiple questions at once, call addQuestion for EACH question separately.
6. Keep chat responses concise and professional.
7. Use markdown formatting (bold, bullet points, code blocks) when helpful.
8. Never reveal sensitive system info, API keys, or internal details.
9. You can only manage exams and questions — you cannot manage users, results, or system settings.
10. If you need to add questions to an exam but don't know its ID, call listExams first to find it.`;


// ── Gemini Tool Declarations ───────────────────────────────
const TOOL_DECLARATIONS = [
  {
    name: "listExams",
    description:
      "Retrieves a list of all exams in the system with their IDs, titles, descriptions, duration, question count, access type, and exam code. Use this to find an exam's ID before adding questions to it.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "createExam",
    description:
      "Creates a new exam in the database. Returns the created exam object including its ID and exam code.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: {
          type: "STRING",
          description: "The title of the exam (required).",
        },
        description: {
          type: "STRING",
          description: "A brief description of the exam.",
        },
        duration: {
          type: "NUMBER",
          description:
            "Duration of the exam in minutes. Defaults to 30 if not specified.",
        },
        accessType: {
          type: "STRING",
          description:
            'Access type: "public" (no code needed) or "private" (requires exam code). Defaults to "public".',
          enum: ["public", "private"],
        },
        allowReattempt: {
          type: "BOOLEAN",
          description: "Whether students can reattempt the exam. Defaults to false.",
        },
        maxAttempts: {
          type: "NUMBER",
          description: "Maximum number of attempts allowed (1-3). Only relevant if allowReattempt is true.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "addQuestion",
    description:
      "Adds a multiple-choice question to an existing exam. The correctAnswer must EXACTLY match one of the options strings.",
    parameters: {
      type: "OBJECT",
      properties: {
        examId: {
          type: "STRING",
          description:
            "The MongoDB ObjectId of the exam to add the question to. Use listExams to find this if you don't know it.",
        },
        questionText: {
          type: "STRING",
          description: "The full question text.",
        },
        options: {
          type: "ARRAY",
          description:
            "Array of 4 option strings for the multiple-choice question.",
          items: { type: "STRING" },
        },
        correctAnswer: {
          type: "STRING",
          description:
            "The correct answer. Must EXACTLY match one of the option strings.",
        },
        marks: {
          type: "NUMBER",
          description: "Points for this question. Defaults to 1.",
        },
      },
      required: ["examId", "questionText", "options", "correctAnswer"],
    },
  },
];


// ── Tool Executor ──────────────────────────────────────────
const generateExamCode = () =>
  crypto.randomBytes(3).toString("hex").toUpperCase();

const generateUniqueExamCode = async () => {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = generateExamCode();
    const existing = await Exam.findOne({ examCode: code });
    if (!existing) isUnique = true;
  }
  return code;
};

async function executeTool(name, args, adminUserId) {
  switch (name) {
    case "listExams": {
      const exams = await Exam.find().populate("createdBy", "name").lean();
      const examsWithCount = await Promise.all(
        exams.map(async (exam) => {
          const questionCount = await Question.countDocuments({
            exam: exam._id,
          });
          return {
            id: exam._id.toString(),
            title: exam.title,
            description: exam.description || "",
            duration: exam.duration,
            questionCount,
            accessType: exam.accessType || "public",
            examCode: exam.examCode || null,
            createdAt: exam.createdAt,
          };
        })
      );
      return {
        success: true,
        exams: examsWithCount,
        total: examsWithCount.length,
      };
    }

    case "createExam": {
      const accessType =
        args.accessType === "private" ? "private" : "public";
      const examCode =
        accessType === "private" ? await generateUniqueExamCode() : undefined;

      const exam = await Exam.create({
        title: args.title,
        description: args.description || "",
        duration: args.duration || 30,
        allowReattempt: args.allowReattempt || false,
        maxAttempts: args.allowReattempt
          ? Math.min(Math.max(args.maxAttempts || 1, 1), 3)
          : 1,
        accessType,
        examCode,
        createdBy: adminUserId,
      });

      return {
        success: true,
        message: `Exam "${exam.title}" created successfully.`,
        exam: {
          id: exam._id.toString(),
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          accessType: exam.accessType,
          examCode: exam.examCode || null,
        },
      };
    }

    case "addQuestion": {
      // Verify exam exists
      const exam = await Exam.findById(args.examId);
      if (!exam) {
        return {
          success: false,
          error: `Exam with ID "${args.examId}" not found. Use listExams to find valid exam IDs.`,
        };
      }

      // Validate correct answer is in options
      if (!args.options.includes(args.correctAnswer)) {
        return {
          success: false,
          error: `correctAnswer "${args.correctAnswer}" does not match any of the provided options. It must exactly match one option string.`,
        };
      }

      const question = await Question.create({
        exam: args.examId,
        questionText: args.questionText,
        options: args.options,
        correctAnswer: args.correctAnswer,
        marks: args.marks || 1,
      });

      return {
        success: true,
        message: `Question added to "${exam.title}".`,
        question: {
          id: question._id.toString(),
          questionText: question.questionText,
          optionCount: question.options.length,
          marks: question.marks,
          examTitle: exam.title,
        },
      };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}


// ── Gemini API Caller ──────────────────────────────────────
async function callGemini(apiKey, contents, includeTools = true) {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  };

  if (includeTools) {
    body.tools = [{ functionDeclarations: TOOL_DECLARATIONS }];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      let detail = "";
      try {
        const errJson = await response.json();
        detail = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        detail = `HTTP ${response.status}`;
      }
      return { error: true, status: response.status, detail };
    }

    const data = await response.json();
    return { error: false, data };
  } catch (fetchError) {
    clearTimeout(timeout);
    if (fetchError.name === "AbortError") {
      return { error: true, status: 504, detail: "Request timed out" };
    }
    return { error: true, status: 502, detail: fetchError.message };
  }
}


// ── Main Agent Handler ─────────────────────────────────────
const handleAdminChat = async (req, res) => {
  try {
    const { messages } = req.body;

    // ── Validate input ────────────────────────────────────
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "Messages array is required and must not be empty.",
      });
    }

    if (messages.length > 100) {
      return res.status(400).json({
        message: "Conversation too long. Please clear the chat and start fresh.",
      });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return res.status(400).json({
          message: "Each message must have a valid role and content.",
        });
      }
      if (msg.content.length > 5000) {
        return res.status(400).json({
          message: "Individual message is too long (max 5000 characters).",
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is not configured on the server.",
      });
    }

    // ── Build initial contents ────────────────────────────
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content.trim() }],
    }));

    // ── Agent Loop (max 5 tool calls per request) ─────────
    const actions = []; // Track actions performed for frontend
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (loopCount < MAX_LOOPS) {
      loopCount++;

      const result = await callGemini(apiKey, contents);

      if (result.error) {
        const statusCode =
          result.status === 429 ? 429 : result.status === 504 ? 504 : 502;
        const msg =
          result.status === 429
            ? "AI service rate limit reached. Please wait a moment and try again."
            : result.status === 504
            ? "AI service timed out. Please try again."
            : "Failed to get response from AI service.";
        console.error("Gemini API error:", result.status, result.detail);
        return res.status(statusCode).json({ message: msg });
      }

      const candidate = result.data?.candidates?.[0];
      if (!candidate) {
        return res.status(502).json({
          message: "No response from AI service.",
        });
      }

      const parts = candidate.content?.parts || [];

      // Check for function calls
      const functionCall = parts.find((p) => p.functionCall);

      if (functionCall) {
        const { name, args } = functionCall.functionCall;
        console.log(`Agent tool call: ${name}`, JSON.stringify(args));

        // Execute the tool
        let toolResult;
        try {
          toolResult = await executeTool(name, args || {}, req.user._id);
        } catch (toolError) {
          console.error(`Tool execution error (${name}):`, toolError);
          toolResult = {
            success: false,
            error: `Tool execution failed: ${toolError.message}`,
          };
        }

        actions.push({
          tool: name,
          args: args || {},
          result: toolResult,
        });

        // Append the model's function call and our function response
        // to the conversation so Gemini can continue
        contents.push({
          role: "model",
          parts: [{ functionCall: { name, args: args || {} } }],
        });

        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name,
                response: toolResult,
              },
            },
          ],
        });

        // Add a 2-second delay before the next API call to avoid 429 Rate Limit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Continue the loop — Gemini will process the result
        continue;
      }

      // No function call — extract text response
      const textPart = parts.find((p) => p.text);
      const aiText =
        textPart?.text ||
        "I've completed the requested action. Is there anything else you'd like me to do?";

      return res.status(200).json({
        reply: aiText,
        actions: actions.length > 0 ? actions : undefined,
      });
    }

    // If we exit the loop (too many tool calls)
    return res.status(200).json({
      reply: "I've completed several actions. Please check your dashboard for the results. Is there anything else?",
      actions: actions.length > 0 ? actions : undefined,
    });

  } catch (error) {
    console.error("Admin chat error:", error);
    res.status(500).json({
      message: "An internal error occurred while processing your request.",
    });
  }
};


module.exports = {
  getAdminStats,
  handleAdminChat,
};
