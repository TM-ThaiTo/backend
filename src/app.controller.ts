import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {

    @Get('/')
    HelloWorld() {
        return 'Hello World!';
    }
}