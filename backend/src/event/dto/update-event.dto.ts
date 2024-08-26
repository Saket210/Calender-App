import { IsArray, isArray, IsOptional, IsString } from 'class-validator';
import { CreateEventDto } from './create-event.dto';
import { Transform } from 'class-transformer';

export class UpdateEventDto extends CreateEventDto {
  @IsOptional()
  @Transform(({ value }) => {
    return isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  mediaIds: string[] = [];
}
