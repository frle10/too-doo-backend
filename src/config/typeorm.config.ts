import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 47385,
  username: 'postgres',
  password: 'postgres',
  database: 'too-doo-database',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
