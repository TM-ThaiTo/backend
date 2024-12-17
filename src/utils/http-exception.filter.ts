import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        // Map các thông báo lỗi cụ thể vào đây
        const customMessages = {
            'Only MP4 video files are allowed!': 'Only MP4 video files are allowed!',
            'Only image files are allowed!': 'Only image files are allowed!',
            'User not in conversation': 'User not in conversation',
            'Không thể gửi tin nhắn': 'Không thể gửi tin nhắn',
        };

        // Lấy message từ exception hoặc dùng fallback
        const message =
            customMessages[exceptionResponse.message] ||
            (typeof exceptionResponse === 'string'
                ? exceptionResponse
                : exceptionResponse.message)
            || 'Internal server error';

        // Trả về response với thông tin lỗi đầy đủ
        return response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
