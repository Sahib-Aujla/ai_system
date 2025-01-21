import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});


async function main() {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: "user", content: "Who are you?" }],
    model: "gpt-3.5-turbo",
  });
  console.log(chatCompletion);
  console.log(chatCompletion.choices[0].message);
}

main();
