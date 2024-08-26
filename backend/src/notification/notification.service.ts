import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveTokenDto } from './dto/save-token.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async save({ token }: SaveTokenDto) {
    const isAvailable = await this.prisma.notificationToken.findFirst({
      where: {
        token,
      },
    });
    if (!isAvailable) {
      await this.prisma.notificationToken.create({
        data: {
          token: token,
        },
      });
    }
  }
}
