import { randomBytes, scrypt } from 'crypto';

export async function scryptSign(
  password: string,
  options?: {
    salt?: Buffer | string;
    keyLength?: number;
    saltLength?: number;
    cost?: number;
    blockSize?: number;
    parallelization?: number;
    maxmem?: number;
  },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = options?.salt || randomBytes(options?.saltLength || 32);
    const keyLength = options?.keyLength || 128;
    const cost = options?.cost || 32768;
    const blockSize = options?.blockSize || 10;
    const parallelization = options?.parallelization || 1;
    scrypt(
      password,
      salt,
      keyLength,
      {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem: options?.maxmem || 67108864,
      },
      (err, derivedKey) => {
        if (err) reject(err);
        else
          resolve(
            `${derivedKey.toString('base64')}:${salt.toString(
              'base64',
            )}&${keyLength.toString().padStart(3, '0')};${cost
              .toString()
              .padStart(6, '0')};${blockSize
              .toString()
              .padStart(2, '0')};${parallelization
              .toString()
              .padStart(2, '0')}`,
          );
      },
    );
  });
}

export async function scryptValidate(
  sign: string,
  password: string,
  maxmem?: number,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      const [hash, res1] = sign.split(':');
      const [salt, res2] = res1.split('&');
      const [keyLength, cost, blockSize, parallelization] = res2.split(';');
      scrypt(
        password,
        Buffer.from(salt, 'base64'),
        parseInt(keyLength),
        {
          N: parseInt(cost),
          r: parseInt(blockSize),
          p: parseInt(parallelization),
          maxmem: maxmem || 67108864,
        },
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey.toString('base64') === hash);
        },
      );
    } catch (err) {
      reject('Invalid Hash');
    }
  });
}
