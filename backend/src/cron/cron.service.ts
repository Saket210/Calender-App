import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import * as moment from 'moment';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private jobs: { [key: string]: CronJob } = {};

  constructor(private readonly firebaseService: FirebaseService) {}

  createCronJob(id: string, runAt: string, task: () => void): void {
    const time = moment(runAt);
    const cronExpression = `${time.minute()} ${time.hour()} ${time.date()} ${time.month() + 1} *`;

    this.logger.log(`Creating job with cron expression: ${cronExpression}`);

    const job = new CronJob(cronExpression, () => {
      this.logger.log(`Executing job at ${moment().format()}`);
      task();
      job.stop();
      this.logger.log(
        `Job with ${id} stopped after execution at ${moment().format()}`,
      );
      delete this.jobs[id];
    });

    this.jobs[id] = job;
    job.start();
  }

  scheduleCronJob(
    id: string,
    timestamp: string,
    title: string,
    token: string,
  ): void {
    const job = this.jobs[id];
    if (job) {
      job.stop();
      delete this.jobs[id];
      this.logger.log(`job with ${id} deleted`);
    }
    this.createCronJob(id, timestamp, () => {
      const message = 'You have a calendar event';
      this.firebaseService.sendPushNotification(token, title, message);
    });
  }
  deleteCronJob(id: string): void {
    const job = this.jobs[id];
    if (job) {
      job.stop();
      delete this.jobs[id];
      this.logger.log(`job with ${id} deleted`);
    }
  }
}
