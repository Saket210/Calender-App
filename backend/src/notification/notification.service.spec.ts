import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notificationToken: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('should create a new token if it does not exist', async () => {
      const token = 'test-token';
      prismaService.notificationToken.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      await service.save({ token });

      expect(prismaService.notificationToken.findFirst).toHaveBeenCalledWith({
        where: { token },
      });
      expect(prismaService.notificationToken.create).toHaveBeenCalledWith({
        data: { token },
      });
    });

    it('should not create a new token if it already exists', async () => {
      const token = 'existing-token';
      prismaService.notificationToken.findFirst = jest
        .fn()
        .mockResolvedValue({ token });

      await service.save({ token });

      expect(prismaService.notificationToken.findFirst).toHaveBeenCalledWith({
        where: { token },
      });
      expect(prismaService.notificationToken.create).not.toHaveBeenCalled();
    });
  });
});
