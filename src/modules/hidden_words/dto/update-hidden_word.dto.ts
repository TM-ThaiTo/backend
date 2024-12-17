import { PartialType } from '@nestjs/mapped-types';
import { CreateHiddenWordDto } from './create-hidden_word.dto';

export class UpdateHiddenWordDto extends PartialType(CreateHiddenWordDto) {}
