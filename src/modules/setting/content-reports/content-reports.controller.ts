import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContentReportsService } from './content-reports.service';
import { CreateContentReportDto } from './dto/create-content-report.dto';
import { UpdateContentReportDto } from './dto/update-content-report.dto';
import { validateId } from '@/utils/validateId';
@Controller('api/v1/content-reports')
export class ContentReportsController {
  constructor(private readonly contentReportsService: ContentReportsService) { }

  @Post()
  create(@Body() createContentReportDto: CreateContentReportDto) {
    return this.contentReportsService.create(createContentReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    validateId(id);
    return this.contentReportsService.remove(id);
  }

  @Get()
  findAll() {
    return this.contentReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    validateId(id);
    return this.contentReportsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentReportDto: UpdateContentReportDto) {
    validateId(id);
    return this.contentReportsService.update(id, updateContentReportDto);
  }

  @Get('type/:type')
  findByType(@Param('type') type: number) {
    return this.contentReportsService.findByType(type);
  }
}
