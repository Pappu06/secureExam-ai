const email = "pappukumar.pk1106@gmail.com";
const password = "Qwerty@0000";

async function testAgent() {
  console.log("1. Authenticating...");
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    console.error("Login failed:", loginRes.status, err);
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log(`✅ Logged in successfully as ${loginData.name} (${loginData.role})`);

  console.log("\n2. Sending request to AI Agent...");
  const prompt = "Create a new exam titled 'Agent Test Exam' with 15 minutes duration. Then add 2 multiple choice questions to it about basic Math.";
  
  console.log(`Prompt: "${prompt}"\nWaiting for agent to process tools (this may take 5-10 seconds)...`);

  const chatRes = await fetch("http://localhost:5000/api/admin/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!chatRes.ok) {
    const err = await chatRes.text();
    console.error("Agent failed:", chatRes.status, err);
    return;
  }

  const chatData = await chatRes.json();
  console.log("\n✅ Agent Response Received!");
  console.log("--------------------------------------------------");
  console.log("Message:", chatData.reply);
  console.log("--------------------------------------------------");
  
  if (chatData.actions && chatData.actions.length > 0) {
    console.log("\n🛠️ Actions Performed by Agent:");
    chatData.actions.forEach((action, i) => {
      console.log(`  ${i + 1}. Tool Used: [${action.tool}]`);
      if (action.result?.success) {
        console.log(`     Status: ✅ Success`);
        if (action.tool === "createExam") {
          console.log(`     Details: Created exam ID ${action.result.exam.id} titled "${action.result.exam.title}"`);
        } else if (action.tool === "addQuestion") {
          console.log(`     Details: Added question "${action.result.question.questionText}"`);
        }
      } else {
        console.log(`     Status: ❌ Failed (${action.result?.error})`);
      }
    });
  } else {
    console.log("No tool actions were returned.");
  }
}

testAgent().catch(console.error);
