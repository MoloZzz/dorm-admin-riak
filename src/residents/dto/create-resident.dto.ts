import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDefined } from 'class-validator';

export class CreateResidentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDefined()
  @IsUUID()
  roomId: string;
}
