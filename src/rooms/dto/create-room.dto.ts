import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  dormitoryId: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsNumber()
  capacity: number;
}
