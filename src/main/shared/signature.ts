import { createHmac, timingSafeEqual } from 'node:crypto'
import { mainLogger } from './logger';

const secretDocSignKey = import.meta.env.MAIN_VITE_DOCUMENT_SIGN_KEY;

export const createSignature = (data: object) =>
  createHmac('sha256', secretDocSignKey)
    .update(JSON.stringify(data), 'utf8')
    .digest('hex');

export const equalSignature = (currentSignature: string, expectedSignature: string) => {
  const currentBuffer = Buffer.from(currentSignature, 'hex');

  if (currentBuffer.length !== 32) {
    mainLogger.error("Signature", `Invalid current signature: ${currentSignature}`);
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  
  return timingSafeEqual(currentBuffer, expectedBuffer)
}
