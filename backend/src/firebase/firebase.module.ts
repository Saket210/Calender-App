import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
