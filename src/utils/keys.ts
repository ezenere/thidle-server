import { HttpException } from '@nestjs/common';
import { createHash, generateKeyPair } from 'crypto';
import { JWE, JWK } from 'node-jose';
import { MySqlConnection } from 'src/database/mysql.db';

async function generateECKeys(): Promise<{
  public: Buffer;
  private: Buffer;
}> {
  return new Promise((resolve, reject) => {
    generateKeyPair(
      'ec',
      {
        namedCurve: 'secp521r1', // Options

        publicKeyEncoding: {
          type: 'spki',
          format: 'der',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'der',
        },
      },
      async (e, publicBuffer, privateBuffer) => {
        if (e) reject(e);
        else resolve({ public: publicBuffer, private: privateBuffer });
      },
    );
  });
}

async function CreateTokenHash(
  conn: MySqlConnection,
  uid: number,
  type: string,
  creation: number,
  expiration: number,
): Promise<string> {
  const hash = createHash('sha256')
    .update(
      (
        Date.now() +
        Math.random() +
        Math.random() +
        Math.random() +
        Math.random() +
        Math.random()
      ).toString() + uid,
    )
    .digest('hex');

  await conn.query(
    'INSERT INTO `ThidleDB`.`Tokens` (`TokenUser`, `TokenHash`, `TokenType`, `TokenCreation`, `TokenExpiration`, `TokenInvalidated`) VALUES (?, ?, ?, ?, ?, 0);',
    [uid, hash, type, creation, expiration],
  );

  return hash;
}

export async function RevokeToken(
  conn: MySqlConnection,
  uid: number,
  hash: string,
  type: string,
): Promise<boolean> {
  await conn.query(
    'UPDATE Tokens SET TokenRevokeDate = ?, TokenInvalidated = 1 WHERE TokenUser = ? AND TokenHash = ? AND TokenType = ?;',
    [Date.now(), uid, hash, type],
  );

  return true;
}

async function JWEToken(pk: Buffer, token: any, uid: number): Promise<string> {
  return Buffer.from(
    JSON.stringify(
      await JWEEncrypt(
        pk,
        `${token.protected}.${token.iv}.${token.ciphertext}.${
          token.tag
        }.${Buffer.from(uid.toString()).toString('base64')}`,
      ),
    ),
  ).toString('base64');
}

export async function CreateJWEToken(
  conn: MySqlConnection,
  uid: number,
  upk: Buffer,
  uspk: Buffer,
) {
  const creation = Date.now();
  const expiration = creation + 30 * 60 * 1000;
  const tokenHash = await CreateTokenHash(conn, uid, 'T', creation, expiration);

  const token = await JWEEncrypt(uspk, {
    id: uid,
    iss: creation,
    exp: expiration,
    hash: tokenHash,
    type: 'TOKEN',
  });

  return [await JWEToken(upk, token, uid), tokenHash];
}

export async function CreateJWERevalidateToken(
  conn: MySqlConnection,
  uid: number,
  upk: Buffer,
  uspk: Buffer,
  th: string,
) {
  const creation = Date.now();
  const expiration = creation + 2 * 31 * 24 * 60 * 60 * 1000;

  const tokenHash = await CreateTokenHash(conn, uid, 'R', creation, expiration);

  const token = await JWEEncrypt(uspk, {
    id: uid,
    iss: creation,
    exp: expiration,
    hash: tokenHash,
    token: th,
    type: 'REVALIDATE_TOKEN',
  });

  return JWEToken(upk, token, uid);
}

export async function DecryptJWEToken(token: string, conn: MySqlConnection) {
  if (!token) throw new HttpException('Invalid Token 0', 403);

  const tokenParts = token.split('.');

  if (tokenParts.length !== 5) throw new HttpException('Invalid Token 1', 403);

  const priv = {
      protected: tokenParts[0],
      iv: tokenParts[1],
      ciphertext: tokenParts[2],
      tag: tokenParts[3],
    },
    uid = parseInt(Buffer.from(tokenParts[4], 'base64').toString());

  const privateKey = (
    await conn.queryOne(
      'SELECT UserServerPrivateKey FROM Users WHERE UserID = ?',
      [uid],
    )
  )['UserServerPrivateKey'];

  const userDecrypted = await JWEDecrypt(privateKey, priv);

  if (userDecrypted.id === uid)
    throw new HttpException('Token match error', 403);

  return JSON.parse(userDecrypted.payload.toString());
}

export async function CheckKeys(user: any, conn: MySqlConnection) {
  if (!user.UserPublicKey || !user.UserPrivateKey) {
    const keys = await generateECKeys();
    await conn.query(
      'UPDATE Users SET UserPublicKey = ?, UserPrivateKey = ? WHERE UserID = ?',
      [keys.public, keys.private, user.UserId],
    );
    user.UserPublicKey = keys.public;
    user.UserPrivateKey = keys.private;
  }

  if (!user.UserServerPrivateKey || !user.UserServerPublicKey) {
    const keys = await generateECKeys();
    await conn.query(
      'UPDATE Users SET UserServerPrivateKey = ?, UserServerPublicKey = ? WHERE UserID = ?',
      [keys.private, keys.public, user.UserId],
    );
    user.UserServerPrivateKey = keys.private;
    user.UserServerPublicKey = keys.public;
  }
}

export async function JWEEncrypt(
  publicBuffer: Buffer,
  data:
    | {
        [key: string]:
          | string
          | number
          | Buffer
          | Array<string | number | Buffer>;
      }
    | string
    | number,
): Promise<any> {
  const publicKey = await JWK.asKey(publicBuffer, 'spki');
  return await JWE.createEncrypt(publicKey)
    .update(typeof data === 'object' ? JSON.stringify(data) : data)
    .final();
}

export async function JWEDecrypt(keyBuffer: Buffer, data: any): Promise<any> {
  const key = await JWK.asKey(keyBuffer, 'pkcs8');
  return await JWE.createDecrypt(key).decrypt(data);
}

export async function CreateFullTokens(
  conn: MySqlConnection,
  uid: number,
  upk: Buffer,
  uspk: Buffer,
  uprivk: Buffer,
): Promise<{ t: string; k: string; r: string }> {
  const [jwe, hash] = await CreateJWEToken(conn, uid, upk, uspk);
  const revalidate = await CreateJWERevalidateToken(conn, uid, upk, uspk, hash);

  return {
    t: jwe,
    r: revalidate,
    k: Buffer.from(uprivk).toString('base64'),
  };
}
