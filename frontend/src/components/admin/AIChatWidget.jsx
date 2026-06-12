import { useState, useRef, useEffect, useCallback, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendAdminChatMessage } from "../../services/adminService";


// ── Error Boundary ─────────────────────────────────────────
class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("AIChatWidget error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => this.setState({ hasError: false })}
            className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
            title="Chat crashed — click to restart"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


// ── Markdown Renderer ──────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;

  try {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;
    let keyCounter = 0;

    const getKey = () => `md-${keyCounter++}`;

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.trim().startsWith("```")) {
        const lang = line.trim().slice(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        const codeContent = codeLines.join("\n");
        elements.push(
          <CodeBlock key={getKey()} code={codeContent} language={lang} />
        );
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const sizes = {
          1: "font-bold text-base mt-3 mb-1.5",
          2: "font-bold text-[15px] mt-2.5 mb-1",
          3: "font-semibold text-sm mt-2 mb-1",
          4: "font-semibold text-[13px] mt-1.5 mb-0.5",
        };
        const Tag = `h${Math.min(level + 1, 6)}`;
        elements.push(
          <Tag key={getKey()} className={sizes[level] || sizes[4]}>
            {formatInline(content)}
          </Tag>
        );
        i++;
        continue;
      }

      // Bullet points
      if (/^[\s]*[-*]\s/.test(line)) {
        const bulletLines = [];
        while (i < lines.length && /^[\s]*[-*]\s/.test(lines[i])) {
          bulletLines.push(lines[i].replace(/^[\s]*[-*]\s/, ""));
          i++;
        }
        elements.push(
          <ul key={getKey()} className="list-disc list-outside pl-4 space-y-1 my-1.5 text-[13px]">
            {bulletLines.map((bl, idx) => (
              <li key={idx} className="leading-relaxed">{formatInline(bl)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Numbered list
      if (/^\s*\d+\.\s/.test(line)) {
        const listLines = [];
        while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
          listLines.push(lines[i].trim().replace(/^\d+\.\s/, ""));
          i++;
        }
        elements.push(
          <ol key={getKey()} className="list-decimal list-outside pl-4 space-y-1 my-1.5 text-[13px]">
            {listLines.map((ll, idx) => (
              <li key={idx} className="leading-relaxed">{formatInline(ll)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // Horizontal rule
      if (/^[-*_]{3,}\s*$/.test(line.trim())) {
        elements.push(<hr key={getKey()} className="border-gray-200 my-2" />);
        i++;
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        i++;
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={getKey()} className="text-[13px] leading-relaxed my-1">
          {formatInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  } catch {
    // Fallback: render as plain text if parsing fails
    return <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{text}</p>;
  }
}

function formatInline(text) {
  if (!text || typeof text !== "string") return text || "";

  const parts = [];
  // Match bold (**text**), inline code (`code`), and italic (*text* but not **)
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;
  let safety = 0;

  while ((match = regex.exec(text)) !== null && safety < 200) {
    safety++;
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // Bold
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code
          key={`c-${match.index}`}
          className="bg-slate-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200"
        >
          {match[3]}
        </code>
      );
    } else if (match[4]) {
      // Italic
      parts.push(
        <em key={`i-${match.index}`} className="italic">
          {match[4]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}


// ── Code Block with Copy ───────────────────────────────────
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border border-slate-700">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between bg-slate-800 px-3 py-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-slate-900 text-green-400 text-xs p-3 overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}


// ── Action Badge (for tool calls) ──────────────────────────
function ActionBadge({ action }) {
  const toolLabels = {
    listExams: { label: "Listed Exams", icon: "list", color: "blue" },
    createExam: { label: "Exam Created", icon: "plus", color: "emerald" },
    addQuestion: { label: "Question Added", icon: "check", color: "amber" },
  };

  const info = toolLabels[action.tool] || { label: action.tool, icon: "bolt", color: "gray" };
  const success = action.result?.success !== false;
  const colorMap = {
    blue: success ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-red-50 border-red-200 text-red-700",
    emerald: success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700",
    amber: success ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
  };

  const icons = {
    list: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    plus: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    check: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    ),
    bolt: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  };

  let detail = "";
  if (action.tool === "createExam" && action.result?.exam) {
    detail = action.result.exam.title;
  } else if (action.tool === "addQuestion" && action.result?.question) {
    detail = `to ${action.result.question.examTitle}`;
  } else if (action.tool === "listExams" && action.result?.total !== undefined) {
    detail = `${action.result.total} exam${action.result.total !== 1 ? "s" : ""} found`;
  } else if (action.result?.error) {
    detail = "Failed";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium ${colorMap[info.color]}`}>
      {icons[info.icon]}
      <span>{info.label}</span>
      {detail && <span className="opacity-70">· {detail}</span>}
    </div>
  );
}


// ── Typing Indicator ───────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-[7px] h-[7px] bg-blue-500 rounded-full"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400 font-medium">AI is thinking...</span>
    </div>
  );
}


// ── Timestamp Formatter ────────────────────────────────────
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}


// ── Quick Prompt Data ──────────────────────────────────────
const QUICK_PROMPTS = [
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    label: "Create an exam for me",
    prompt: "Create a new exam titled 'General Knowledge Quiz' with 30 minutes duration and public access.",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
    label: "Add questions to an exam",
    prompt: "Add 3 multiple-choice questions about JavaScript basics to my latest exam.",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    label: "Show all my exams",
    prompt: "List all the exams I currently have in the system.",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    label: "Exam security tips",
    prompt: "What are the best practices for creating a secure online examination?",
  },
];


// ── Storage Key ────────────────────────────────────────────
const STORAGE_KEY = "secureexam_ai_chat_history";

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveChatHistory(messages) {
  try {
    // Keep last 50 messages to avoid bloating localStorage
    const trimmed = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail if storage is full
  }
}


// ── Main Widget ────────────────────────────────────────────
function AIChatWidgetInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => loadChatHistory());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Persist messages on change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = useCallback(async (text) => {
    const messageText = (typeof text === "string" ? text : "") || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now() + "-user",
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build the messages array for API (strip extra fields)
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await sendAdminChatMessage(apiMessages);

      const assistantMessage = {
        id: Date.now() + "-ai",
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        actions: data.actions || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (error) {
      let errMsg = "Something went wrong. Please try again.";
      if (error?.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error?.code === "ERR_NETWORK") {
        errMsg = "Network error. Please check your connection and try again.";
      } else if (error?.response?.status === 429) {
        errMsg = "Too many requests. Please wait a moment and try again.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-error",
          role: "assistant",
          content: errMsg,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleRetry = useCallback((failedMsgIndex) => {
    // Remove the error message and re-send the preceding user message
    setMessages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== failedMsgIndex);
      return filtered;
    });
    // Find the last user message before the error
    const lastUserMsg = messages
      .slice(0, failedMsgIndex)
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      // Rebuild messages without error, then resend
      setTimeout(() => handleSend(lastUserMsg.content), 100);
    }
  }, [messages, handleSend]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const messageCount = messages.filter((m) => m.role === "user").length;

  return (
    <>
      {/* ── FAB Button ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08, boxShadow: "0 8px 30px rgba(30, 64, 175, 0.4)" }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white rounded-full shadow-xl shadow-blue-900/25 flex items-center justify-center cursor-pointer border border-blue-600/30"
            aria-label="Open AI Chat Assistant"
            id="ai-chat-fab"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>

            {/* Breathing pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-blue-400/30 pointer-events-none"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Unread badge */}
            {hasNewMessage && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-5 right-5 z-50 w-[420px] max-w-[calc(100vw-1.5rem)] h-[600px] max-h-[calc(100vh-2.5rem)] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 flex flex-col overflow-hidden"
            id="ai-chat-panel"
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-850 to-blue-800 px-4 py-3.5 flex items-center justify-between shrink-0 relative overflow-hidden">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }} />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight tracking-tight">
                    SecureExam AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-blue-200 text-[11px] font-medium">Online</span>
                    {messageCount > 0 && (
                      <span className="text-blue-300/60 text-[10px] ml-1">
                        &middot; {messageCount} message{messageCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 relative z-10">
                {/* Clear Chat */}
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    title="Clear conversation"
                    aria-label="Clear conversation"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}

                {/* Minimize */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  title="Minimize chat"
                  aria-label="Minimize chat"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Messages Body ──────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
              {/* Welcome state */}
              {messages.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center h-full py-4"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                    <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-slate-800 font-semibold text-base tracking-tight">
                    AI Assistant
                  </h4>
                  <p className="text-slate-500 text-xs mt-1.5 max-w-[280px] text-center leading-relaxed">
                    Your intelligent companion for exam management, question drafting, and administrative support.
                  </p>

                  {/* Quick Prompts */}
                  <div className="mt-6 w-full max-w-[320px] space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold text-center mb-2">
                      Quick actions
                    </p>
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        onClick={() => handleSend(qp.prompt)}
                        className="w-full flex items-center gap-2.5 text-left text-[12px] px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                      >
                        <span className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
                          {qp.icon}
                        </span>
                        {qp.label}
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-400 ml-auto shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message Bubbles */}
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[88%] ${msg.role === "user" ? "" : "flex gap-2"}`}>
                    {/* AI Avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-800 to-blue-900 text-white rounded-br-md shadow-sm"
                            : msg.isError
                            ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-md"
                            : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="ai-response overflow-hidden">
                            {renderMarkdown(msg.content)}
                          </div>
                        )}

                        {/* Action badges for tool calls */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                            {msg.actions.map((action, aIdx) => (
                              <ActionBadge key={aIdx} action={action} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp + Retry */}
                      <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.timestamp && (
                          <span className="text-[10px] text-slate-400">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                        {msg.isError && (
                          <button
                            onClick={() => handleRetry(idx)}
                            className="text-[10px] text-red-500 hover:text-red-700 font-medium flex items-center gap-0.5 cursor-pointer transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                            </svg>
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md">
                      <TypingIndicator />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ─────────────────────────────── */}
            <div className="border-t border-slate-200 bg-white px-3.5 py-3 shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 leading-snug"
                    style={{ minHeight: "42px", maxHeight: "100px" }}
                    onInput={(e) => {
                      const target = e.target;
                      target.style.height = "42px";
                      target.style.height = Math.min(target.scrollHeight, 100) + "px";
                    }}
                  />
                  {/* Character count */}
                  {input.length > 200 && (
                    <span className={`absolute bottom-1 right-2 text-[9px] ${input.length > 2000 ? "text-red-400" : "text-slate-400"}`}>
                      {input.length}/2000
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading || input.length > 2000}
                  className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:shadow-none"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <p className="text-[10px] text-slate-400">
                  Powered by <span className="font-medium">Gemini AI</span>
                </p>
                <p className="text-[10px] text-slate-300">
                  Shift+Enter for new line
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// ── Exported component wrapped in Error Boundary ───────────
function AIChatWidget() {
  return (
    <ChatErrorBoundary>
      <AIChatWidgetInner />
    </ChatErrorBoundary>
  );
}

export default AIChatWidget;
