import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { ThoughtObject } from 'src/interfaces/ThoughtObject';

@Injectable()
export class ThoughtProfileService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async thoughts(user: number, username: string){
    const status = await this.MySqlDB.queryOne(
        `SELECT 
          UserIsPrivate as 'private',
          GetFollowStatus(?, UserId) as 'follow',
          (UserId = ?) as 'same',
          UserId as 'id'
        FROM ThidleDB.Users WHERE UserUsername = ?;`,
        [user, user, username],
      );
    
    if(!status) throw new NotFoundException({ success: false, error: 'U_NF', message: 'User not found.' });

    const get = (status.private === 1 && status.follow.status === 1) || status.same;

    if(!get) return [];

    const thoughts = await this.MySqlDB.query(`SELECT GetThought(ThoughtID, ?, 0, 1, 1) as result
    FROM ThidleDB.ThoughtsByDate AS Thoughts
    WHERE
      ThoughtMadeBy = ? 
      AND (
        CASE 
          WHEN ThoughtPrivacyStatus = 'P' THEN TRUE
          WHEN ThoughtPrivacyStatus = 'A' THEN FALSE
          WHEN ThoughtPrivacyStatus = 'F' THEN ((
          SELECT COUNT(*) 
            FROM Follows 
            WHERE FollowFrom = ? AND FollowTo = ThoughtMadeBy
        ) = 1 AND  (
            SELECT COUNT(*) 
            FROM Follows 
            WHERE FollowFrom = ThoughtMadeBy AND FollowTo = ?
        ) = 1)
          WHEN ThoughtPrivacyStatus = 'S' THEN (SELECT COUNT(*) FROM SelectedPeople WHERE SelectedFrom = ThoughtMadeBy AND SelectedUser = ?) = 1
          ELSE FALSE
        END OR ThoughtMadeBy = ?
      ) LIMIT 30;`, [
      user, 
      status.id, 
      user, user, user, user
    ]);

    return thoughts.map((i: { result: any }) => i.result);
  }
}
