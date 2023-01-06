import {
  Inject,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { RandomIdentifier } from 'src/utils/commons';

@Injectable()
export class InitUploadService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async init(
    name: string,
    mime: string,
    size: number,
    user: number,
  ): Promise<{ key: string }> {
    const availableTypes = { image: 'I', video: 'V', audio: 'A' };
    const type = (mime || '').split('/')[0];

    if (!Object.keys(availableTypes).includes(type))
      throw new BadRequestException({
        error: 'TYPE_NE',
        message: 'File type not found.',
      });
    const hash = RandomIdentifier(255, false);
    const uploadHash = RandomIdentifier(512, false);

    if (
      await this.MySqlDB.query(
        `INSERT INTO ThidleDB.UploadFiles (
        FileName, 
        FileHash, 
        FileUploaded, 
        FileUploadHash, 
        FileSegments, 
        FileTo, 
        FileSize,
        FileBy
      ) VALUES (
        ?, ?, 0, ?, 0, ?, ?, ?
      );`,
        [name, hash, uploadHash, availableTypes[type], size, user],
      )
    )
      return { key: uploadHash };
    else
      throw new InternalServerErrorException({
        error: 'DBE',
        message: 'Database Error.',
      });
  }
}
