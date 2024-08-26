import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  MaxLength,
  //MinDate,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate()
  // @MinDate(new Date())
  startTime: Date;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate()
  // @MinDate(new Date())
  endTime: Date;
}
