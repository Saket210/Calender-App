import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SaveTokenDto } from './dto/save-token.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('save', () => {
    it('should call save with the provided token', async () => {
      const saveTokenDto: SaveTokenDto = { token: 'test-token' };
      await controller.save(saveTokenDto);
      expect(service.save).toHaveBeenCalledWith(saveTokenDto);
    });

    it('should return the result of save', async () => {
      const saveTokenDto: SaveTokenDto = { token: 'test-token' };
      const expectedResult = undefined;
      jest.spyOn(service, 'save').mockResolvedValue(expectedResult);

      const result = await controller.save(saveTokenDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
