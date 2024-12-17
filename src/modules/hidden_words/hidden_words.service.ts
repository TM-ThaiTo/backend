import { BadRequestException, Injectable } from '@nestjs/common';
import { HandleHiddenWordsDatabase } from './handle/handle.hiddenWord.db';

@Injectable()
export class HiddenWordsService {

  constructor(
    private readonly handleHiddenWordsDB: HandleHiddenWordsDatabase
  ) { }

  async findOne(auth: any) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();

      const find = await this.handleHiddenWordsDB.findOneByIdUser(idUser);
      if (!find) throw new BadRequestException('Find hidden words by idUser not found');

      const data = {
        ...find.toObject(),
        hideComments: find?.hideComments === 0 ? false : true,
        commentfiltering: find?.commentfiltering === 0 ? false : true,
        hideMessageRequests: find?.hideMessageRequests === 0 ? false : true,
        hideCommentWithCustomHidden: find?.hideCommentWithCustomHidden === 0 ? false : true
      }

      return {
        data
      }

    } catch (error) { throw error }
  }

  async updateOne(data: any, auth: any) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();
      const { id, type } = data;

      const find = await this.handleHiddenWordsDB.findOneById(id);
      if (!find || find?.idUser !== idUser) throw new BadRequestException('Không tồn tại, hoặc không thể chỉnh sửa');

      if (type === 1) await find.updateOne({ hideComments: find?.hideComments === 1 ? 0 : 1 })
      else if (type === 2) await find.updateOne({ commentfiltering: find?.commentfiltering === 1 ? 0 : 1 })
      else if (type === 3) await find.updateOne({ hideMessageRequests: find?.hideMessageRequests === 1 ? 0 : 1 })

      return { message: 'Success', }
    } catch (e) { throw e }
  }

  async updateCustomHidden(data: any, auth: any) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();

      const { cusstomHidden, hideCommentWithCustomHidden } = data;
      console.log('check data: ', data);

      const find = await this.handleHiddenWordsDB.findOneByIdUser(idUser);
      if (!find) throw new BadRequestException('Find hidden words by idUser not found');

      const dataU = {
        cusstomHidden,
        hideCommentWithCustomHidden: hideCommentWithCustomHidden === true ? 1 : 0,
      }
      await find.updateOne({ $set: dataU });
      return { message: 'Success', }
    } catch (e) { throw e }
  }
}
