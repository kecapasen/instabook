import { IsAlphanumeric, IsEmail, IsString, Length } from 'class-validator';
export class CreateAccountDTO {
  @IsString()
  @Length(1, 50)
  public readonly fullname: string;
  @IsEmail()
  @Length(2, 50)
  public readonly email: string;
  @IsString()
  @IsAlphanumeric()
  @Length(3, 15)
  public readonly username: string;
  @IsString()
  @Length(6, 50)
  public readonly password: string;
}
