import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lift } from './lift.entity';
import { LiftsService } from './lifts.service';
import { LiftsController } from './lifts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lift])],
  providers: [LiftsService],
  controllers: [LiftsController]
})
export class LiftsModule {}
