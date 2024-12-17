import { Module } from '@nestjs/common';
import { ContentReportsService } from './content-reports.service';
import { ContentReportsController } from './content-reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentReport, ContentReportSchema } from './schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: ContentReport.name, schema: ContentReportSchema }])],
  controllers: [ContentReportsController],
  providers: [ContentReportsService],
  exports: [ContentReportsService]
})
export class ContentReportsModule { }
