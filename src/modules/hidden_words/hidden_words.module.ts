import { Module, forwardRef } from '@nestjs/common';
import { HiddenWordsService } from './hidden_words.service';
import { HiddenWordsController } from './hidden_words.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@/user/user.module';
import { HiddenWord, HiddenWordSchema } from './schemas/hidden_word.schema';
import { HandleHiddenWordsDatabase } from './handle/handle.hiddenWord.db';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HiddenWord.name, schema: HiddenWordSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [HiddenWordsController],
  providers: [HiddenWordsService, HandleHiddenWordsDatabase],
  exports: [HandleHiddenWordsDatabase]
})
export class HiddenWordsModule { }
