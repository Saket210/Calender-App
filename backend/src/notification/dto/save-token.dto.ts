import { IsNotEmpty, IsString } from 'class-validator';

export class SaveTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
