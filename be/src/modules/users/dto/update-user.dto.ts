import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  payment_info?: any;
}
