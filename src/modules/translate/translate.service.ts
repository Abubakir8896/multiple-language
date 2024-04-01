import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import {
    CreateTranslateInterface,
    DefinitionUpdateRequest,
    UpdateTranslateRequest,
  } from './interfaces';
  import { Model, isValidObjectId } from 'mongoose';
  import { InjectModel } from '@nestjs/mongoose';
  import { Definition, Translate } from './schemas';
import { Language } from '../language/schema';
import { GetSingleTranslateRequest, GetSingleTranslateResponse } from './interfaces/get-single-translate.interface';
  
  @Injectable()
  export class TranslateService {
    constructor(
      @InjectModel(Translate.name)
      private readonly translateModel: Model<Translate>,
      @InjectModel(Definition.name)
      private readonly definitionModel: Model<Definition>,
      @InjectModel(Language.name)
      private readonly languageModel: Model<Language>,
    ) {}

    async getTranslateList(): Promise<Translate[]> {
        return await this.translateModel.find().select(["-updatedAt", "-createdAt"]).populate('definitions', ["value", "id"]).exec();
      }
    
    async getUnusedTranslateList(): Promise<Translate[]> {
        return await this.translateModel
          .find({ status: 'inactive' })
          .select(["-updatedAt", "-createdAt"])
          .populate('definitions', ["value", "id"])
          .exec();
    }

    async createTranslate(payload:CreateTranslateInterface): Promise<void>{
        await this.checkExistingTranslate(payload.code)

        for (const code of Object.keys(payload.definition)) {
            await this.checkLanguage(code);
          }

        const translate = await this.translateModel.create({
            code:payload.code,
            type:payload.type,
            status:"inactive"
        })
        
        for (const x of Object.entries(payload.definition)) {
            const language = await this.languageModel.findOne({ code: x[0] });
      
            const newDefinition = await this.definitionModel.create({
              languageId: language.id,
              translateId: translate.id,
              value: x[1],
            });
      
            translate.definitions.push(newDefinition.id);
      
            newDefinition.save();
          }
          translate.save();
    }

    async getSingleTranslate(
        payload: GetSingleTranslateRequest,
      ): Promise<GetSingleTranslateResponse> {
        await this.checkLanguage(payload.languageCode);
        await this.checkTranslate(payload.translateId);
    
        const language = await this.languageModel.findOne({
          code: payload.languageCode,
        });
    
        const translate = await this.translateModel.findById(payload.translateId);
    
        const definition = await this.definitionModel.findOne({
          languageId: language.id,
          translateId: translate.id,
        });
    
        return {
          value: definition?.value,
        };
    }

    async updateTranslate(payload: UpdateTranslateRequest): Promise<void> {
        await this.checkTranslate(payload.id);
        const foundedTranslate = await this.translateModel.findById(payload.id);

        if (payload?.status) {
        if (payload.status == 'active' && foundedTranslate.status == 'active') {
            throw new ConflictException('Translate is already in use');
        }

        await this.translateModel.findByIdAndUpdate(foundedTranslate.id, {
            status: payload.status,
        });
        }

        if (payload?.definition) {
        for (const df of foundedTranslate.definitions) {
            await this.definitionModel.findByIdAndDelete(df);
        }

        await this.translateModel.findByIdAndUpdate(payload.id, {
            definitions: [],
        });

        for (const item of Object.entries(payload.definition)) {
            const language = await this.languageModel.findOne({ code: item[0] });

            const newDefinition = await this.definitionModel.create({
            languageId: language.id,
            translateId: foundedTranslate.id,
            value: item[1],
            });

            await this.translateModel.findByIdAndUpdate(foundedTranslate.id, {
            $push: { definitions: newDefinition.id },
            });
            newDefinition.save();
        }
        }
  }

  async updateDefinition(payload: DefinitionUpdateRequest): Promise<void> {
    await this.checkID(payload.id);
    const definition = await this.definitionModel.findById(payload.id);

    if (!definition) {
      throw new NotFoundException('Definition not found');
    }

    await this.definitionModel.findByIdAndUpdate(payload.id, {
      value: payload.value,
    });
  }

  
  async deleteTranslate(id: string) {
    await this.checkID(id);

    const translate = await this.translateModel.findById(id);

    await this.definitionModel.deleteMany({ translateId: translate.id });

    await this.translateModel.findByIdAndDelete(id);
  }


  async checkExistingTranslate(code: string): Promise<void> {
        const translate = await this.translateModel.findOne({
          code,
        });
    
        if (translate)
          throw new BadRequestException(`Translate ${code} is already available`);
      }
    
    async checkLanguage(code: string): Promise<void> {
        const language = await this.languageModel.findOne({ code });

        if (!language) throw new ConflictException(`Language ${code} not found`);
    }

    async checkTranslate(id: string): Promise<void> {
        await this.checkID(id);
        const translate = await this.translateModel.findById(id);
    
        if (!translate) throw new NotFoundException('Translate not found');
    }

    async checkID(id: string): Promise<void> {
        if (!isValidObjectId(id))
          throw new BadRequestException(`${id} is not valid UUID`);
    }
}