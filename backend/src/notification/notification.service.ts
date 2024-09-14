import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  async delete({ token }: SaveTokenDto) {
    const isTokenAvailable = await this.prisma.notificationToken.findFirst({
      where: {
        token,
      },
    });
    if (isTokenAvailable) {
      await this.prisma.notificationToken.delete({
        where: {
          id: isTokenAvailable.id,
        },
      });
    }
  }
}
