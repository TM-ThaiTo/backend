import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { HiddenWordsService } from './hidden_words.service';
import { CreateHiddenWordDto } from './dto/create-hidden_word.dto';
import { UpdateHiddenWordDto } from './dto/update-hidden_word.dto';
import { GetUser, JwtGuard } from '@common/index';
import Routes from '@/utils/constants/endpoint';

@Controller(Routes.HIDDENWORD)
export class HiddenWordsController {
  constructor(private readonly hiddenWordsService: HiddenWordsService) { }

  @Get()
  @UseGuards(JwtGuard)
  getHiddenById(@GetUser() auth: any) {
    return this.hiddenWordsService.findOne(auth);
  }

  @Put()
  @UseGuards(JwtGuard)
  updateHiddenNoCustom(@Body() data: { id: string, type: number }, @GetUser() auth: any) {
    return this.hiddenWordsService.updateOne(data, auth);
  }

  @Put('/custom-hidden')
  @UseGuards(JwtGuard)
  updateCusstomHidden(@Body() data: any, @GetUser() auth: any) {
    return this.hiddenWordsService.updateCustomHidden(data, auth);
  }
}
