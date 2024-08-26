import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from 'src/cron/cron.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports: [CloudinaryModule, ScheduleModule.forRoot()],
  controllers: [EventController],
  providers: [EventService, PrismaService, CronService, FirebaseService],
})
export class EventModule {}
