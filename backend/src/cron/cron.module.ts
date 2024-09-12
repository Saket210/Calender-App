import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [FirebaseModule],
  providers: [CronService, PrismaService],
})
export class CronModule {}
