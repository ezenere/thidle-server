import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { scryptValidate } from 'src/utils/auth';
import {
  CheckKeys,
  CreateFullTokens,
  DecryptJWEToken,
  RevokeToken,
} from 'src/utils/keys';

@Injectable()
export class LoginService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async login(username: string, password: string): Promise<any> {
    const user = await this.MySqlDB.queryOne(
      `SELECT * FROM Users WHERE 
      UserUsername = ? OR 
      ? IN (SELECT MailAddress FROM Mails WHERE MailUser = UserID) OR
      ? IN (SELECT PhoneAddress FROM Phones WHERE PhoneUser = UserID)`,
      [username, username, username],
    );

    if (!user) throw new HttpException('User not found!', 403);

    await CheckKeys(user, this.MySqlDB);

    const passwordValid = await scryptValidate(user.UserPassword, password);

    if (!passwordValid)
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);

    return CreateFullTokens(
      this.MySqlDB,
      user.UserId,
      user.UserPublicKey,
      user.UserServerPublicKey,
      user.UserPrivateKey,
    );
  }

  async logout(bearer: string) {
    const userLoggedInfo = await DecryptJWEToken(bearer, this.MySqlDB);

    const tokenInfo = await this.MySqlDB.queryOne(
      'SELECT TokenCreation, TokenExpiration, TokenInvalidated FROM Tokens WHERE TokenUser = ? AND TokenHash = ? AND TokenType = ?',
      [userLoggedInfo.id, userLoggedInfo.hash, 'R'],
    );

    if (!tokenInfo) throw new HttpException('Unexistent Token', 401);

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

    return true;
  }
}
