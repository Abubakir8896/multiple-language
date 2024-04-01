import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsEnum} from 'class-validator';
import { CreateTranslateInterface } from '../interfaces';

enum type {
    content = "content",
    error = "error"
}

export class CreateTranslateDto implements CreateTranslateInterface {
    @ApiProperty({
        example: 'create_olma_translate',
        required: true,
      })
      @IsString()
      code: string;

      @ApiProperty({
        example: 
        {
            uz:"Olma",
            ru:"Яблоко "
        },
        required: true,
      })
      @IsObject()
      definition: Record<string, string>

      @ApiProperty({
        example: ["error", "content"],
        required: true,
      })
      @IsEnum(type)
      @IsString()
      type: 'content' | 'error';
}