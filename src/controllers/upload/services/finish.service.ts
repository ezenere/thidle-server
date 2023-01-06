import {
    Inject,
    Injectable,
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
import { Afterburner } from 'src/afterburner/afterburner';
  import { MySqlConnection } from 'src/database/mysql.db';
  import { RandomIdentifier } from 'src/utils/commons';
import { UploadProvider } from '../upload.provider';
  
  @Injectable()
  export class FinishUploadService {
    constructor(
      private readonly up: UploadProvider,
      @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
    ) {}
  
    async sendToProfile(
      key: string,
      user: number,
      x: number,
      y: number,
      scale: number,
    ): Promise<{ status: boolean }> {
      const file = await this.up.end(key, user);
      
      if(!file) throw new NotFoundException({
        error: 'UP_NF',
        message: 'Upload file not found',
      });

      const img = await Afterburner.adjustImage(file.path, 450, 450, x, y, scale);

      try {
        const image = await this.MySqlDB.query(`INSERT INTO Images (
            ImageCreatedBy, 
            ImageAlt, 
            ImageX, 
            ImageY, 
            ImageSize, 
            ImageFile, 
            ImageMime
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`, [user, 'Profile', img.width, img.height, img.size, file.id, img.mime]);
        await this.MySqlDB.query('UPDATE Users SET UserProfilePicture = ? WHERE UserId = ?', [image.insertId, user]);

        return { status: true };
      } catch(e) {
        throw new InternalServerErrorException({
            error: 'DBE',
            message: 'Database error.'
        })
      }
    }
  }
  