import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose ,{ HydratedDocument } from "mongoose";

export type LanguageDocument = HydratedDocument<Language>

@Schema({versionKey :false})
export class Language {
    @Prop({required:true, unique:true, length:2})
    code:string

    @Prop({unique:true, required:true, maxlength:64})
    title:string
}

export const LanguageSchema = SchemaFactory.createForClass(Language);