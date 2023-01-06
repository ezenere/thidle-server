import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';

@Injectable()
export class LikeThoughtService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
  ) {}

  async post(id: number, userId: number): Promise<{ count: number }> {
    const thought = await this.MySqlDB.queryOne(
      `SELECT ThoughtID 
      FROM Thoughts 
      WHERE ThoughtID = ? 
      AND (
        CASE 
          WHEN ThoughtPrivacyStatus = 'P' THEN TRUE
          WHEN ThoughtPrivacyStatus = 'A' THEN TRUE
          WHEN ThoughtPrivacyStatus = 'F' THEN ((
            SELECT COUNT(*) 
            FROM Follows 
            WHERE FollowFrom = ? AND FollowTo = ThoughtMadeBy
          ) = 1 AND  (
            SELECT COUNT(*) 
            FROM Follows 
            WHERE FollowFrom = ThoughtMadeBy AND FollowTo = ?
          ) = 1)
          WHEN ThoughtPrivacyStatus = 'S' THEN (
            SELECT COUNT(*) 
            FROM SelectedPeople 
            WHERE SelectedFrom = ThoughtMadeBy AND SelectedUser = ?
          ) = 1
          ELSE FALSE
        END 
        OR ThoughtMadeBy = ?
      );`,
      [id, userId, userId, userId, userId, userId],
    );
    if (thought !== null) {
      const like = await this.MySqlDB.queryOne(
        'SELECT ThoughtLikeCreatedAt FROM ThoughtLikes WHERE ThoughtLikeThought = ? AND ThoughtLikeBy = ?;',
        [id, userId],
      );
      if (like === null)
        await this.MySqlDB.query(
          'INSERT INTO `ThidleDB`.`ThoughtLikes` (`ThoughtLikeThought`, `ThoughtLikeBy`) VALUES (?, ?);',
          [id, userId],
        );
      const count = (
        await this.MySqlDB.queryOne(
          'SELECT COUNT(*) as cnt FROM ThoughtLikes WHERE ThoughtLikeThought = ?;',
          [id],
        )
      ).cnt;
      return { count };
    } else {
      throw new NotFoundException({
        code: 'T_NF',
        error: 'Thought not found.',
      });
    }
  }

  async delete(id: number, userId: number): Promise<{ count: number }> {
    await this.MySqlDB.query(
      'DELETE FROM ThoughtLikes WHERE ThoughtLikeThought = ? AND ThoughtLikeBy = ?;',
      [id, userId],
    );
    const count = (
      await this.MySqlDB.queryOne(
        'SELECT COUNT(*) as cnt FROM ThoughtLikes WHERE ThoughtLikeThought = ?;',
        [id],
      )
    ).cnt;
    return { count };
  }
}
