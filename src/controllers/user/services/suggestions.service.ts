import { Inject, Injectable } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { UserSuggestionObject } from 'src/interfaces/UserSuggestionObject';

@Injectable()
export class ProfileSuggestionsService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async suggestions(
    userId: number,
    limit: number,
    offset: number,
    exclude: string,
  ): Promise<Array<UserSuggestionObject>> {
    // return await this.MySqlDB.query(
    //   `SELECT
    //   UserId as 'id',
    //   UserName as 'name',
    //   UserUsername as 'username',
    //   UserDescription as 'description',
    //   GetImage(UserProfilePicture) as 'picture',
    //   UserIsPrivate as 'private',
    //   (
    //     SELECT COUNT(FollowTo)
    //     FROM Follows as FollowingFollows
    //     WHERE FollowingFollows.FollowTo = Users.UserId AND
    //     (
    //       FollowingFollows.FollowNeedApproval = 0 OR
    //       (
    //         FollowingFollows.FollowNeedApproval = 1 AND
    //         FollowingFollows.FollowApproveStatus = 'A'
    //       )
    //     ) AND
    //     FollowFrom IN (
    //       SELECT FollowTo
    //       FROM Follows as UserFollowing
    //       WHERE FollowFrom = ?
    //     )
    //   ) knowFollows
    //   FROM ThidleDB.Users
    //   LEFT JOIN Follows ON FollowFrom = ? AND FollowTo = Users.UserId
    //   WHERE FollowFrom IS NULL AND Users.UserId != ? ${
    //     exclude ? `AND Users.UserUsername != ?` : ''
    //   }
    //   ORDER BY knowFollows DESC, Users.UserId ASC LIMIT ? OFFSET ?;`,
    //   exclude
    //     ? [userId, userId, userId, exclude, limit, offset]
    //     : [userId, userId, userId, limit, offset],
    // );

    return await this.MySqlDB.query(
      `SELECT * FROM ((SELECT 
      UserId as 'id',
      UserName as 'name', 
      UserUsername as 'username',
      UserDescription as 'description',
      GetImage(UserProfilePicture) as 'picture',
      UserIsPrivate as 'private' FROM (
        SELECT FollowTo, COUNT(*) as cnt
          FROM Follows as FollowingFollows 
          WHERE (
            FollowingFollows.FollowNeedApproval = 0 OR
            (
            FollowingFollows.FollowNeedApproval = 1 AND 
            FollowingFollows.FollowApproveStatus = 'A'
            )
          ) AND FollowFrom IN (
            SELECT FollowTo 
            FROM Follows as UserFollowing 
            WHERE FollowFrom = ?
          )
          GROUP BY FollowingFollows.FollowTo
        ) knowFollows
        INNER JOIN Users ON knowFollows.FollowTo = Users.UserId
        LEFT JOIN Follows ON FollowFrom = ? AND Follows.FollowTo = Users.UserId
        WHERE FollowFrom IS NULL AND Users.UserId != ? ${
          exclude ? `AND Users.UserUsername != ?` : ''
        }
        ORDER BY knowFollows.cnt DESC, Users.UserId ASC LIMIT ? OFFSET ?)
        UNION
        (SELECT 
        UserId as 'id',
        UserName as 'name', 
        UserUsername as 'username',
        UserDescription as 'description',
        GetImage(UserProfilePicture) as 'picture',
        UserIsPrivate as 'private'
        FROM ThidleDB.Users
        LEFT JOIN (
          SELECT FollowTo, COUNT(*) as cnt
          FROM Follows as FollowingFollows 
          WHERE (
              FollowingFollows.FollowNeedApproval = 0 OR
              (
                FollowingFollows.FollowNeedApproval = 1 AND 
                FollowingFollows.FollowApproveStatus = 'A'
              )
            ) AND FollowFrom IN (
              SELECT FollowTo 
              FROM Follows as UserFollowing 
              WHERE FollowFrom = ?
            )
            GROUP BY FollowingFollows.FollowTo
          ) knowFollows ON knowFollows.FollowTo = Users.UserId
        LEFT JOIN Follows ON FollowFrom = ? AND Follows.FollowTo = Users.UserId
        WHERE FollowFrom IS NULL AND Users.UserId != ? AND knowFollows.FollowTo IS NULL ${
          exclude ? `AND Users.UserUsername != ?` : ''
        } LIMIT ? OFFSET ?)) Final LIMIT ?`,
      exclude
        ? [
            userId,
            userId,
            userId,
            exclude,
            limit,
            offset,
            userId,
            userId,
            userId,
            exclude,
            limit,
            offset,
            limit,
          ]
        : [
            userId,
            userId,
            userId,
            limit,
            offset,
            userId,
            userId,
            userId,
            limit,
            offset,
            limit,
          ],
    );
  }
}
