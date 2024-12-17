import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function validateId(id: string) {
    if (id.length !== 24) {
        throw new BadRequestException('ID phải có độ dài 24 ký tự');
    }
}

export function validateObjectId(id: string) {
    validateId(id);
    return new Types.ObjectId(id);
}