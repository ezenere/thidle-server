import { Inject, Injectable } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';

@Injectable()
export class ProfileInfoService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async info(caller_id: number, username: string): Promise<any> {
    const status = await this.MySqlDB.queryOne(
      `SELECT 
        UserIsPrivate as 'private',
        GetFollowStatus(?, UserId) as 'follow',
        (UserId = ?) as 'same'
      FROM ThidleDB.Users WHERE UserUsername = ?;`,
      [caller_id, caller_id, username],
    );
    const get =
      (status.private === 1 && status.follow.status === 1) || status.same;
    return await this.MySqlDB.queryOne(
      `SELECT 
        UserName as 'name', 
        UserUsername as 'username',
        ` +
        (get
          ? `
            DATE_FORMAT(UserBirthday, "%m-%d") as 'birthday',
            GetUserAdditionalInfo(UserId) as 'details',
        `
          : '') +
        `
        JSON_OBJECT(
            'like', UserReceivedLikeCount,
            'comment', UserReceivedLikeCount,
            'observing', UserObservingCount,
            'observer', UserObserverCount,
            'media', UserMediaCount,
            'swift', UserFastMediaCount
        ) as 'count',
        UserDescription as 'description',
        GetImage(UserProfilePicture) as 'picture',
        GetImage(UserProfileBackground) as 'background',
        UserIsPrivate as 'private',
        GetFollowStatus(UserId, ?)  as 'followed',
        GetFollowStatus(?, UserId) as 'follow',
        UserIsVerified as 'verified',
        UserCreatedAt as 'creation'
      FROM ThidleDB.Users WHERE UserUsername = ?;`,
      [caller_id, caller_id, username],
    );
  }
}
