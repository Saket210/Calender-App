# A calendar app with event scheduling and browser notifications.

## Features:
- Add calendar events on a specific date and time.
- Add images and videos to events.
- Edit and delete events.
- Receive background browser notifications at the event if the website is not in the foreground.
- Search for events with their title and filter by status.

# Backend 
- Backend built on NestJs using Cloudinary to store images and videos and Firebase to send browser notifications.

## Project Setup
```bash
$ npm install
```

## Add Backend Environment Variables
- DATABASE_URL= Your Mongodb database url
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_CLOUD_NAME
#### The above variables will be available on creating an account on Cloudinary.
- FIREBASE_ACCOUNT_KEY= add the path to .json file for connecting the backend to Firebase. 
## Compile and run backend

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

# Frontend
- Frontend built on React using FullCalender Api and Ant Design framework for basic UI components.

## Project Setup
```bash
$ npm install
```

## Add Frontend Environment Variables
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_FIREBASE_STORAGE_BUCKET
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- REACT_APP_FIREBASE_APP_ID
- REACT_APP_FIREBASE_MEASUREMENT_ID
#### All above variables will be available after connecting firebase with the web app.
- REACT_APP_FIREBASE_VAPIDKEY= will be available from firebase cloud messaging by generating web push certificates.
- REACT_APP_BACKEND_URL= BaseUrl at which the backend is running


## Compile and run frontend

```bash
# development
$ npm run start


