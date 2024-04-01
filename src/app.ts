import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguageModule } from './modules/language/interfaces/language.module';
import { TranslateModule } from './modules/translate/translate.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/bahr_tech'),
    LanguageModule,
    TranslateModule
  ],
})
export class AppModule {}
