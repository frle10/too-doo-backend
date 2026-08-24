import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Builds the database connection options from environment variables, falling
// back to the local Docker Postgres defaults (see docker-compose.yml) so the
// app runs with no .env file during development.
export function buildTypeOrmConfig(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: config.get<number>('DB_PORT', 47385),
    username: config.get<string>('DB_USERNAME', 'postgres'),
    password: config.get<string>('DB_PASSWORD', 'postgres'),
    database: config.get<string>('DB_NAME', 'too-doo-database'),
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
  };
}
