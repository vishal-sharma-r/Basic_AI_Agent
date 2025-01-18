import { connectAI } from "./ConnectAI.js";
import readlineSync from "readline-sync";
const client = connectAI();

function getWeatherDetails(city = "") {
  if (city.toLowerCase() === "jammu") return "2°C";
  if (city.toLowerCase() === "kashmir") return "-10°C";
  if (city.toLowerCase() === "delhi") return "6°C";
  if (city.toLowerCase() === "punjab") return "4°C";
  if (city.toLowerCase() === "shimla") return "3°C";
}

const tools = {
  getWeatherDetails: getWeatherDetails,
};

const System_Prompt = `
    Yoy are an AI assistant with START, PLAN, ACTION ,OBSERVATION  and output State.
    Wait for the user prompt and first plan using available tools.
    After planning , Take the action with appropriate tools and wait for Observation based on Action
    Once you get the Observation, Returns the AI response based on START propmt and observations.

    Strictly follow JSON output format as in example

    Available tools: 
    - function getWeatherDetails(city: string): string
    getWeatherDetails is a function that will accept city name as string input and return weather details
    
    EXAMPLE:
    START
    {"type": "user", "user" : "What is the sum of weather of jammu and delhi?"}
    {"type": "plan", "plan" : "I will call the getWeatherDetails for jammu"}
    {"type": "action", "function" : "getWeatherDetails", "input"" "jammu"}
    {"type": "observation", "observation" : "2°C"}
    {"type": "plan", "plan" : "I will call the getWeatherDetails for delhi"}
    {"type": "action", "function" : "getWeatherDetails", "input"" "delhi"}
    {"type": "observation", "observation" : "6°C"}
    {"type": "output", "outut" : "The sum of weather of jammu and delhi is 8°C"}

`;

const messages = [{ role: "system", content: System_Prompt }];
while (true) {
  const query = readlineSync.question(">>");
  const qu = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(qu) });
  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: messages,
      response_format: { type: "json_object" },
    });
    const res = chat.choices[0].message.content;
    messages.push({ role: "assistant", content: res });

    const call = JSON.parse(res);
    if (call.type === "output") {
      console.log(`🤖🤖: ${call.output}`);
      break;
    } else if (call.type === "action") {
      const fn = tools[call.function];
      const observation = fn(call.input);
      const obs = { type: "observation", observation: observation };
      messages.push({ role: "developer", content: JSON.stringify(obs) });
    }
  }
}
