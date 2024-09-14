import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import * as moment from 'moment';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventStatus } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private jobs: { [key: string]: CronJob } = {};

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  createCronJob(id: string, runAt: string, task: () => void): void {
    const time = moment(runAt);
    const cronExpression = `${time.minute()} ${time.hour()} ${time.date()} ${time.month() + 1} *`;

    this.logger.log(`Creating job with cron expression: ${cronExpression}`);

    const job = new CronJob(cronExpression, async () => {
      this.logger.log(`Executing job at ${moment().format()}`);

      await this.prisma.event.update({
        where: { id },
        data: {
          status: EventStatus.Ongoing,
        },
      });

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

  scheduleCronJob(id: string, timestamp: string, title: string): void {
    const job = this.jobs[id];
    if (job) {
      const newTime = moment(timestamp);
      const newCronTime = `${newTime.minute()} ${newTime.hour()} ${newTime.date()} ${newTime.month() + 1} *`;
      if (job.cronTime.source === newCronTime) {
        return;
      }
      job.stop();
      delete this.jobs[id];
      this.logger.log(`job with ${id} deleted`);
    }
    this.createCronJob(id, timestamp, async () => {
      const message = 'You have a calendar event';
      const tokens = await this.prisma.notificationToken.findMany();
      if (tokens) {
        tokens.map((token) =>
          this.firebaseService.sendPushNotification(
            token.token,
            title,
            message,
          ),
        );
      }
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
