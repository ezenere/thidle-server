import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { ThoughtObject } from 'src/interfaces/ThoughtObject';
import { URequest } from 'src/interfaces/URequest';
import { createCursor, retrieveCursor } from 'src/utils/commons';

@Injectable()
export class ThoughtMainService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async getMain(
    userId: number,
    limit: number,
    cursor: string,
    mode: string
  ): Promise<{items: Array<ThoughtObject>, cursor: string}> {
    try {
        // await this.MySqlDB.query(
        //   `SELECT GetThought(ThoughtID, ?, 2, 1, 1) as result
        //   FROM ThidleDB.ThoughtsByDate AS Thoughts
        //   WHERE
        //     (
        //       (
        //         ThoughtParent IS NULL AND
        //         (
        //           ThoughtMadeBy IN (
        //             SELECT FollowTo 
        //             FROM Follows 
        //             WHERE FollowFrom = ?
        //           ) OR (
        //             Thoughts.ThoughtMadeBy = ? AND 
        //             Thoughts.ThoughtParent IS NULL
        //           )
        //         ) AND (
        //           Thoughts.ThoughtParent IS NULL OR (
        //             Thoughts.ThoughtParent IS NOT NULL AND (
        //               SELECT Parent.ThoughtMadeBy 
        //               FROM Thoughts as Parent 
        //               WHERE Parent.ThoughtID = Thoughts.ThoughtParent
        //             ) NOT IN (
        //               SELECT FollowTo 
        //               FROM Follows 
        //               WHERE FollowFrom = ?
        //             )
        //           )
        //         )
        //       ) OR (
        //         ThoughtIsRethought = 1 AND
        //             Thoughts.ThoughtMadeBy IN (
        //           SELECT FollowTo 
        //           FROM Follows 
        //           WHERE FollowFrom = ?
        //         )
        //       )
        //     ) AND (
        //       CASE 
        //       WHEN ThoughtPrivacyStatus = 'P' THEN TRUE
        //         WHEN ThoughtPrivacyStatus = 'A' THEN TRUE
        //         WHEN ThoughtPrivacyStatus = 'F' THEN ((
        //         SELECT COUNT(*) 
        //           FROM Follows 
        //           WHERE FollowFrom = ? AND FollowTo = ThoughtMadeBy
        //       ) = 1 AND  (
        //           SELECT COUNT(*) 
        //           FROM Follows 
        //           WHERE FollowFrom = ThoughtMadeBy AND FollowTo = ?
        //       ) = 1)
        //         WHEN ThoughtPrivacyStatus = 'S' THEN (SELECT COUNT(*) FROM SelectedPeople WHERE SelectedFrom = ThoughtMadeBy AND SelectedUser = ?) = 1
        //         ELSE FALSE
        //       END OR ThoughtMadeBy = ?
        //     ) LIMIT 30;`,
        //   [userId, userId, userId, userId, userId, userId, userId, userId, userId],
        // )
      const lastCursor = retrieveCursor(cursor)
      const modes = { more: { sql: 'AND ThoughtCursorID < ?', cursor: 'bottom' }, new: { sql: 'AND ThoughtCursorID > ?', cursor: 'top' } }
      const cursors = { top: lastCursor.top || null, bottom: lastCursor.bottom || null };
      const useCursor = !!(modes[mode] && cursors[modes[mode].cursor])

      const result = (await this.MySqlDB.query(
          `SELECT GetThought(ThoughtID, ?, 2, 1, 1) as result, ThoughtCursorID as cur FROM (
            (
              SELECT ThoughtsByDate.*
              FROM ThoughtsByDate 
              WHERE ThoughtMadeBy = ? ${useCursor ? modes[mode].sql : ''}
              ORDER BY ThoughtCursorID DESC
              LIMIT 100
            )
          
            UNION
          
            (
              SELECT ThoughtsByDate.* FROM ThoughtsByDate 
              LEFT JOIN Follows as FM ON FM.FollowFrom = ThoughtMadeBy AND FM.FollowTo = ? AND (FM.FollowNeedApproval = 0 OR (FM.FollowNeedApproval = 1 AND FM.FollowApproveStatus = 'A'))
              LEFT JOIN SelectedPeople ON SelectedFrom = ThoughtMadeBy AND SelectedUser = ?
              WHERE
                ThoughtMadeBy IN (SELECT FollowTo FROM Follows WHERE FollowFrom = ? AND (FollowNeedApproval = 0 OR (FollowNeedApproval = 1 AND FollowApproveStatus = 'A'))) AND
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
            )
          ) Thoughts
          ORDER BY ThoughtCursorID DESC
          LIMIT 30`,
          useCursor ? 
            [userId, userId, cursors[modes[mode].cursor], userId, userId, userId, cursors[modes[mode].cursor]] : 
            [userId, userId, userId, userId, userId],
        )
      ).map((i) => {
        console.log('received')
        if(!cursors.top) cursors.top = i.cur;
        cursors.bottom = i.cur;
        return i.result
      });
      return { items: result, cursor: createCursor(cursors.bottom, cursors.top) };
    } catch (e) {
      console.log(e);
      return { items: [], cursor: null };
    }
  }

  async getThought(user: number, id: number, comments: number, depht: number){
    if(isNaN(id)) throw new BadRequestException({error: 'ID_NE_NUM', message: 'ID is not a number.'});

    const thought = this.MySqlDB.queryOne(`SELECT GetThought(ThoughtID, ?, ?, ?, 1) as result
    FROM ThidleDB.ThoughtsByDate AS Thoughts
    WHERE (CASE 
    WHEN ThoughtPrivacyStatus = 'P' THEN TRUE
      WHEN ThoughtPrivacyStatus = 'A' THEN TRUE
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
    END OR ThoughtMadeBy = ?) AND ThoughtID = ?`, [
      user, 
      Math.min(isNaN(comments) ? 0 : comments, 100), 
      Math.min(isNaN(depht) ? 1 : depht, 3), 
      user, user, user, user, 
      id
    ]);

    if(!thought) throw new NotFoundException({error: 'T_NF', message: 'Thought not found or you do not have permission to view it.'});

    return thought;
  }
}
