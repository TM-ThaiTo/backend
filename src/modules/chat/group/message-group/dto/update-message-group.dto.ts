import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageGroupDto } from './create-message-group.dto';

export class UpdateMessageGroupDto extends PartialType(CreateMessageGroupDto) {}
