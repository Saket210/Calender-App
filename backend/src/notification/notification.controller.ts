import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SaveTokenDto } from './dto/save-token.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/')
  async save(@Body() token: SaveTokenDto) {
    return await this.notificationService.save(token);
  }
}
