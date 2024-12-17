import { PartialType } from '@nestjs/mapped-types';
import { CreateContentReportDto } from './create-content-report.dto';

export class UpdateContentReportDto extends PartialType(CreateContentReportDto) {}
