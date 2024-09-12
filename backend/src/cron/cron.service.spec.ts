import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CronJob } from 'cron';
import * as moment from 'moment';

// jest.mock('cron');
jest.mock('cron', () => {
  const mScheduleJob = { start: jest.fn(), stop: jest.fn() };
  const mCronJob = jest.fn(() => mScheduleJob);
  return { CronJob: mCronJob };
});
jest.mock('../firebase/firebase.service');

describe('CronService', () => {
  let service: CronService;
  let firebaseService: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronService, FirebaseService],
    }).compile();

    service = module.get<CronService>(CronService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCronJob', () => {
    it('should create a cron job with correct expression', () => {
      const id = 'testJob';
      const currentTime = moment();
      const [minute, hour, day, month] = [
        currentTime.minute(),
        currentTime.hour(),
        currentTime.date(),
        currentTime.month() + 1,
      ];
      const task = jest.fn();

      service.createCronJob(id, currentTime.toISOString(), task);

      expect(CronJob).toHaveBeenCalledWith(
        `${minute} ${hour} ${day} ${month} *`,
        expect.any(Function),
      );
    });

    it('should execute the task and clean up when the job runs', () => {
      const id = 'testJob';
      const runAt = moment().add(5, 'second').toISOString();
      const task = jest.fn();

      service.createCronJob(id, runAt, task);

      expect(CronJob).toHaveBeenCalled();
      expect(task).not.toHaveBeenCalled();
      jest.advanceTimersByTime(10000);
      expect(task).toHaveBeenCalled();
    });
  });
});
