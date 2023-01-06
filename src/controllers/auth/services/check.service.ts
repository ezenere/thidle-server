import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';

@Injectable()
export class AuthCheckService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async check(username: string): Promise<any> {
    const user = await this.MySqlDB.queryOne(
      `SELECT * FROM Users WHERE 
      UserUsername = ? OR 
      ? IN (SELECT MailAddress FROM Mails WHERE MailUser = UserID) OR
      ? IN (SELECT PhoneAddress FROM Phones WHERE PhoneUser = UserID)`,
      [username, username, username],
    );

    if (!user) throw new HttpException('User not found!', HttpStatus.NOT_FOUND);

    return true;
  }
}
