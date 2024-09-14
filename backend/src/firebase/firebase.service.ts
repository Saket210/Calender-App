import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly notificationService: NotificationService) {
    const serviceAccount = process.env.FIREBASE_ACCOUNT_KEY as ServiceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log(admin);
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
  ): Promise<void> {
    try {
      const message = {
        data: {
          title,
          body,
        },
        token,
      };
      await admin.messaging().send(message);
      console.log(token);
      this.logger.log('Push notification sent successfully.');
    } catch (error) {
      console.log(error);
      if (error.errorInfo.code === 'messaging/mismatched-credential') {
        this.notificationService.delete({ token });
      }
      this.logger.error('Error sending push notification:', error);
    }
  }
}
