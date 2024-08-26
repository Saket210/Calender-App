import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { CronService } from 'src/cron/cron.service';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private cronService: CronService,
  ) {}

  async create(
    { title, description, startTime, endTime }: CreateEventDto,
    files: Express.Multer.File[],
  ) {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        return await this.cloudinary.uploadFile(file);
      }),
    );

    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        ...(uploadedFiles.length && {
          media: {
            createMany: {
              data: uploadedFiles.map((file) => {
                return {
                  cloudinaryId: file.public_id,
                  mediaUrl: file.url,
                  type: file.resource_type,
                };
              }),
            },
          },
        }),
      },
    });

    const notificationTokens = await this.prisma.notificationToken.findMany();

    if (notificationTokens) {
      notificationTokens.forEach((tokenItem) => {
        this.cronService.scheduleCronJob(
          event.id,
          startTime.toString(),
          title,
          tokenItem.token,
        );
      });
    }

    return event;
  }

  async findOne(id: string) {
    return await this.prisma.event.findUnique({
      where: { id },
      include: { media: true },
    });
  }

  async find({ startTime, endTime, contains, statuses }: FindEventDto) {
    return await this.prisma.event.findMany({
      where: {
        deleted: false,
        startTime: {
          lte: endTime,
          gte: startTime,
        },
        ...(contains && { title: { contains, mode: 'insensitive' } }),
        ...(!!statuses?.length && { status: { in: statuses } }),
      },
      include: {
        media: {
          select: {
            id: true,
            type: true,
            mediaUrl: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    { title, description, startTime, endTime, mediaIds = [] }: UpdateEventDto,
    files: Express.Multer.File[],
  ) {
    console.log(mediaIds);
    const uploadeFiles = await Promise.all(
      files.map(async (file) => {
        return await this.cloudinary.uploadFile(file);
      }),
    );

    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!existingEvent) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    const mediaToRemove = existingEvent.media.filter(
      (file) => !mediaIds.includes(file.id),
    );

    if (mediaToRemove.length)
      await Promise.all(
        mediaToRemove.map(
          async (file) => await this.cloudinary.deleteFile(file.cloudinaryId),
        ),
      );

    const notificationTokens = await this.prisma.notificationToken.findMany();

    if (notificationTokens) {
      notificationTokens.forEach((tokenItem) => {
        this.cronService.scheduleCronJob(
          id,
          startTime.toString(),
          title,
          tokenItem.token,
        );
      });
    }

    return await this.prisma.event.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        startTime,
        endTime,
        media: {
          ...(uploadeFiles.length && {
            createMany: {
              data: uploadeFiles.map((file) => ({
                mediaUrl: file.url,
                cloudinaryId: file.public_id,
                type: file.resource_type,
              })),
            },
          }),
          ...(mediaToRemove.length && {
            deleteMany: {
              id: { in: mediaToRemove.map((media) => media.id) },
            },
          }),
        },
      },
    });
  }

  async delete(id: string) {
    const existingEvent = await this.findOne(id);

    if (!existingEvent) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    if (existingEvent.media.length)
      await Promise.all(
        existingEvent.media.map(
          async (file) => await this.cloudinary.deleteFile(file.cloudinaryId),
        ),
      );

    this.cronService.deleteCronJob(id);

    return await this.prisma.event.delete({
      where: {
        id,
      },
    });
  }
}
