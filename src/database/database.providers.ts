import { MySqlConnection } from './mysql.db';

export const databaseProviders = [
  {
    provide: 'MySqlDatabase',
    useClass: MySqlConnection,
  },
];
