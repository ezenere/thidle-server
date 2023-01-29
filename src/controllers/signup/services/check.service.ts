import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { CheckUsername } from 'src/utils/commons';

@Injectable()
export class SignupCheckService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection
  ) {}

  async check(
    key: string,
    name: string,
  ): Promise<{ available: boolean }> {
    if(await this.MySqlDB.queryOne('SELECT * FROM ThidleDB.UserCreations WHERE CreationHash = ? AND UserConfirmDate IS NOT NULL AND UserCreated IS NULL', [key]) === null) throw new NotFoundException({
      error: 'CRT_NF',
      message: 'Creation not found'
    })

    const username = CheckUsername(name);
    
    return { available: (await this.MySqlDB.queryOne('SELECT UserID FROM Users WHERE UserUsername = ?', [username]) === null)}
  }
}
  