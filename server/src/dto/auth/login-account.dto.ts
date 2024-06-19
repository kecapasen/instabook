import { IsAlphanumeric, IsEmail, IsString, Length } from 'class-validator';
export class LoginAccountDTO {
  @IsString()
  @IsAlphanumeric()
  @Length(3, 15)
  public readonly username: string;
  @IsString()
  @Length(6, 50)
  public readonly password: string;
}
