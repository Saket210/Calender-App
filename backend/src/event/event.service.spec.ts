import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CronService } from '../cron/cron.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventStatus } from '@prisma/client';

describe('EventService', () => {
  let service: EventService;
  let prismaService: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let cloudinaryService: CloudinaryService;
  let cronService: CronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            notificationToken: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
        {
          provide: CronService,
          useValue: {
            scheduleCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    cronService = module.get<CronService>(CronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'dummytitle',
        description: 'dummydes',
        startTime: new Date(),
        endTime: new Date(),
      };
      const files: Express.Multer.File[] = [];

      const mockEvent = { id: '1', ...createEventDto };
      (prismaService.event.create as jest.Mock).mockResolvedValue(mockEvent);
      (prismaService.notificationToken.findMany as jest.Mock).mockResolvedValue(
        ['mock_token'],
      );

      const result = await service.create(createEventDto, files);

      expect(result).toEqual(mockEvent);
      expect(prismaService.event.create).toHaveBeenCalled();
      expect(cronService.scheduleCronJob).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find an event by id', async () => {
      const mockEvent = {
        id: '1',
        title: 'dummytitle',
        description: 'dummydes',
        startTime: new Date(),
        endTime: new Date(),
      };
      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(
        mockEvent,
      );

      const result = await service.findOne('1');

      expect(result).toEqual(mockEvent);
      expect(prismaService.event.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { media: true },
      });
    });
  });

  describe('find', () => {
    it('should find events based on criteria', async () => {
      const findEventDto: FindEventDto = {
        startTime: new Date(),
        endTime: new Date(),
        contains: expect.any(String),
        statuses: [expect.any(EventStatus)],
      };
      const mockEvents = [
        {
          id: '1',
          title: 'dummytitle',
          description: 'dummydes',
          startTime: new Date(),
          endTime: new Date(),
        },
      ];
      (prismaService.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await service.find(findEventDto);

      expect(result).toEqual(mockEvents);
      expect(prismaService.event.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const initialEvent: UpdateEventDto = {
        title: 'Initial Title',
        description: 'Initial Description',
        startTime: new Date(),
        endTime: new Date(),
        mediaIds: [expect.any(String)],
      };
      const files: Express.Multer.File[] = [];

      const mockEvent = { id: '1', ...initialEvent };
      const updatedEvent: UpdateEventDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        startTime: new Date(),
        endTime: new Date(),
        mediaIds: [expect.any(String)],
      };
      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(
        mockEvent,
      );
      (prismaService.event.update as jest.Mock).mockResolvedValue(updatedEvent);
      (prismaService.notificationToken.findMany as jest.Mock).mockResolvedValue(
        ['mock-token'],
      );

      const result = await service.update('1', updatedEvent, files);

      expect(result).toEqual(updatedEvent);
      expect(prismaService.event.findUnique).toHaveBeenCalled();
      expect(prismaService.event.update).toHaveBeenCalled();
      expect(cronService.scheduleCronJob).toHaveBeenCalled();
    });

    it('should throw an error if event is not found', async () => {
      const updatedEvent: UpdateEventDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        startTime: new Date(),
        endTime: new Date(),
        mediaIds: [expect.any(String)],
      };
      const files: Express.Multer.File[] = [];

      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('1', updatedEvent, files)).rejects.toThrow(
        new HttpException('Event not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('delete', () => {
    it('should delete an event', async () => {
      const mockEvent = {
        id: '1',
        title: 'dummytitle',
        description: 'dummydes',
        startTime: new Date(),
        endTime: new Date(),
      };
      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(
        mockEvent,
      );
      (prismaService.event.delete as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.delete('1');

      expect(result).toEqual(mockEvent);
      expect(prismaService.event.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(cronService.deleteCronJob).toHaveBeenCalledWith('1');
    });

    it('should throw an error if event is not found', async () => {
      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(
        new HttpException('Event not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
