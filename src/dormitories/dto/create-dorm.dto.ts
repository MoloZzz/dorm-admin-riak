import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDormDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;
}
