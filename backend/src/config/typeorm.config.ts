import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { mkdirSync } from 'fs';

const dbDir = join(__dirname, '..', '..', 'data');
mkdirSync(dbDir, { recursive: true });

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: join(dbDir, 'liftdoor.db'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true
};
