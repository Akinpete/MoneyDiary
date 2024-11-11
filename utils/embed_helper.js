import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export default async function get_embeddings(transaction_text) {
    transaction_text = transaction_text.replace(/\*|\n/g, ' ');
    const embeddings = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `${transaction_text}`,
        encoding_format: "float",
    });

    const embedding = embeddings.data[0].embedding;
    if (embedding) {
        return embedding;
    } else {
        return null;
    }    
}

// const f = await get_embeddings('omo ope');
// console.log(f);