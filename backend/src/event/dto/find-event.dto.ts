import { EventStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  isArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindEventDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsString()
  contains?: string;

  @IsOptional()
  @Transform(({ value }) => (isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(EventStatus, { each: true })
  statuses?: EventStatus[];
}
