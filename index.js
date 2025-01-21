import OpenAI from "openai";
import dotenv from "dotenv";
import { sendMail } from "./nodemailer.js";
import * as readLineSync from "readline-sync";
import { getFileContent,writeFileContent } from "./fileHandle.js";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function getLocation() {
  const response = await fetch("https://ipapi.co/json/");
  const locationData = await response.json();

  return locationData;
}

async function getCurrentWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=apparent_temperature`;
  const response = await fetch(url);
  const weatherData = await response.json();
  return weatherData;
}

const tools = [
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          latitude: {
            type: "string",
          },
          longitude: {
            type: "string",
          },
        },
        required: ["longitude", "latitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getLocation",
      description: "Get the user's location based on their IP address",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getFileContent",
      description: "Get the file content in the current folder by filename",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
          },
        },
      },
      required: ["file"],
    },
  },
  {
    type: "function",
    function:{
      name:"writeFileContent",
      description:"Create a file with the provided content",
      parameters:{
        type: "object",
        properties:{
          file:{
            type:"string"
          },
          content:{
            type:"string"
          }
        },
      },
      required:["file","content"]
    }
  },
  {
    type: "function",
    function: {
      name: "sendMail",
      description: "Send the mail to the provided email address",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
          },
          subject: {
            type: "string",
          },
          content: {
            type: "string",
          },
        },
      },
      required: ["email", "subject", "content"],
    },
  },
];

const availableTools = {
  getCurrentWeather,
  getLocation,
  sendMail,
  getFileContent,
  writeFileContent
};

const messages = [
  {
    role: "system",
    content: `You are a helpful assistant. Only use the functions you have been provided with.
      If a city is provided by the user, use your intellect to get longitude and latitude and use getWeather to get the weather
      For sending email, make the content in html and send it using the provided tool.
      If the user asks to tell me the contents of the file with the name then use the provided tool first to get its content
      If the user asks to create a file, then use the provided tool and send the file name with the extension of the file as well.
    `,
  },
];

async function agent(userInput) {
  messages.push({
    role: "user",
    content: userInput,
  });

  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: tools,
    });

    const { finish_reason, message } = response.choices[0];

    if (finish_reason === "tool_calls" && message.tool_calls) {
      const functionName = message.tool_calls[0].function.name;
      const functionToCall = availableTools[functionName];
      const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
      const functionArgsArr = Object.values(functionArgs);
      const functionResponse = await functionToCall.apply(
        null,
        functionArgsArr
      );

      messages.push({
        role: "function",
        name: functionName,
        content: `
                The result of the last function was this: ${JSON.stringify(
                  functionResponse
                )}
                `,
      });
    } else if (finish_reason === "stop") {
      messages.push(message);
      return message.content;
    }
  }
  return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";
}

while (true) {
  const val = readLineSync.question(">>");
  if (val === "q") break;
  const response = await agent(val);

  console.log("response:", response);
}
