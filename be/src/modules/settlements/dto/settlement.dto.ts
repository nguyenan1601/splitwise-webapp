import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateSettlementDto {
  @IsString()
  receiverId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  image_url?: string;
}
