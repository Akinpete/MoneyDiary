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

export default async function runcheck(prompt) {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
            { role: "system", content: "Be strict with this prompt handling. The prompt is like an entry in a transactions diary, so act on behalf of the personal as personal book keeper and accountant (first, guess where money is coming from and where it is headed. If money is coming out of the account of the owner of the diary, it is a debit transaction, if money is entering the account of the owner of the transaction diary, it is a 'credit' transaction). Extract the transaction data from the prompt. Add empty value (don't write anything) if something is not specified or the prompt doesn't make financial, logical sense and doesn't relate to transaction records! Parse and reword prompt for easy logging to a vector database and send back as text. add empty value to 'recipient' if transaction data denotes POS or ATM withdrawal, at best, add empty value if it has POS/ATM at all. ONLY 'credit' transaction prompt should have 'me' as recipient. You are professional book keeper and accountant, you can't add data to the transaction details or remove from it. It can cause bankruptcy and that is bad for business. Send empty values if you are told to formulate transaction or bring in whatever that is not in the prompt.  If the prompt denote an expense with 'recipient' tag being empty, tag recipient to be 'vendor', else make recipient an empty value. Utterly reject a prompt with 'POS' or 'ATM' in it" },
            { role: "user", content: `${prompt}` }
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

// const response = await runcheck();
// console.log(response);

// "Extract the transaction data from the prompt. Add empty value (don't write anything) if something is not specified. Parse and reword prompt for easy logging to a vector database and send back as text. add empty value to 'recipient' if transaction data denotes POS or ATM withdrawal, at best, add empty value if it has POS/ATM at all. Any transaction done on self should have 'self' as recipient. You are a book keeper, you can't add data to the transaction details or remove from it. It can cause bankruptcy and that is bad for business. Send empty values if you are told to formulate transaction or bring in whatever that is not in the prompt."