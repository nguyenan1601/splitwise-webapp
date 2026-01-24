import { IsString, IsOptional, Length } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  cover_image?: string;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name?: string;

  @IsString()
  @IsOptional()
  cover_image?: string;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;
}

export class JoinGroupDto {
  @IsString()
  @Length(8, 8)
  inviteCode: string;
}

export class AddVirtualMemberDto {
  @IsString()
  @Length(1, 50)
  tempName: string;
}

export class MergeVirtualMemberDto {
  @IsString()
  realUserId: string;
}
