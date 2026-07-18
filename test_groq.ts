import fs from 'fs';

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

async function testGroq() {
  const envContent = fs.readFileSync(".env", "utf8");
  let apiKey = "";
  for (const line of envContent.split("\n")) {
    if (line.startsWith("VITE_GROQ_API_KEY=")) {
      apiKey = line.split("=")[1].trim();
    }
  }
  
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: "You create rigorous DSA coding problems. Return only strict JSON matching the requested schema. Do not include markdown.",
        },
        {
          role: "user",
          content: "Create a Easy Arrays DSA problem for javascript.\nCustom prompt: No custom prompt",
        },
      ],
    }),
  });

  if (!response.ok) {
    console.log(`Failed with ${response.status}`);
    const text = await response.text();
    console.log(text);
  } else {
    console.log("Success");
  }
}

testGroq();
