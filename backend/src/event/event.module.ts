import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from 'src/cron/cron.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [CloudinaryModule, ScheduleModule.forRoot(), FirebaseModule],
  controllers: [EventController],
  providers: [EventService, PrismaService, CronService],
})
export class EventModule {}
