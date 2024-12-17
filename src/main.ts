import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DATABASE_MESSAGE } from './constants/message';
import * as bodyParser from 'body-parser';

import { WebSocketAuthAdapter } from './gateway/gateway.adapter';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '@auth/handle';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express';

const allowedOrigins = [
  'http://localhost:3000',
  'https://example.com', // Thay bằng domain bạn muốn cho phép
  'https://another-domain.com'
];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // app.enableCors({
  //   origin: [`${process.env.DOMAIN}` || 'http://localhost:3000'],
  //   methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  //   credentials: true
  // });
  app.enableCors({
    origin: (origin, callback) => {
      // Kiểm tra xem domain có nằm trong danh sách cho phép không
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Cho phép yêu cầu từ domain này
      } else {
        callback(new Error('Not allowed by CORS')); // Không cho phép các domain khác
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true
  });

  const jwtService = app.get(JwtService);
  const accountService = app.get(AccountService);
  const handleUserDB = app.get(HandleUserDatabase);
  app.useWebSocketAdapter(new WebSocketAuthAdapter(jwtService, accountService, handleUserDB));

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || 3000);

  console.log(DATABASE_MESSAGE.CONNECT);
  console.log(`Server is running: ${process.env.DOMAIN}`);
}
bootstrap();