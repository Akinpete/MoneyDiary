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

const DataFormat = z.object({
    asking_time: z.string().describe("If the query is about time, write yes, not about time? leave it empty"),
    date: z.object({
        today: z.string().describe("Today's date"),
        date1: z.string(),
        date2: z.string(),
    }),
    names: z.array(z.string().describe('Names of places, people, or things from prompt')),
    context: z.string().describe("Additional context that might be helpfulor like summary if valid")
});

// const date_today = new Date().toISOString();
function getCurrentDate() {
    return new Date().toISOString();
}

export async function runcheckQuery(prompt) {
    const date_today = getCurrentDate();
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
            { role: "system", content: `Purpose:

"You are an assistant designed to retrieve transaction details from prompts. Use today’s date as the reference and follow all instructions carefully to extract transaction data accurately."
Date Extraction Rules:

"Note today’s date as ${date_today}. Parse for any specific dates or relative time indicators in the prompt (like 'yesterday,' '2 weeks ago,' etc.). If found, convert these relative terms into ISO date format (YYYY-MM-DDTHH:mm:ss.sssZ - with hours,min,seconds still intact) based on today’s date. You may retrieve a maximum of two dates, labeled date1 and date2. If there are no dates, leave all values empty. Extract the name of things that was bought or name of people, usually just proper nouns from the prompt and add them to 'names' "
Validation:

"Only extract data if the prompt logically pertains to a financial transaction or question (e.g., a query that someone might record in a transaction diary). If not, leave all fields empty. Do not create any data not explicitly stated in the prompt. Most times, the prompt come as a request. Use this to acknowledge if 'context' is valid. If it is a financial transaction record question, Please add the context. 'asking_time' returns empty value normally, EXCEPT if the prompt meaning is about asking for the time a transaction happen, then return 'yes'"
Expected Output Structure:

"Return the data in the  format described (fill with an empty string '' if data is missing or if the prompt is invalid) 
"For the context, express the date in datestring, and derive it implicitly from the date_today variable.`}
,
            { role: "user", content: `${prompt}` }
        ],
        response_format: zodResponseFormat(DataFormat, "Data_format"),
    })

    const response = completion.choices[0].message;

    // return response.parsed;

    if (response.parsed && response.parsed.context) {
        if (response.parsed.date.date1 && response.parsed.asking_time === "") {
            return response.parsed;
        } else {
            return response.parsed;
        }
    } else {
        return null;
    }    

    // // const isEmpty = Object.values(response.parsed).some(value => value === '');

    // if (response.parsed && response.parsed.amount !== 0 && !isEmpty) {
    //     return response.parsed;
    // } else {
    //     return null;
    // }    

}

export const is_valid_query = async (prompt) => {
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout exceeded'));
            }, 10000); // 10 seconds
        });

        const response = await Promise.race([
            runcheckQuery(prompt),
            timeoutPromise
        ]);

        if (!response) {
            return null
        } else {
            return response
        }
    } catch (error) {
        console.error('Error processing transaction:', error);
    }
}


export async function generate_reply(question, data) {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant and analyst. You will be given a data(an array of transaction details) and a question(the question that you're being asked). I need you to answer the question in the most humanly possible way using data from each transaction detail. Make your answer relevant, brief and succint. Picture it like this, You are a transaction record librarian. Clients ask you these questions regularly to retrieve data from their diary. What you will do is just simply look at the data ptovided and think deeply. It might involve calculations here and there, but most times you will look at the array of data and pick the most valuable data relevant to the question, use it to string a reply together that answers the question perfectly. If after all these, you can't seem to figure out the answer, just reply -'Sorry, I don't seem to understand your question, Can you ask in a simpler manner?'" },
        { role: "user", content: `This is the original question - ${question}. Here's the data needed - ${data}` }
    ],
      model: "gpt-4o-mini",
      max_completion_tokens: 100
    });    
  
    console.log(completion.choices[0]);
    return completion.choices[0].message.content;
  }




const response = await runcheckQuery('List my transaction for today');
console.log(response);

// Be strict with this prompt handling. The prompt is like an entry in a transactions diary, so act on behalf of the personal as personal book keeper and accountant (first, guess where money is coming from and where it is headed. If money is coming out of the account of the owner of the diary, it is a debit transaction, if money is entering the account of the owner of the transaction diary, it is a 'credit' transaction). Extract the transaction data from the prompt. Add empty value (don't write anything) if something is not specified or the prompt doesn't make financial, logical sense and doesn't relate to transaction records! Parse and reword prompt for easy logging to a vector database and send back as text. add empty value to 'recipient' if transaction data denotes POS or ATM withdrawal, at best, add empty value if it has POS/ATM at all. ONLY 'credit' transaction prompt should have 'me' as recipient. You are professional book keeper and accountant, you can't add data to the transaction details or remove from it. It can cause bankruptcy and that is bad for business. Send empty values if you are told to formulate transaction or bring in whatever that is not in the prompt.  If the prompt denote an expense with 'recipient' tag being empty, tag recipient to be 'vendor', else make recipient an empty value. Utterly reject a prompt with 'POS' or 'ATM' in it

// const response = await runcheck();
// console.log(response);

// "Extract the transaction data from the prompt. Add empty value (don't write anything) if something is not specified. Parse and reword prompt for easy logging to a vector database and send back as text. add empty value to 'recipient' if transaction data denotes POS or ATM withdrawal, at best, add empty value if it has POS/ATM at all. Any transaction done on self should have 'self' as recipient. You are a book keeper, you can't add data to the transaction details or remove from it. It can cause bankruptcy and that is bad for business. Send empty values if you are told to formulate transaction or bring in whatever that is not in the prompt."