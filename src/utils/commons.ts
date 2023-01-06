import { createHash } from 'crypto';

export function RandomIdentifier(length: number, special = true) {
  length = length - 40;
  let result = '';
  const characters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789${
    special ? '.,;:-_=+()*&%$#@!?><{}[]' : ''
  }`;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${result}${createHash('sha1')
    .update((Date.now() + Math.random() + Math.random()).toString())
    .digest('hex')}`;
}
