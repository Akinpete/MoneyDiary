import crypto from 'crypto';

export function parseSignedRequest(signedRequest, secret) {
    const [encodedSig, payload] = signedRequest.split('.');
    
    const sig = Buffer.from(encodedSig, 'base64');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
        console.error('Bad Signed JSON signature!');
        return null;
    }

    return data;
}

export function generateRandomCode(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}


export function base64UrlDecode(input) {
    return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

