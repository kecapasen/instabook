import { IsEmail } from 'class-validator';
export class GetUserEmailDTO {
  @IsEmail()
  public readonly userEmail: string;
}
