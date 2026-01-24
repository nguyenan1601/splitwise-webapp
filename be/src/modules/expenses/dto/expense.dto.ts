import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SplitType {
  EQUAL = 'EQUAL',
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

export class ExpenseSplitDto {
  @IsString()
  memberId: string;

  @IsEnum(SplitType)
  @IsOptional()
  splitType?: SplitType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  percentage?: number;
}

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  payerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseSplitDto)
  splits: ExpenseSplitDto[];
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  image_url?: string;
}
