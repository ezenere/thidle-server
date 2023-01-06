import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadProvider } from '../upload.provider';

@Injectable()
export class FileUploadService {
  constructor(private readonly up: UploadProvider) {}

  async upload(
    key: string,
    buffer: Buffer,
    userId: number,
  ): Promise<{ length: number }> {
    try {
      await this.up.write(key, buffer, userId);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException({
        error: 'UP_E',
        message: 'Upload Error.',
      });
    }
    /*

      TODO:
    
      Open file stream if not opened and store pointer into openFiles variable.
      If file handler is already set, get append length and check it.
      If file length is greater than expected, return error.
      Else append to file and return success;

      var stream = 
      stream.write(index + "\n");
    
    */
    return { length: buffer.length };
  }
}
