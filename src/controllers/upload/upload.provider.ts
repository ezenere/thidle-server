import { Inject, Injectable } from '@nestjs/common';
import { createWriteStream, WriteStream, promises } from 'fs';
import path, { join } from 'path';
import { MySqlConnection } from 'src/database/mysql.db';

@Injectable()
export class UploadProvider {
  static uploaders: FileUploader[] = [];

  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  static async mkPath(type: string, date: Date, key: string) {
    const p = join(
      process.env.filePath,
      type,
      date.getFullYear().toString(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
      date.getHours().toString().padStart(2, '0'),
      date.getMinutes().toString().padStart(2, '0'),
      date.getSeconds().toString().padStart(2, '0'),
      key,
    );

    await promises.mkdir(p, { recursive: true });

    return p;
  }

  static clearUploader(key: string) {
    this.uploaders.splice(
      this.uploaders.findIndex((i) => {
        i.key === key;
      }),
      1,
    );
  }

  async getInfo(key: string, user: number, upload = false) {
    try {
      const data = await this.MySqlDB.queryOne(
        `SELECT FileID, FileName, FileHash, FileCreation, FileTo, FileSize, FileUploaded FROM UploadFiles WHERE ${
          upload ? 'FileUploadHash = ? AND FileBy = ?' : 'FileHash = ?'
        }`,
        upload ? [key, user] : [key],
      );

      if (data) return data;
      else throw new Error('File not found');
    } catch (err) {
      console.log('mysql error', err);
    }
  }

  getUploader(key: string, user: number): FileUploader | null {
    return UploadProvider.uploaders.find(
      (i) => i.uploadKey === key && i.user === user,
    )
  }

  async write(key: string, buffer: Buffer, user: number) {
    let file = this.getUploader(key, user);
    if (!file) {
      const info = await this.getInfo(key, user, true);
      if (!info) throw new Error('File not found');
      file = new FileUploader(
        info.FileID,
        info.FileHash,
        key,
        info.FileTo,
        info.FileSize,
        info.FileCreation,
        user,
        this.MySqlDB,
      );
      await file.init();
      UploadProvider.uploaders.push(file);
    }

    await file.write(buffer);

    return true;
  }

  async end(key: string, user: number, remove = false) {
    let file = this.getUploader(key, user);
    if (file) await file.end(remove);
    return file;
  }
}

class FileUploader {
  stream: WriteStream;
  uploadKey: string;
  key: string;
  type: string;
  expected_size: number;
  date: Date;
  user: number;
  id: number;
  sql: MySqlConnection;
  size = 0;
  inited = false;
  path = '';

  constructor(
    id: number,
    key: string,
    uploadKey: string,
    type: string,
    size: number,
    date: string | number,
    user: number,
    sql: MySqlConnection,
  ) {
    this.id = id;
    this.key = key;
    this.uploadKey = uploadKey;
    this.type = type;
    this.expected_size = size;
    this.user = user;
    this.sql = sql;
    this.date = new Date(date);
  }

  async init() {
    if (!this.inited) {
      this.path = await UploadProvider.mkPath(this.type, this.date, this.key);
      this.stream = createWriteStream(join(this.path.toString(), 'file'), {
        flags: 'a',
        encoding: 'binary',
      });

      await this.sql.query(
        'UPDATE UploadFiles SET FileUploadStart = NOW() WHERE FileHash = ?',
        [this.key],
      );

      this.inited = true;
    } else return false;
  }

  async write(buffer: Buffer) {
    if (!this.inited) return false;

    this.size += buffer.length;

    if (this.expected_size >= this.size) {
      try {
        new Promise((resolve, reject) => {
          this.stream.write(buffer, (e) => {
            if (e) reject('File stream Error');
            else {
              this.sql
                .query(
                  'UPDATE UploadFiles SET FileSegments = FileSegments + 1 WHERE FileHash = ?',
                  [this.key],
                )
                .then(() => {
                  resolve(true);
                })
                .catch((e) => {
                  reject(e);
                });
            }
          });
        });
      } catch (e) {
        await this.end(true);
        throw new Error('File stream error');
      }
    } else {
      await this.end(true);
      throw new Error('File is bigger than expected');
    }
  }

  async end(remove = false) {
    this.stream.close();
    UploadProvider.clearUploader(this.key);
    if (remove) {
      await this.sql.query('DELETE FROM UploadFiles WHERE FileHash = ?', [
        this.key,
      ]);
      await promises.unlink(this.path.toString());
    } else {
      await this.sql.query(
        'UPDATE UploadFiles SET FileUploaded = 1, FileUploadEnd = NOW() WHERE FileHash = ?',
        [this.key],
      );
    }
  }
}
