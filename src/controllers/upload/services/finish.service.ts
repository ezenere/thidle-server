import {
    Inject,
    Injectable,
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
import { join } from 'path';
import { Afterburner } from 'src/afterburner/afterburner';
import { MySqlConnection } from 'src/database/mysql.db';
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

      const thought = await this.MySqlDB.queryOne(`
        SELECT * 
        FROM Thoughts 
        WHERE 
          ThoughtID = ? AND 
          ThoughtPublished = ? AND 
          ThoughtMadeBy = ? AND 
          ThoughtIsRethought = ?;
        `,
        [id, 0, user, 0]
      );

      if(!thought) throw new NotFoundException({
        error: 'T_NF',
        message: 'Thought not found.'
      });

      console.log(file)

      try {
        if (file.type === 'I') {
          const img = await Afterburner.image(file.path, 2560);

          const image = await this.MySqlDB.query(`INSERT INTO Images (
            ImageCreatedBy, 
            ImageAlt, 
            ImageX, 
            ImageY, 
            ImageSize, 
            ImageFile, 
            ImageMime
          ) VALUES (?, ?, ?, ?, ?, ?, (SELECT MimeTypeID FROM MimeTypes WHERE MimeTypeName = ?));`, [user, 'Thought Image', img.width, img.height, img.size, file.id, img.mime]);
          await this.MySqlDB.query('INSERT INTO `ThidleDB`.`ThoughtImages` (`ThoughtImage`, `ThoughtImageThought`, `ThoughtImageUser`) VALUES (?, ?, ?);', [image.insertId, id, user]);

          file.end();

          return (await this.MySqlDB.queryOne('SELECT ThidleDB.GetImage(?) as image;', [image.insertId])).image;
        } else if (file.type === 'V') {
          console.log('got to vídeo')

          const videos = await Afterburner.video(join(file.path, 'file'), (m) => console.log(m));
          if(videos !== false) {
            if(videos.code === 0){

              const video = await this.MySqlDB.query(`INSERT INTO ThidleDB.Videos (
                VideoName, 
                VideoOriginalX, 
                VideoOriginalY, 
                VideoColorSpace, 
                VideoIsHDR, 
                VideoManifestName, 
                VideoFile,
                VideoCreatedBy
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, ['UNKNOWN', videos.sizes.width, videos.sizes.height, 'RGB', 0, videos.filenames.master, file.id, user]);
              await this.MySqlDB.query('INSERT INTO `ThidleDB`.`ThoughtVideos` (`ThoughtVideo`, `ThoughtVideoThought`, `ThoughtVideoUser`) VALUES (?, ?, ?);', [video.insertId, id, user]);
            
              return (await this.MySqlDB.queryOne('SELECT ThidleDB.GetVideo(?) as video;', [video.insertId])).video;
            } else file.end(true);
          } else file.end(true);
        } else file.end(true);
      } catch(e) {
        console.log(e);
        file.end(true);
      }
      return { status: false };
    }
  
    async sendToProfile(
      key: string,
      user: number,
      x: number,
      y: number,
      scale: number,
    ): Promise<{ alt: string; url: string }> {
      const file = this.up.getUploader(key, user);
      
      if(!file) throw new NotFoundException({
        error: 'UP_NF',
        message: 'Upload file not found',
      });

      if(file.type !== 'I'){
        file.end(true);
        throw new BadRequestException({error: 'MIME_ERR', message: 'File type is not an image!'})
      }

      const img = await Afterburner.cropImage(file.path, 450, 450, x, y, scale);

      try {
        const image = await this.MySqlDB.query(`INSERT INTO Images (
            ImageCreatedBy, 
            ImageAlt, 
            ImageX, 
            ImageY, 
            ImageSize, 
            ImageFile, 
            ImageMime
        ) VALUES (?, ?, ?, ?, ?, ?, (SELECT MimeTypeID FROM MimeTypes WHERE MimeTypeName = ?));`, [user, 'Profile', img.width, img.height, img.size, file.id, img.mime]);
        await this.MySqlDB.query('UPDATE Users SET UserProfilePicture = ? WHERE UserId = ?', [image.insertId, user]);

        return (await this.MySqlDB.queryOne('SELECT ThidleDB.GetImage(?) as image;', [image.insertId])).image;
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
    ): Promise<{ alt: string; url: string }> {
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
        ) VALUES (?, ?, ?, ?, ?, ?, (SELECT MimeTypeID FROM MimeTypes WHERE MimeTypeName = ?));`, [user, 'Profile', img.width, img.height, img.size, file.id, img.mime]);
        await this.MySqlDB.query('UPDATE Users SET UserProfileBackground = ? WHERE UserId = ?', [image.insertId, user]);

        return (await this.MySqlDB.queryOne('SELECT ThidleDB.GetImage(?) as image;', [image.insertId])).image;;
      } catch(e) {
        throw new InternalServerErrorException({
            error: 'DBE',
            message: 'Database error.'
        })
      }
    }
  }
  