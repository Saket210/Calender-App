import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    process.env.FIREBASE_ACCOUNT_KEY = JSON.stringify({
      type: 'service_account',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Firebase app in constructor', () => {
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: admin.credential.cert(expect.any(Function)),
    });
  });

  describe('sendPushNotification', () => {
    it('should send a push notification successfully', async () => {
      const sendMock = jest.fn().mockResolvedValue('success');
      (admin.messaging as jest.Mock).mockReturnValue({ send: sendMock });

      await service.sendPushNotification('token', 'Test Title', 'Test Body');

      expect(sendMock).toHaveBeenCalledWith({
        data: {
          title: 'Test Title',
          body: 'Test Body',
        },
        webpush: {
          fcmOptions: {
            link: 'http://localhost:3000',
          },
        },
        token: 'token',
      });
    });

    it('should log an error when sending fails', async () => {
      const sendMock = jest.fn().mockRejectedValue(new Error('Send failed'));
      (admin.messaging as jest.Mock).mockReturnValue({ send: sendMock });

      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await service.sendPushNotification('token', 'Test Title', 'Test Body');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error sending push notification:',
        new Error('Send failed'),
      );
    });
  });
});
