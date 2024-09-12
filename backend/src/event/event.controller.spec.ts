import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventStatus } from '@prisma/client';
import { FindEventDto } from './dto/find-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;
  //   const mockPrismaService = {
  //     event: {
  //       findUnique: jest.fn(),
  //       findMany: jest.fn(),
  //       findOne: jest.fn(),
  //       create: jest.fn(),
  //       update: jest.fn(),
  //       delete: jest.fn(),
  //     },
  //   };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        // {
        //   provide: PrismaService,
        //   useValue: mockPrismaService,
        // },
        // {
        //   provide: CloudinaryService,
        //   useValue: {
        //     uploadFile: jest.fn(),
        //     deleteFile: jest.fn(),
        //   },
        // },
        // {
        //   provide: CronService,
        //   useValue: {
        //     scheduleCronJob: jest.fn(),
        //     deleteCronJob: jest.fn(),
        //   },
        // },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const startTime = new Date('2024-09-01T10:00:00Z');
      const endTime = new Date('2024-09-01T12:00:00Z');
      const createEventDto: CreateEventDto = {
        title: 'dummytitle',
        description: 'dummydes',
        startTime: startTime,
        endTime: endTime,
      };
      const files: Express.Multer.File[] = [];
      const result = {
        id: 'anyId',
        title: 'dummytitle',
        description: 'dummydes',
        startTime: startTime,
        endTime: endTime,
        status: EventStatus.Scheduled,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deleted: false,
        deletedAt: null,
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createEventDto, files)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createEventDto, files);
    });
  });

  describe('findOne', () => {
    it('should find one event', async () => {
      const id = 'some-id';
      const result = {
        id,
        title: 'dummytitle',
        description: 'dummydes',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        status: expect.any(EventStatus),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deleted: false,
        deletedAt: null,
        media: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('find', () => {
    it('should find events', async () => {
      const findEventDto: FindEventDto = {
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        statuses: [expect.any([EventStatus])],
        contains: expect.any(String),
      };
      const result = expect.any([
        {
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          status: expect.any(EventStatus),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deleted: false,
          deletedAt: null,
          media: [],
        },
      ]);

      jest.spyOn(service, 'find').mockResolvedValue(result);

      expect(await controller.find(findEventDto)).toBe(result);
      expect(service.find).toHaveBeenCalledWith(findEventDto);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const id = 'some-id';
      const updateEventDto: UpdateEventDto = {
        title: 'dummytitle',
        description: 'dummydes',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        mediaIds: [expect.any(String)],
      };
      const files: Express.Multer.File[] = [];
      const result = {
        id,
        title: 'dummytitle',
        description: 'dummydes',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        status: expect.any(EventStatus),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deleted: false,
        deletedAt: null,
        media: [],
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(id, updateEventDto, files)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, updateEventDto, files);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const id = 'some-id';
      const result = {
        id,
        title: expect.any(String),
        description: expect.any(String),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        status: expect.any(EventStatus),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deleted: expect.any(Boolean),
        deletedAt: null,
        media: [],
      };

      jest.spyOn(service, 'delete').mockResolvedValue(result);

      expect(await controller.deleteEvent(id)).toBe(result);
      expect(service.delete).toHaveBeenCalledWith(id);
    });
  });
});
