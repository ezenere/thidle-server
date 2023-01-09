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

    async sendToThought(
      key: string,
      user: number,
      id: number
    ): Promise<{ status: boolean }> {
      const file = this.up.getUploader(key, user);
      
      if(!file) throw new NotFoundException({
        error: 'UP_NF',
        message: 'Upload file not found',
      });

      try {
        if (file.type === 'I') {
          const img = await Afterburner.image(file.path, 3500);

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

          file.end();

          return { status: true };
        } else file.end(true);
      } catch(e) {
        file.end(true);
      }
      return { status: true };
    }
  
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
  
    async sendToBackground(
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

      const img = await Afterburner.adjustImage(file.path, 1600, 800, x, y, scale);

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
        await this.MySqlDB.query('UPDATE Users SET UserProfileBackground = ? WHERE UserId = ?', [image.insertId, user]);

        return { status: true };
      } catch(e) {
        throw new InternalServerErrorException({
            error: 'DBE',
            message: 'Database error.'
        })
      }
    }
  }
  