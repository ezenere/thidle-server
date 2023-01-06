import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  GoneException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { DefaultResponseObject } from 'src/interfaces/DefaultResponseObject';

@Injectable()
export class NewThoughtService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async post(
    text: string,
    activeAt: string,
    privacy: string,
    commentPrivacy: string,
    parent: number,
    embeed: number,
    userId: number,
  ): Promise<{ id: number }> {
    const thoughtText = text ? (text.trim() !== '' ? text : null) : null;
    const activeDate = activeAt ? new Date(activeAt) : null;

    // P = Public
    // F = Friends
    // S = Selected People
    // A = Anonymous
    const availablePrivacy = ['P', 'F', 'S', 'A'];

    if (!activeAt || activeDate.getTime() >= new Date().getTime()) {
      if (
        availablePrivacy.includes(privacy) &&
        availablePrivacy.includes(commentPrivacy)
      ) {
        try {
          const final = await this.MySqlDB.query(
            `INSERT INTO ThidleDB.Thoughts (
                ThoughtMadeBy, 
                ThoughtText, 
                ThoughtActiveAt, 
                ThoughtPrivacyStatus, 
                ThoughtCommentPrivacy, 
                ThoughtParent, 
                ThoughtEmbeed, 
                ThoughtPublished
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              userId,
              thoughtText,
              activeDate,
              privacy,
              commentPrivacy,
              parent,
              embeed,
              0,
            ],
          );
          return { id: final.insertId };
        } catch (e) {
          throw new InternalServerErrorException({
            code: 'DBE',
            error: 'Database Error.' + e + parent,
          });
        }
      }
      throw new BadRequestException({
        code: 'PRV_NE',
        error: 'Privacy type not acceptable.',
      });
    }
    throw new BadRequestException({
      code: 'ACT_DT_LEN',
      error: 'Thought activation time is lower than current time.',
    });
  }

  async finish(id: number, userId: number): Promise<DefaultResponseObject> {
    const result = await this.MySqlDB.queryOne(
      `SELECT *,
      (SELECT COUNT(*) FROM ThoughtAudios WHERE ThoughtAudioThought = ThoughtID) as audios,
      (SELECT COUNT(*) FROM ThoughtImages WHERE ThoughtImageThought = ThoughtID) as images,
      (SELECT COUNT(*) FROM ThoughtVideos WHERE ThoughtVideoThought = ThoughtID) as videos 
      FROM Thoughts 
      WHERE ThoughtID = ?;`,
      [id],
    );

    if (result === null)
      throw new NotFoundException({
        error: 'TNE',
        message: 'Thought not found.',
      });

    if (result.ThoughtMadeBy !== userId)
      throw new ForbiddenException({
        error: 'T_UP_NA',
        message: 'You do not own this thought.',
      });

    if (result.ThoughtPublished === 1)
      throw new BadRequestException({
        error: 'T_AR_P',
        message: 'The selected thought is already published.',
      });

    if (
      result.ThoughtText === null &&
      result.audios === 0 &&
      result.images === 0 &&
      result.videos === 0
    ) {
      try {
        await this.MySqlDB.query('DELETE FROM Thoughts WHERE ThoughtID = ?', [
          id,
        ]);
      } catch (e) {
        throw new InternalServerErrorException({
          error: 'DBE',
          message: 'Database Error.',
        });
      }
      throw new GoneException({
        error: 'T_NE_DT',
        message: 'Thought has no data.',
      });
    } else {
      try {
        await this.MySqlDB.query(
          `UPDATE Thoughts 
          SET ThoughtActiveAt = IF(ThoughtActiveAt IS NULL, NOW(), ThoughtActiveAt), ThoughtPublished = 1 
          WHERE ThoughtID = ?`,
          [id],
        );
        return {
          success: true,
          data: true,
        };
      } catch (e) {
        throw new InternalServerErrorException({
          error: 'DBE',
          message: 'Database Error.',
        });
      }
    }
  }
}
