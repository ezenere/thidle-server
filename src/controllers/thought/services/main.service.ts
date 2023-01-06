import { Inject, Injectable } from '@nestjs/common';
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
          `SELECT GetThought(ThoughtID, ?) as result
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
                  WHERE FollowFrom = 1 AND FollowTo = ThoughtMadeBy
              ) = 1 AND  (
                  SELECT COUNT(*) 
                  FROM Follows 
                  WHERE FollowFrom = ThoughtMadeBy AND FollowTo = 1
              ) = 1)
                WHEN ThoughtPrivacyStatus = 'S' THEN (SELECT COUNT(*) FROM SelectedPeople WHERE SelectedFrom = ThoughtMadeBy AND SelectedUser = 1) = 1
                ELSE FALSE
              END OR ThoughtMadeBy = 1
            ) LIMIT 30;`,
          [userId, userId, userId, userId, userId],
        )
      ).map((i) => i.result);
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
