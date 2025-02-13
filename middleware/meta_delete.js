import crypto from 'crypto';

export function parseSignedRequest(signedRequest) {
    const parts = signedRequest.split('.', 2);
    if (parts.length !== 2) {
      console.error('Invalid signed request format');
      return null;
    }
    
    const [encodedSig, payload] = parts;
    const sig = base64UrlDecode(encodedSig);
    const payloadBuffer = base64UrlDecode(payload);
    
    let data;
    try {
      data = JSON.parse(payloadBuffer.toString('utf8'));
    } catch (err) {
      console.error('Error parsing JSON payload:', err);
      return null;
    }
    
    // Compute expected signature using HMAC SHA-256
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest();
  
    // Use timingSafeEqual to avoid timing attacks
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
    // Replace URL-specific characters and add padding if needed
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64');
}

