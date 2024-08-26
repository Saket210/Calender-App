import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [EventModule, CloudinaryModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
