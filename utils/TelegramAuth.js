const { createHmac, createHash } = await import('node:crypto');
import dotenv from 'dotenv';
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;

export function checkTelegramAuthorization(authData) {
    // console.log(BOT_TOKEN);
    // Required fields check
    const requiredFields = ['hash', 'auth_date'];
    for (const field of requiredFields) {
        if (!(field in authData)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    const { hash: checkHash, ...dataToCheck } = authData;
    // console.log('Hash Check:',checkHash);
    // console.log('DataToCheck:', dataToCheck);
    const dataCheckString = Object
            .entries(dataToCheck)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    // console.log('STRING', dataCheckString);
    const secretKey = createHash('sha256').update(BOT_TOKEN).digest();
    const calculatedHash = createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

    if (calculatedHash !== checkHash) {
        throw new Error('Payload check failed!');
    } 

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const authTimestamp = parseInt(dataToCheck.auth_date, 10);
    const MAX_AUTH_AGE = 86400;

    if (currentTimestamp - authTimestamp > MAX_AUTH_AGE) {
        throw new Error(`Authorization expired (older than ${MAX_AUTH_AGE} seconds)`);
    }

    return dataToCheck;

}