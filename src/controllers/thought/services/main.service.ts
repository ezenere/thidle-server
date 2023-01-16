import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { ThoughtObject } from 'src/interfaces/ThoughtObject';

@Injectable()
export class ThoughtMainService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async getMain(
    userId: number,
    min: number,
    offset: number,
    exclude: string,
  ): Promise<Array<ThoughtObject>> {
    try {
      return (
        await this.MySqlDB.query(
          `SELECT GetThought(ThoughtID, ?, 2, 1, 1) as result
          FROM ThidleDB.ThoughtsByDate AS Thoughts
          WHERE
            (
              (
                ThoughtParent IS NULL AND
                (
                  ThoughtMadeBy IN (
                    SELECT FollowTo 
                    FROM Follows 
                    WHERE FollowFrom = ?
                  ) OR (
                    Thoughts.ThoughtMadeBy = ? AND 
                    Thoughts.ThoughtParent IS NULL
                  )
                ) AND (
                  Thoughts.ThoughtParent IS NULL OR (
                    Thoughts.ThoughtParent IS NOT NULL AND (
                      SELECT Parent.ThoughtMadeBy 
                      FROM Thoughts as Parent 
                      WHERE Parent.ThoughtID = Thoughts.ThoughtParent
                    ) NOT IN (
                      SELECT FollowTo 
                      FROM Follows 
                      WHERE FollowFrom = ?
                    )
                  )
                )
              ) OR (
                ThoughtIsRethought = 1 AND
                    Thoughts.ThoughtMadeBy IN (
                  SELECT FollowTo 
                  FROM Follows 
                  WHERE FollowFrom = ?
                )
              )
            ) AND (
              CASE 
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
              END OR ThoughtMadeBy = ?
            ) LIMIT 30;`,
          [userId, userId, userId, userId, userId, userId, userId, userId, userId],
        )
      ).map((i) => i.result);
    } catch (e) {
      console.log(e);
      return [];
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
