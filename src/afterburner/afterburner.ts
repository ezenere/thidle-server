import { Features, identify, resize } from 'imagemagick';
import { promises } from 'fs';
import { InternalServerErrorException } from '@nestjs/common';
import * as gm from 'gm';
import { stat } from 'fs/promises';

type ImageReturn = { width: number; height: number, size: number, mime: number }

export class Afterburner {
  static async image(path: string, size: number): Promise<ImageReturn> {
    try {
      const info = await this.imageInfo(`${path}/file`);
      let width = 0;
      let height = 0;
      if (info.width > info.height) {
        width = Math.min(size, info.width);
        height = Math.round((width / info.width) * height);
      } else {
        height = Math.min(size, info.height);
        width = Math.round((height / info.height) * width);
      }
      const filename = await this.resizeImage(path, width, height);

      return filename;
    } catch (err) {
      throw new InternalServerErrorException({ ...err });
    }
  }

  static async imageInfo(path: string): Promise<Features> {
    return new Promise((resolve, reject) => {
      identify(path, function (err, { width, height, format, depth }) {
        if (err) reject(err);
        const max = 65535;
        if (width <= max && height <= max) resolve({
            width,
            height,
            depth,
            format,
          });
        else reject({ error: 'IM_CN_ERR', message: 'Image height or width is bigger than 16 bit unsigned integer.' });
      });
    });
  }

  static async getSize(path: string) {
    return (await stat(path)).size;
  }

  static async resizeImage(
    path: string,
    width: number,
    height: number,
  ): Promise<ImageReturn> {
    return new Promise((resolve, reject) => {
      const resultPath = `${path}/${width}x${height}.jpg`

      gm(`${path}/file`)
      .resize(width, height)
      .noProfile()
      .setFormat('jpeg')
      .quality(85)
      .interlace('Line')
      .write(resultPath, async (err) => {
        await promises.unlink(`${path}/file`);
        if (err) reject({ error: 'IM_R_ERR', message: 'Resize image error.' });
        else resolve({ width, height, size: await this.getSize(resultPath), mime: 1 });
      });
    });
  }

  static async adjustImage(
    path: string,
    width: number,
    height: number,
    x: number,
    y: number,
    scale: number,
  ): Promise<ImageReturn> {
    return new Promise(async (resolve, reject) => {
      // Original Sizes
      const { height: oHeight, width: oWidth } = await this.imageInfo(`${path}/file`);
      
      // Original Ratio
      const orWidth = (width / oWidth);
      const orHeight = (height / oHeight);

      // Conversion Ratios
      const greaterSize = Math.max(orWidth, orHeight); 
      const wRatio = oWidth * greaterSize;
      const hRatio = oHeight * greaterSize;

      // Resized Sizes
      const rWidth = Math.round(scale * wRatio);
      const rHeight = Math.round(scale * hRatio);

      const resultPath = `${path}/${width}x${height}.jpg`;

      gm(`${path}/file`)
      .resize(rWidth, rHeight)
      .crop(width, height, x, y)
      .noProfile()
      .setFormat('jpeg')
      .quality(85)
      .interlace('Line')
      .write(resultPath, async (err) => {
        await promises.unlink(`${path}/file`);
        if (err) reject({ error: 'IM_R_ERR', message: 'Resize image error.' });
        else resolve({ width, height, size: await this.getSize(resultPath), mime: 1 });
      });
    });
  }
}
