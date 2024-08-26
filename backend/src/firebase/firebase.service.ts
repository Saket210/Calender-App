import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    const serviceAccount = process.env.FIREBASE_ACCOUNT_KEY as ServiceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
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
        webpush: {
          fcmOptions: {
            link: 'http://localhost:3000',
          },
        },
        token,
      };

      await admin.messaging().send(message);
      this.logger.log('Push notification sent successfully.');
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
    }
  }
}
