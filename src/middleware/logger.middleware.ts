import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private requestQueue: Promise<any> = Promise.resolve();

    use(req: Request, res: Response, next: NextFunction) {
        this.requestQueue = this.requestQueue
            .then(() => new Promise<void>((resolve) => {
                setTimeout(() => {
                    console.log(`Processing request for: ${req.url}`);
                    next();
                    resolve();
                }, 0);
            }))
            .catch((err) => {
                console.error(`Error processing request for: ${req.url}`, err);
                next(err);
            });
    }
}
