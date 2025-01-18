import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();
export function connectAI() {
    const client = new OpenAI({
        apiKey: process.env.AI_AGENT_OPENAI_KEY,
    });
    return client;
}
