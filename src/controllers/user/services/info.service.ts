import { Inject, Injectable } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { UserInfoObject } from 'src/interfaces/UserInfoObject';

@Injectable()
export class InfoService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async getInfo(userId: number): Promise<UserInfoObject | null> {
    return await this.MySqlDB.queryOne(
      `SELECT 
        UserId as 'id',
        UserName as 'name', 
        UserUsername as 'username',
        DATE_FORMAT(UserBirthday, "%Y-%m-%d") as 'birthday',
        GetUserAdditionalInfo(UserId) as 'details',
        UserDescription as 'description',
        GetImage(UserProfilePicture) as 'picture',
        GetImage(UserProfileBackground) as 'background',
        UserIsPrivate as 'private'
      FROM ThidleDB.Users WHERE UserId = ?;`,
      [userId],
    );
  }
}
