import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encrypt(text: string) {
  const iv = Buffer.from(process.env.IV);
  const key = process.env.SECRET_KEY;

  const cipher = createCipheriv('aes-256-cbc', key, iv);

  return Buffer.concat([cipher.update(text), cipher.final()]).toString('hex');
}

export function decrypt(text: string) {
  const iv = Buffer.from(process.env.IV);
  const key = process.env.SECRET_KEY;

  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  const encryptText = Buffer.from(text, 'hex');

  return Buffer.concat([
    decipher.update(encryptText),
    decipher.final(),
  ]).toString();
}