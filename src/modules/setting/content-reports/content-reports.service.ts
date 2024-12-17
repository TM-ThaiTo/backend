import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentReportDto } from './dto/create-content-report.dto';
import { UpdateContentReportDto } from './dto/update-content-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ContentReport, ContentReportDocument } from './schemas';
import { Model, Types } from 'mongoose';

@Injectable()
export class ContentReportsService {

  constructor(
    @InjectModel(ContentReport.name) private readonly contentReport: Model<ContentReportDocument>,
  ) { }

  async findOneReport(id: string) {
    const objectId = new Types.ObjectId(id);
    return await this.contentReport.findById({ _id: objectId });
  }

  async create(createContentReportDto: CreateContentReportDto) {
    try {
      const { type, contentVN, contentEN } = createContentReportDto;
      const newContentReport = await this.contentReport.findOne({ type, contentVN, contentEN })
      if (newContentReport) throw new BadRequestException({ code: 1, message: "Đã tồn tại report" });
      await this.contentReport.create(createContentReportDto);
      return { code: 0, message: 'Success' }
    } catch (error) { throw error }
  }

  async remove(id: string) {
    try {
      const report = await this.findOneReport(id);
      if (!report) throw new NotFoundException({ code: 2, message: "Không tìm thấy report" })

      await report.deleteOne();
      return { code: 0, message: 'Success' }
    } catch (error) { throw error }
  }

  async findAll() {
    try {
      const reports = await this.contentReport.find();
      if (!reports || reports.length === 0) throw new NotFoundException({ code: 2, message: "Không có report" })
      return {
        code: 0,
        message: "Success",
        data: reports,
      }
    } catch (error) { throw error }
  }

  async findOne(id: string) {
    try {
      const report = await this.findOneReport(id);
      if (!report) throw new NotFoundException({ code: 2, message: "Không tìm thấy report" })
      return {
        code: 0,
        message: 'Success',
        data: report,
      }
    } catch (error) { throw error }
  }

  async update(id: string, updateContentReportDto: UpdateContentReportDto) {
    try {
      const report = await this.findOneReport(id);
      if (!report) throw new NotFoundException({ code: 2, message: "Không tìm thấy report" })
      await report.updateOne(updateContentReportDto);
      return { code: 0, message: 'Success' }
    } catch (error) { throw error }
  }

  async findByType(type: number) {
    try {
      const reports = await this.contentReport.find({ type, open: true });

      const reportCopy = reports.map((report) => {
        const { _id, type, contentVN, contentEN, quantity } = report;
        return { _id, type, contentVN, contentEN, quantity }
      })

      if (!reports || reports.length === 0) throw new NotFoundException({ code: 2, message: "Không có report" })
      return {
        code: 0,
        message: "Success",
        data: reportCopy,
      }
    } catch (error) { throw error }
  }
}
