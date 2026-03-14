const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const genAI = new GoogleGenerativeAI("AIzaSyDM9JUzZbkh6TIfSagsoelIEWcJ2n4IojA");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

test();
