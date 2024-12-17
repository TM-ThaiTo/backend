import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlockDto } from '../dto/create-block.dto';
import { HandleUserDatabase } from '@/user/handle/user.db';
import { HandleBlockDB } from '../handle/handle.block.db';

@Injectable()
export class BlockService {

  constructor(
    private readonly handleBlockDb: HandleBlockDB,
    private readonly handleUserDb: HandleUserDatabase,
  ) { }

  async checkUser(idUser: string, idUserBlock: string) {
    const user = await this.handleUserDb.findOneUserById(idUser);
    if (!user) throw new BadRequestException("Người dùng không tồn tại");

    const userBlock = await this.handleUserDb.findOneUserById(idUserBlock);
    if (!userBlock) throw new BadRequestException("Người dùng bị chặn không tồn tại");
    return { user, userBlock };
  }

  async create(dto: CreateBlockDto, auth: any) {
    try {
      const { user } = auth;
      const { idUserBlock } = dto;
      const idUser = user?.id;

      const { userBlock } = await this.checkUser(idUser, idUserBlock);
      const block = await this.handleBlockDb.checkBlock(idUser, idUserBlock);
      if (block) throw new BadRequestException("Người dùng đã bị chặn");
      const data = { idUser, idUserBlock }
      await this.handleBlockDb.create(data);
      return {
        user: user,
        receiver: userBlock,
      }
    } catch (e) { throw e }
  }

  async delete(dto: CreateBlockDto, auth: any) {
    try {
      const { user } = auth;
      const { idUserBlock } = dto;
      const idUser = user?.id;

      await this.checkUser(idUser, idUserBlock);
      const block = await this.handleBlockDb.checkBlock(idUser, idUserBlock);
      if (!block) throw new BadRequestException("Người dùng chưa bị chặn");
      await block.deleteOne();
      return { code: 0, message: 'Success', }
    } catch (e) { throw e }
  }

  async findAllByIdUser(id: string) {
    try {
      const blocks = await this.handleBlockDb.findAllBlockById(id);
      if (!blocks) throw new NotFoundException("Không tìm thấy dữ liệu");

      const blockAndUser = await Promise.all(blocks.map(async (block) => {
        const user = await this.handleUserDb.findOneUserById(block.idUserBlock);
        return { block, user };
      }));

      return {
        code: 0,
        message: 'Success',
        data: blockAndUser,
      };
    } catch (error) { throw error }
  }

  async checkBlock(id: string, auth: any) {
    try {
      const { user } = auth;
      await this.checkUser(user?._id, id);
      const blocked = await this.handleBlockDb.checkBlock(user?._id, id);
      const block: boolean = blocked ? true : false;

      return {
        code: 0, message: 'Success',
        data: { blocked: block }
      }
    } catch (error) { throw error }
  }

  async getAllBlockAndPageLimit(page: number, limit: number, auth: any) {
    try {
      const { user } = auth;
      const idUser = user?._id.toString();

      const findBlocks = await this.handleBlockDb.findAllByIdUserAndPageLimit(page, limit, idUser);
      if (!findBlocks) return { message: 'Success', data: [] }

      const dataBlockAndUser = [];
      for (const item of findBlocks) {
        const findUser = await this.handleUserDb.findOneUserById(item?.idUserBlock);
        if (!findUser) continue;

        const { _id, fullName, slug, avatar } = findUser
        const data = {
          id: _id,
          name: fullName,
          userName: slug,
          avatar,
        }
        dataBlockAndUser.push(data);
      }
      const total = await this.handleBlockDb.totalDocumentBlockByIdUser(idUser);
      const _query = {
        page: Number(page),
        limit: Number(limit),
        total_page: Math.ceil(total / Number(limit)),
      }
      return { message: 'Success', data: dataBlockAndUser, _query };
    } catch (e) { throw e }
  }
}
