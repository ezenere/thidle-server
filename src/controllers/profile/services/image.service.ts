import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { MySqlConnection } from 'src/database/mysql.db';
import { GetPath } from 'src/utils/commons';

@Injectable()
export class ProfileImageService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async rmPicture(caller_id: number, username: string): Promise<any> {
    const file = await this.MySqlDB.queryOne(
      `SELECT ImageID, FileID, FileCreation, MimeTypeExtension, ImageX, ImageY, FileHash, ImageID, FileID, ImageAlt, MimeTypeName, ImageSize
      FROM ThidleDB.Users 
      INNER JOIN Images ON ImageID = UserProfilePicture
      INNER JOIN UploadFiles ON ImageFile = FileID
      INNER JOIN MimeTypes ON MimeTypeID = Images.ImageMime
      WHERE UserUsername = ? AND UserId = ?;`,
      [username, caller_id],
    );
    
    if (!file) throw new NotFoundException({
        error: 'P_I_NF',
        message: 'Profile picture not found or you dont have access to it.'
    });

    await this.MySqlDB.query('UPDATE Users SET UserProfilePicture = NULL WHERE UserId = ?', [caller_id]);
    await this.MySqlDB.query('DELETE FROM Images WHERE ImageID = ?', [file.ImageID]);
    await this.MySqlDB.query('DELETE FROM UploadFiles WHERE FileID = ?', [file.FileID]);
    await unlink(GetPath(file));

    return { success: true };
  }
}
