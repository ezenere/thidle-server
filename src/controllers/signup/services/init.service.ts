import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RabbitMQ } from 'src/controllers/microservices/rabbitmq/rabbitmq.microservice';
import { MySqlConnection } from 'src/database/mysql.db';
import { URequest } from 'src/interfaces/URequest';
import {
  CheckInteger,
  CheckMail,
  CheckString,
  RandomChars,
  RandomIdentifier,
} from 'src/utils/commons';

const availablePronoums = { 'M': 1, 'F': 2, 'T': 3, 'N': 4 }

@Injectable()
export class SignupInitService {
  constructor(
    @Inject('MySqlDatabase') private readonly MySqlDB: MySqlConnection,
    @Inject('RabbitMQ') private readonly broker: RabbitMQ,
  ) {}

  async create(
    req: URequest,
    name: string,
    mail: string,
    bDay: number,
    bMonth: number,
    bYear: number,
    pronoum: string,
    invite: string,
  ): Promise<{ token: string }> {
    name = CheckString(name, 1, 75, true, 'NAME_INVALID', 'name');
    mail = CheckMail(mail);
    bDay = CheckInteger(bDay, 1, 31, true, 'BIRTH_DAY_INVALID', 'birthday day');
    bMonth = CheckInteger(
      bMonth,
      1,
      12,
      true,
      'BIRTH_MONTH_INVALID',
      'birthday month',
    );
    bYear = CheckInteger(
      bYear,
      new Date().getFullYear() - 120,
      new Date().getFullYear() - 10,
      true,
      'BIRTH_YEAR_INVALID',
      'birthday year',
    );
    invite = CheckString(invite, 15, 15, true, 'ERR:INVITE_INVALID', 'invite');

    if(await this.MySqlDB.queryOne('SELECT * FROM ThidleDB.Mails WHERE MailAddress = ? AND MailVerificated = 1', [mail]) !== null) throw new ForbiddenException({
      error: 'ADDR_IN_USE',
      message: 'Mail already in use!'
    });

    const invt = await this.MySqlDB.queryOne('SELECT * FROM ThidleDB.InviteCodes WHERE InviteCode = ?;', [invite])
    if(invt === null) throw new NotFoundException({
      error: 'INVT_UNKNOWN',
      message: 'Invite code is not valid!',
    });
    if(invt.InviteCodeUsed === 1) throw new BadRequestException({
      error: 'INVT_USED',
      message: 'Invite code already used!',
    });

    const token = RandomIdentifier(256, false);

    const code = RandomChars(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', true);

    if (!Object.keys(availablePronoums).includes(pronoum))
      throw new BadRequestException({
        error: 'P_INV',
        message: 'Pronoum is not valid!',
      });

    const d = new Date(bYear, bMonth - 1, bDay);
    if (
      d.getMonth() != bMonth -1 ||
      d.getDate() != bDay ||
      d.getFullYear() != bYear
    )
      throw new BadRequestException({
        error: 'DATE_INVALID',
        message: 'Birthday is not a valid date!',
      });

    this.MySqlDB.query(
      'INSERT INTO `ThidleDB`.`UserCreations` (`CreationHash`, `UserCreationIP`, `UserCreationName`, `UserCreationMail`, `UserBirthday`, `UserPronoum`, `UserInvite`, `UserConfirmCode`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [
        token,
        req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
        name,
        mail,
        `${bYear}-${bMonth.toString().padStart(2, '0')}-${bDay
          .toString()
          .padStart(2, '0')}`,
        availablePronoums[pronoum],
        invt.InviteCodeID,
        code,
      ],
    );

    await this.broker.sendToQueue(
      'sendmail',
      JSON.stringify({ name, code, mail }),
    );

    return { token };
  }

  async confirm(key: string, code: string): Promise<{ success: boolean }> {
    const creation = await this.MySqlDB.queryOne('SELECT * FROM ThidleDB.UserCreations WHERE CreationHash = ? AND UserConfirmDate IS NULL', [key]);
    if(creation.UserConfirmCodeTry < 5){
      if(creation.UserConfirmCode.toUpperCase() === code.toUpperCase()) {
        await this.MySqlDB.query('UPDATE ThidleDB.UserCreations SET UserConfirmDate = CURRENT_TIMESTAMP WHERE CreationHash = ?', [key]);
        return { success: true };
      } else {
        await this.MySqlDB.query('UPDATE ThidleDB.UserCreations SET UserConfirmCodeTry = UserConfirmCodeTry + 1 WHERE CreationHash = ?', [key]);
        throw new ForbiddenException({ success: false, error: 'CODE_ERR', message: 'Wrong code' });
      }
    } else {
      throw new ForbiddenException({ success: false, error: 'CODE_RETRY', message: 'Too many attempts' });
    }
  }
}
