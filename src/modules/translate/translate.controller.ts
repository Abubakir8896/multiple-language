import {
    Body,
    Controller,
    Post,
    Get,
    Headers,
    Param,
    Patch,
    Delete
  } from '@nestjs/common';
  import { TranslateService } from './translate.service';
  import { ApiTags } from '@nestjs/swagger';
  import {
    CreateTranslateDto,
    UpdateTranslateDto,
    UpdateDefinitionDto
  } from './dtos';
  import { Translate } from './schemas';
import { GetSingleTranslateResponse } from './interfaces/get-single-translate.interface';
  
  @ApiTags('Translate')
  @Controller({
    path: 'translate',
    version: '1.0',
  })
  export class TranslateController {
    #_translateService: TranslateService;
  
    constructor(service: TranslateService) {
      this.#_translateService = service;
    }
  
    @Post('add')
    async createTranslate(@Body() payload: CreateTranslateDto): Promise<void> {
      await this.#_translateService.createTranslate(payload);
    }

    @Get('find/all')
    async getTranslateList(): Promise<Translate[]> {
        return await this.#_translateService.getTranslateList();
    }

    @Get('/unused')
    async getUnusedTranslateList(): Promise<Translate[]> {
        return await this.#_translateService.getUnusedTranslateList();
    }

    @Get('one/:id')
    async retrieveSingleTranslate(
      @Headers('accept-language') languageCode: string,
      @Param('id') translateId: string,
    ): Promise<GetSingleTranslateResponse> {
      return await this.#_translateService.getSingleTranslate({
        languageCode,
        translateId,
      });
    }

    @Patch('edit/:id')
    async updateTranslate(
      @Param('id') translateId: string,
      @Body() payload: UpdateTranslateDto,
    ): Promise<void> {
      await this.#_translateService.updateTranslate({ ...payload, id: translateId });
    }

    @Patch('edit/definition/:id')
    async updateDefinition(
      @Param('id') definitionId: string,
      @Body() payload: UpdateDefinitionDto,
    ): Promise<void> {
      await this.#_translateService.updateDefinition({ ...payload, id: definitionId });
    }
  
    @Delete('delete/:id')
    async deleteTranslate(@Param('id') translateId: string): Promise<void> {
      await this.#_translateService.deleteTranslate(translateId);
    }
}