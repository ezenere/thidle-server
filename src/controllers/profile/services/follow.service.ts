import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';

@Injectable()
export class ProfileFollowService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async follow(caller_id: number, username: string): Promise<any> {
    const status = await this.MySqlDB.queryOne(
      `SELECT 
        UserId as 'id',
        UserIsPrivate as 'private',
        GetFollowStatus(?, UserId) as 'follow',
        (UserId = ?) as 'same'
      FROM ThidleDB.Users WHERE UserUsername = ?;`,
      [caller_id, caller_id, username],
    );

    if(!status) throw new NotFoundException({ error: 'U_NF', message: 'User not found.' });

    if (status.follow.status === 0 && status.same === 0) {
        console.log( [caller_id, status.id, status.private])
        try{
            await this.MySqlDB.query('INSERT INTO `ThidleDB`.`Follows` (`FollowFrom`, `FollowTo`, `FollowNeedApproval`) VALUES (?, ?, ?);', [caller_id, status.id, status.private]);
            return { status: status.private ? 2 : 1 }
        } catch(e) {
            return { status: 0 }
        }
    } else return { status: status.follow.status }
  }

  async unfollow(caller_id: number, username: string): Promise<any> {
    const status = await this.MySqlDB.queryOne(
      `SELECT 
        UserId as 'id',
        UserIsPrivate as 'private',
        GetFollowStatus(?, UserId) as 'follow',
        (UserId = ?) as 'same'
      FROM ThidleDB.Users WHERE UserUsername = ?;`,
      [caller_id, caller_id, username],
    );

    if(!status) throw new NotFoundException({ error: 'U_NF', message: 'User not found.' });

    if (status.follow.status !== 0 && status.same === 0) {
        try {
            await this.MySqlDB.query('DELETE FROM `ThidleDB`.`Follows` WHERE FollowFrom = ? AND FollowTo = ?;', [caller_id, status.id]);
            return { status: 0 }
        } catch(e) {
            return { status: status.follow.status }
        }
    } else return { status: 0 }
  }
}
