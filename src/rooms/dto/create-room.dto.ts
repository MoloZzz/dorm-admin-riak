import { IsString, IsUUID, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDefined()
  @IsUUID()
  dormitoryId: string;
}
