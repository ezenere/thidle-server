import { Features, identify, resize } from 'imagemagick';
import { promises } from 'fs';
import { InternalServerErrorException } from '@nestjs/common';
import * as gm from 'gm';
import { readFile, stat, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { RandomIdentifier } from 'src/utils/commons';

type ImageReturn = { width: number; height: number, size: number, mime: string }
type VideoInfo = { frame: number, fps: number, time: string, drop: number, speed: string };

export class Afterburner {
  static async image(path: string, size: number): Promise<ImageReturn> {
    try {
      const info = await this.imageInfo(`${path}/file`);
      let width = 0;
      let height = 0;
      if (info.width > info.height) {
        width = Math.min(size, info.width);
        height = Math.round((width / info.width) * info.height);
      } else {
        height = Math.min(size, info.height);
        width = Math.round((height / info.height) * info.width);
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
      .autoOrient()
      .resize(width, height)
      .noProfile()
      .setFormat('jpeg')
      .quality(85)
      .interlace('Line')
      .write(resultPath, async (err) => {
        await promises.unlink(`${path}/file`);
        if (err) reject({ error: 'IM_R_ERR', message: 'Resize image error.', err });
        else resolve({ width, height, size: await this.getSize(resultPath), mime: 'image/jpeg' });
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
      .autoOrient()
      .resize(rWidth, rHeight)
      .crop(width, height, x, y)
      .noProfile()
      .setFormat('jpeg')
      .quality(85)
      .interlace('Line')
      .write(resultPath, async (err) => {
        await promises.unlink(`${path}/file`);
        if (err) reject({ error: 'IM_R_ERR', message: 'Resize image error.' });
        else resolve({ width, height, size: await this.getSize(resultPath), mime: 'image/jpeg' });
      });
    });
  }

  static async cropImage(
    path: string,
    width: number,
    height: number,
    x: number,
    y: number,
    scale: number,
  ): Promise<ImageReturn> {
    return new Promise(async (resolve, reject) => {
      const info = await this.imageInfo(`${path}/file`);
      const format = { mime: 'image/jpeg', ext: 'jpg', format: 'jpeg', quality: 85 }
      if (info.format === 'GIF'){
        format.mime = 'image/gif';
        format.ext = 'gif';
        format.format = 'GIF';
        format.quality = 100;
      }

      const resultPath = `${path}/${width}x${height}.${format.ext}`;

      gm(`${path}/file`)
      .autoOrient()
      .setFormat(format.format)
      .quality(format.quality)
      .crop(scale, scale, x, y)
      .resize(width, height)
      .repage('+')
      .coalesce()
      .noProfile()
      .interlace(info.format === 'GIF' ? 'None' : 'Line')
      .write(resultPath, async (err) => {
        await promises.unlink(`${path}/file`);
        if (err) reject({ error: 'IM_R_ERR', message: 'Resize image error.' });
        else resolve({ width, height, size: await this.getSize(resultPath), mime: format.mime });
      });
    });
  }

  static async video(path: string, onData?: (i: VideoInfo) => void): Promise<false | {
    filenames: {master: string, segment: string, file: string};
    convertSizes: { name: string, width: number, height: number, buffsize: string, bitrate: string, audio: string };
    hasAudio: boolean;
    code: number;
    sizes: { width: number; height: number; }
  }>{
    const videoSizes = await new Promise<string[] | false>((resolve, reject) => {
      const ffprobe = spawn('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0', path]);
      let out = '';
      ffprobe.stdout.setEncoding('utf8');
      ffprobe.stderr.setEncoding('utf8');
      ffprobe.stdout.on('data', (data) => {
          console.log(data)
          out += data;
      });
      ffprobe.on('close', () => {
        out = out.trim().toString();
        resolve(out !== '' ? out.split('x') : false);
      });
    });
    if (videoSizes === false) return false;

    const originalSizes = {width: parseInt(videoSizes[0]), height: parseInt(videoSizes[1])}

    const hasAudio = await new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', ['-i', path, '-show_streams', '-select_streams', 'a', '-loglevel', 'error']);
        let out = '';
        ffprobe.stdout.setEncoding('utf8');
        ffprobe.stdout.on('data', (data) => {
          console.log(data)
          out += data;
        });
        ffprobe.on('close', () => {
          resolve(out.trim().length > 0);
        });
    });
    
    const sizes = [
        { name: '1080p', width: 1920, height: 1080, buffsize: '6M', bitrate: '2M', audio: 'audio1' },
        { name: '720p', width: 1280, height: 720, buffsize: '4M', bitrate: '1M', audio: 'audio1' },
        { name: '480p', width: 854, height: 480, buffsize: '2M', bitrate: '750k', audio: 'audio1' },
        { name: '360p', width: 640, height: 360, buffsize: '1.5M', bitrate: '500k', audio: 'audio1' },
        { name: '240p', width: 428, height: 240, buffsize: '500k', bitrate: '220k', audio: 'audio2' },
        { name: '144p', width: 256, height: 144, buffsize: '400k', bitrate: '120k', audio: 'audio2' },
    ];

    // Which size is bigger, if width, set height, if height set width, if they are equal, whatever
    const changePart = originalSizes.width > originalSizes.height ? 'height' : 'width';
    // Get the calc part, the oposite of the one that has the bigger size
    const calcPart = changePart === 'height' ? 'width' : 'height';
    // Get ratio between bigger part and little one
    const calcRatio = originalSizes[changePart]/originalSizes[calcPart];


    const convertSizes = [];
    for(let c = 0; c < sizes.length; c++){
      if(originalSizes[calcPart] >= sizes[c][calcPart]){
        const val = Math.round(calcRatio * sizes[c][calcPart]);

        convertSizes.push({
          ...sizes[c],
          [changePart]: val%2 == 1 ? val+1 : val
        })
      }
    }

    let convertCommand = ['-i', path];
    let streamMap = [];
    convertCommand = [...convertCommand, '-keyint_min', '150', '-g', '150', '-sc_threshold', '0', '-sn', '-dn', '-c:v', 'libx264'];


    convertSizes.forEach((item, index) => {
      convertCommand = [...convertCommand, `-map`, `0:v`, `-s:${index}`, `${item.width}x${item.height}`, `-b:v:${index}`, `${item.bitrate}`, `-bufsize:${index}`, `${item.buffsize}`];
      streamMap.push(`v:${index}`+(hasAudio ? `,agroup:${item.audio}` : ''));
    });

    if(hasAudio) {
      convertCommand = [...convertCommand, '-map', '0:a', '-b:a:0', '128k', '-map', '0:a', '-b:a:1', '48k', '-c:a', 'aac'];
      streamMap = ['a:0,agroup:audio1,default:yes,language:all', 'a:1,agroup:audio2,default:yes,language:all', ...streamMap];
    }

    const filenames = {
      master: `${RandomIdentifier(50, false)}.m3u8`,
      segment: `${RandomIdentifier(50, false)}%v.ts`,
      file: `${RandomIdentifier(50, false)}%v.m3u8`,
    }

    convertCommand = [
      ...convertCommand,
      '-ac', '1',
      '-r', '30',
      '-f', 'hls', 
      '-profile:v', 'high',
      '-level:v', '5',
      '-hls_time', '5',
      '-hls_playlist_type', 'vod',
      '-hls_flags', 'single_file',
      '-master_pl_name', filenames.master, 
      '-hls_segment_filename', filenames.segment,
      '-strftime_mkdir', '1',
      '-var_stream_map', `${streamMap.join(' ')}`,
      filenames.file
    ]

    console.log(convertCommand.join(' '))

    const data = await new Promise<any>((resolve) => {
      const ffmpeg = spawn('ffmpeg', convertCommand, {cwd: dirname(path)});
      ffmpeg.stdout.setEncoding('utf8');
      ffmpeg.stderr.setEncoding('utf8');
      ffmpeg.stdout.on('data', (data) => {
        console.log(data)
        let d = data.toString().trim();
        if (d.startsWith('frame=')) {
          d = d.replace(/= /g, '=');
          while (d.indexOf('  ') !== -1) d = d.replace(/  /g, ' ');
          if (typeof onData === 'function') onData(d.replace(/= /g, '=').replace(/  /g, ' ').split(' ').reduce((prev: VideoInfo, curr: string) => {
            const [k, v] = curr.split('=');
            if (['frame', 'fps', 'time', 'drop', 'speed'].includes(k)) prev[k] = v;
            return prev;
          }, {})); 
        }
      });
      ffmpeg.stderr.on('data', (data) => {
        console.log(data)
        let d = data.toString().trim();
        if (d.startsWith('frame=')) {
          d = d.replace(/= /g, '=');
          while (d.indexOf('  ') !== -1) d = d.replace(/  /g, ' ');
          if (typeof onData === 'function') onData(d.split(' ').reduce((prev: VideoInfo, curr: string) => {
            const [k, v] = curr.split('=');
            if (['frame', 'fps', 'time', 'drop', 'speed'].includes(k)) prev[k] = v;
            return prev;
          }, {})); 
        }
      })
      ffmpeg.on('close', async (code) => {
        const masterPath = join(dirname(path), filenames.master);
        let masterFile = await readFile(masterPath, 'ascii');
        masterFile = masterFile.replace(/audio\_1/g, 'audio_0');

        console.log('master file', masterFile);
        await writeFile(masterPath, masterFile, { flag: 'w' })

        resolve({filenames, convertSizes, hasAudio, code, sizes: originalSizes});
      });
    });

    return data;
  }
}
