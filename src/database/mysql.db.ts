import { createPool, Pool } from 'mysql2';

export class MySqlConnection {
  private connection: Pool;

  constructor() {
    const connection = createPool({
      host: '172.16.0.112',
      user: 'idlevoid',
      password: '123456789',
      database: 'ThidleDB',
      connectionLimit: 50,
      waitForConnections: true,
    });

    this.connection = connection;
  }
  async query(
    statement: string,
    vars?: Array<string | number | Buffer | Date>,
    full = false,
  ): Promise<any> {
    const result = await this.connection.promise().query(statement, vars);
    return full ? result : result[0];
  }
  async queryOne(
    statement: string,
    vars?: Array<string | number | Buffer | Date>,
  ) {
    return (await this.query(statement, vars))[0] || null;
  }
}
