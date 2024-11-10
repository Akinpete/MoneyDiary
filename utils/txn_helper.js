import OpenAI from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Set up OpenAI client

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const TransactionFormat = z.object({
    type: z.enum(['debit', 'credit']),
    amount: z.number(),
    recipient: z.string(),
    text: z.string()
});

export default async function runcheck() {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
            { role: "system", content: "Extract the transaction data from the prompt. Add empty value (don't write anything) if something is not specified. Parse and reword prompt for easy logging to a vector database and send back as text. add empty value to 'recipient' if transaction data denotes POS or ATM withdrawal, at best, add empty value if it has POS/ATM at all. Any transaction done on self should have 'self' as recipient. For example - 'I bought jeans for 20,000 naira today' should have 'self' as recipient" },
            { role: "user", content: `paid ODORBN induction fee 10000naira
                `}
        ],
        response_format: zodResponseFormat(TransactionFormat, "Transaction_format"),
    })

    const response = completion.choices[0].message;

    const isEmpty = Object.values(response.parsed).some(value => value === '');

    if (response.parsed && response.parsed.amount !== 0 && !isEmpty) {
        return response.parsed;
    } else {
        return null;
    }    

}

const response = await runcheck();
console.log(response);

