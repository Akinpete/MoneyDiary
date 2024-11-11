import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const TransactionFormat = z.object({
    type: z.string(),
    amount: z.number(),
    recipient: z.string(),
    text: z.string()
});

const systemPrompt = [
    "You are a transaction classifier that strictly follows these rules:",
    "",
    "DEBIT TRANSACTIONS (Money OUT):",
    "1. When the text shows money leaving the account:",
    "   - 'I sent [person] money'",
    "   - '[person] received money' (this means I sent it)",
    "   - 'Gave [person] money'",
    "   - 'Paid [person] money'",
    "   - 'Sent [person] money'",
    "",
    "CREDIT TRANSACTIONS (Money IN):",
    "1. When the text shows money entering the account:",
    "   - '[person] sent me money'",
    "   - 'I received money from [person]'",
    "   - 'Got money from [person]'",
    "",
    "CRITICAL RULE:",
    "- If someone 'received' money, it's ALWAYS a DEBIT",
    "- This means money went OUT to them",
    "- Example: 'John received 500' = DEBIT (money went to John)",
    "",
    "OUTPUT RULES:",
    "type: Must be DEBIT for money going out, including when someone 'received' money",
    "amount: Extract the numerical value",
    "recipient: The person who got the money",
    "text: Original description",
    "",
    "EXAMPLE MAPPINGS:",
    "'Ebenezer received 100' →",
    "{",
    "  type: 'DEBIT',",
    "  amount: 100,",
    "  recipient: 'Ebenezer',",
    "}",
    "",
    "'I sent Joe 200' →",
    "{",
    "  type: 'DEBIT',",
    "  amount: 200,",
    "  recipient: 'Joe',",
    "}",
    "",
    "'Mark sent me 300' →",
    "{",
    "  type: 'CREDIT',",
    "  amount: 300,",
    "  recipient: 'me',",
    "}",
].join('\n');

export default async function runcheck() {
    try {
        const completion = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-2024-08-06',
            messages: [
                { 
                    role: "system", 
                    content: systemPrompt
                },
                { 
                    role: "user", 
                    content: `bought fanta 400 naira as I was hungry`
                }
            ],
            response_format: zodResponseFormat(TransactionFormat, "Transaction_format"),
        });

        return completion.choices[0].message.parsed;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// If running directly
const runTest = async () => {
    const response = await runcheck();
    console.log(response);
};

// Run if this is the main module
if (import.meta.url === new URL(import.meta.url).href) {
    runTest();
}