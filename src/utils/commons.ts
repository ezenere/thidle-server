import { BadRequestException } from '@nestjs/common';
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
}) {
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
    `${file.ImageX}x${file.ImageY}.${file.MimeTypeExtension}`,
  );
}

export function CheckString(
  value: string,
  min: number,
  max: number,
  notEmpty: boolean,
  error: string,
  varName: string,
): string {
  value = value.trim();
  if (notEmpty && value.trim() === '')
    throw new BadRequestException({
      error,
      message: `${varName} cannot be empty or contain only blank spaces`,
    });
  if (value.length < min || max < value.length)
    throw new BadRequestException({
      error,
      message: `${varName} length must have between ${min} and ${max}`,
    });
  return value;
}
export function CheckMail(mail: string): string {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) return mail;
  throw new BadRequestException({
    error: 'mail',
    message: 'mail is not valid.',
  });
}
export function CheckInteger(
  value: number | string,
  min: number,
  max: number,
  notZero: boolean,
  error: string,
  varName: string,
) {
  value = parseInt(value.toString(), 10);
  if (notZero && (value === 0 || isNaN(value)))
    throw new BadRequestException({ error, message: `${varName} cannot be 0` });
  if (value < min || max < value)
    throw new BadRequestException({
      error,
      message: `${varName} must have a value between ${min} and ${max}`,
    });
  return value;
}

export function CheckUsername(username: string): string {
  const len = username.length;
  const permitedChars = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    '.',
    '_',
  ];
  if (len < 1 && len > 35)
    throw new BadRequestException({
      error: 'UN_LEN',
      message: `username must have between 1 and 35 characters.`,
    });
  if (
    [
      'ezenere',
      'about',
      'message',
      'messages',
      'thought',
      'thoughts',
      'trending',
      'trendings',
      'notification',
      'notifications',
      'discover',
      'home',
      'settings',
      'idlevoid',
      'profile',
      'settings',
      'configuration',
      'config',
      'admin',
      'fuck',
      'nigga',
    ].includes(username)
  )
    throw new BadRequestException({
      error: 'UN_FBDN',
      message: 'the chosen username is forbidden.',
    });

  let onlySymbols = true;
  for (let c = 0; c < len; c++) {
    const currentChar = username.substring(c, c + 1);
    if (currentChar != '.' && currentChar != '_') onlySymbols = false;
    if (!permitedChars.includes(currentChar))
      throw new BadRequestException({
        error: 'UN_CHAR',
        message: `username should contain only letters, numbers, dots and underscores.`,
      });
  }
  if (onlySymbols)
    throw new BadRequestException({
      error: 'UN_ONS',
      message: 'username should not contain only dots and/or underscores.',
    });
  return username;
}

export function CheckPassword(password: string): string{
  const upper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const lower = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  const number = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const special = ['.', '_', '`', '~', '\'', '"', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}', ',', '<', '>', '/', '?', '\\', '|', '+', '-', ';', ':'];

  let hasUpper = false;
  let hasLower = false;
  let hasNumber = false;
  let hasSpecial = false;

  const len = password.length;

  if(len < 8) throw new BadRequestException({error: "PASSW_LENGTH", message: "Password must have at least 8 characters."});
  for(let c = 0; c < len; c++){
      const currentChar = password.substring(c, c + 1);
      if(upper.includes(currentChar)) hasUpper = true;
      if(lower.includes(currentChar)) hasLower = true;
      if(number.includes(currentChar)) hasNumber = true;
      if(special.includes(currentChar)) hasSpecial = true;
  }

  if(!hasUpper || !hasLower || !hasNumber || !hasSpecial) throw new BadRequestException({error: "PASSW_INCOMPLETE", message: "Password must have at least ine upper case letter, one lower case letter, one number and one special character."});
  
  return password;
}

export function rand(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

export function RandomChars(len: number, aditional = '', replace = false) {
  let randomChars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890${aditional}`;
  if (replace) randomChars = aditional;
  let returnValue = '';
  while (len > returnValue.length) {
    const randomNumber = rand(0, randomChars.length - 1);
    returnValue += randomChars.substring(randomNumber, randomNumber+1);
  }
  return returnValue;
}

export function createCursor(bottom: string, top: string){
  return bottom && top ? `bt${Buffer.from(top).toString('base64')}b__t${Buffer.from(bottom).toString('base64')}tc` : Buffer.from('-==-').toString('base64')
}

export function retrieveCursor(cursor: string){
  if(typeof cursor === 'string'){
    const [topCur, bottomCur] = cursor.split('b__t');
    if(typeof topCur === 'string' && typeof bottomCur === 'string'){
      try {
        const top = Buffer.from(topCur.substring(2), 'base64').toString('ascii');
        const bottom = Buffer.from(bottomCur.substring(0, bottomCur.length-2), 'base64').toString('ascii');
        const r = /[0-9]{30}/;
        if(r.test(top) && r.test(bottom)){
          return {top, bottom}
        }
      } catch(_){}
    }
  }
  return {top: null, bottom: null}
}