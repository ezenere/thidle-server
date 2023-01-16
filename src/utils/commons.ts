import { createHash } from 'crypto';
import { join } from 'path';

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

export function GetPath(file: {
    FileCreation: string;
    FileHash: string;
    ImageX: number;
    ImageY: number;
    MimeTypeExtension: string;
  }){
  const dt = new Date(file.FileCreation);
  return join(
    '/opt', 
    'thidle',
    'I',
    dt.getFullYear().toString(),
    (dt.getMonth() + 1).toString().padStart(2, '0'),
    dt.getDate().toString().padStart(2, '0'),
    dt.getHours().toString().padStart(2, '0'),
    dt.getMinutes().toString().padStart(2, '0'),
    dt.getSeconds().toString().padStart(2, '0'),
    file.FileHash,
    `${file.ImageX}x${file.ImageY}.${file.MimeTypeExtension}`
  )
} 