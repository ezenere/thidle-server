import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MySqlConnection } from 'src/database/mysql.db';
import { scryptSign } from 'src/utils/auth';
import { CheckPassword, CheckUsername } from 'src/utils/commons';
import { CheckKeys, CreateFullTokens } from 'src/utils/keys';

@Injectable()
export class SignupCreateService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection
  ) {}

  async finish(
    key: string,
    name: string,
    password: string,
  ): Promise<any> {
    const creation = await this.MySqlDB.queryOne('SELECT * FROM ThidleDB.UserCreations WHERE CreationHash = ? AND UserConfirmDate IS NOT NULL AND UserCreated IS NULL', [key]);
    
    if(creation === null) throw new NotFoundException({
      error: 'CRT_NF',
      message: 'Creation not found'
    });

    const username = CheckUsername(name);
    
    if(await this.MySqlDB.queryOne('SELECT UserID FROM Users WHERE UserUsername = ?', [username]) !== null) throw new ForbiddenException({
      error: 'UN_IN_USE',
      message: 'Username is already in use'
    });

    password = await scryptSign(CheckPassword(password));

    try{
        const result = await this.MySqlDB.query('INSERT INTO `ThidleDB`.`Users` (`UserName`, `UserUsername`, `UserBirthday`, `UserPassword`, `UserIsVerified`) VALUES (?, ?, ?, ?, ?);', [
            creation.UserCreationName,
            username,
            creation.UserBirthday,
            password,
            0
        ]);
        const userId = result.insertId;

        await this.MySqlDB.query('UPDATE `ThidleDB`.`UserCreations` SET `UserCreated` = ? WHERE `CreationHash` = ?;', [userId, key])

        await this.MySqlDB.query('INSERT INTO `ThidleDB`.`UserAdditionalInfo` (`UserID`, `UserPronoum`) VALUES (?, ?);', [userId, creation.UserPronoum]);

        await this.MySqlDB.query('INSERT INTO `ThidleDB`.`Mails` (`MailUser`, `MailAddress`, `MailVerificated`, `MailVerificationAt`) VALUES (?, ?, ?, ?);', [userId, creation.UserCreationMail, 1, creation.UserConfirmDate]);

        let user = await this.MySqlDB.queryOne('SELECT * FROM Users WHERE UserId = ?', [userId]);
        user = await CheckKeys(user, this.MySqlDB);

        const tokens = await CreateFullTokens(
          this.MySqlDB,
          user.UserId,
          user.UserPublicKey,
          user.UserServerPublicKey,
          user.UserPrivateKey,
        );

        return {
          ...tokens,
          redirect: '/'
        }
    } catch(e) {
        throw new InternalServerErrorException({
            error: 'DB',
            message: 'Database error'
        })
    }
  }
}
  