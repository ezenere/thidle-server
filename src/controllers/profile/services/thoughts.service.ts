import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { ThoughtObject } from 'src/interfaces/ThoughtObject';
import { createCursor, retrieveCursor } from 'src/utils/commons';

@Injectable()
export class ThoughtProfileService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async thoughts(user: number, username: string, limit: number, cursor: string, mode: string){
    const status = await this.MySqlDB.queryOne(
        `SELECT 
          UserIsPrivate as 'private',
          GetFollowStatus(?, UserId) as 'follow',
          (UserId = ?) as 'same',
          UserId as 'id'
        FROM ThidleDB.Users WHERE UserUsername = ?;`,
        [user, user, username],
      );
    
    if(!status) throw new NotFoundException({ error: 'U_NF', message: 'User not found.' });

    if(!(status.private === 0 || (status.private === 1 && status.follow.status === 1) || status.same)) return [];

    const lastCursor = retrieveCursor(cursor)
    const modes = { more: { sql: 'AND ThoughtCursorID < ?', cursor: 'bottom' }, new: { sql: 'AND ThoughtCursorID > ?', cursor: 'top' } }
    const cursors = { top: lastCursor.top || null, bottom: lastCursor.bottom || null };
    const useCursor = !!(modes[mode] && cursors[modes[mode].cursor])

    const thoughts = (await this.MySqlDB.query(`SELECT GetThought(ThoughtID, ?, 2, 1, 1) as result, ThoughtCursorID as cur FROM (
        SELECT ThoughtsByDate.* FROM ThoughtsByDate 
        LEFT JOIN Follows as FM ON FM.FollowFrom = ThoughtMadeBy AND FM.FollowTo = ? AND (FM.FollowNeedApproval = 0 OR (FM.FollowNeedApproval = 1 AND FM.FollowApproveStatus = 'A'))
        LEFT JOIN SelectedPeople ON SelectedFrom = ThoughtMadeBy AND SelectedUser = ?
        WHERE
          ThoughtMadeBy = ? AND
          (
            CASE 
              WHEN ThoughtPrivacyStatus = 'P' THEN TRUE
              WHEN ThoughtPrivacyStatus = 'A' THEN TRUE
              WHEN ThoughtPrivacyStatus = 'F' THEN FM.FollowCreatedAt IS NOT NULL
              WHEN ThoughtPrivacyStatus = 'S' THEN SelectedPeople.SelectedDate IS NOT NULL
              ELSE FALSE
              END
          ) ${useCursor ? modes[mode].sql : ''}
        ORDER BY ThoughtCursorID DESC
        LIMIT 100
    ) Thoughts
    ORDER BY ThoughtCursorID DESC
    LIMIT 30`, 
    useCursor ? 
      [user, user, user, status.id, cursors[modes[mode].cursor]] :
      [user, user, user, status.id]
    )).map((i: { result: any, cur: string }) => {
      if(!cursors.top) cursors.top = i.cur;
      cursors.bottom = i.cur;
      return i.result
    });

    return {
      items: thoughts, 
      cursor: createCursor(cursors.bottom, cursors.top) 
    };
  }
}
