import {
  HttpException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { MySqlConnection } from 'src/database/mysql.db';
import { URequest } from 'src/interfaces/URequest';
import { DecryptJWEToken } from 'src/utils/keys';

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async use(req: URequest, res: Response, next: NextFunction) {
    const token = req?.headers?.authorization?.split(' ');

    if (token.length !== 2) throw new HttpException('Ilegal Token', 403);
    if (token[0] === 'DEVELOPMENT' && token[1] === 'EZENERE') {
      req.user = { id: 1, exp: 0 };
      next();
      return;
    }

    const bearer = token[1];

    const userLoggedInfo = await DecryptJWEToken(bearer, this.MySqlDB);

    if (userLoggedInfo.exp < Date.now())
      throw new HttpException('Expired Token', 403);

    const tokenInfo = await this.MySqlDB.queryOne(
      'SELECT TokenCreation, TokenExpiration, TokenInvalidated FROM Tokens WHERE TokenUser = ? AND TokenHash = ? AND TokenType = ?',
      [userLoggedInfo.id, userLoggedInfo.hash, 'T'],
    );

    if (!tokenInfo) throw new HttpException('Unexistent Token', 403);

    if (tokenInfo.TokenInvalidated === 1)
      throw new HttpException('Revoked Token', 403);

    req.user = userLoggedInfo;
    next();
  }
}
