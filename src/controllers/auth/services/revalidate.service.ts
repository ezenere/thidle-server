import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { MySqlConnection } from 'src/database/mysql.db';
import {
  CheckKeys,
  CreateFullTokens,
  DecryptJWEToken,
  RevokeToken,
} from 'src/utils/keys';

@Injectable()
export class RevalidateService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async revalidate(req: Request): Promise<any> {
    const bearer = req?.headers?.authorization?.split(' ')[1];

    const userLoggedInfo = await DecryptJWEToken(bearer, this.MySqlDB);

    if (userLoggedInfo.exp < Date.now())
      throw new HttpException('Expired Token', 401);

    const tokenInfo = await this.MySqlDB.queryOne(
      'SELECT TokenCreation, TokenExpiration, TokenInvalidated FROM Tokens WHERE TokenUser = ? AND TokenHash = ? AND TokenType = ?',
      [userLoggedInfo.id, userLoggedInfo.hash, 'R'],
    );

    if (!tokenInfo) throw new HttpException('Unexistent Token Revalidate', 401);

    if (tokenInfo.TokenInvalidated === 1)
      throw new HttpException('Revoked Token', 401);

    await RevokeToken(
      this.MySqlDB,
      userLoggedInfo.id,
      userLoggedInfo.token,
      'T',
    );
    await RevokeToken(
      this.MySqlDB,
      userLoggedInfo.id,
      userLoggedInfo.hash,
      'R',
    );

    const user = await this.MySqlDB.queryOne(
      `SELECT * FROM Users WHERE UserID = ?`,
      [userLoggedInfo.id],
    );

    if (!user) throw new HttpException('User not found!', 403);

    await CheckKeys(user, this.MySqlDB);

    return CreateFullTokens(
      this.MySqlDB,
      user.UserId,
      user.UserPublicKey,
      user.UserServerPublicKey,
      user.UserPrivateKey,
    );
  }
}
