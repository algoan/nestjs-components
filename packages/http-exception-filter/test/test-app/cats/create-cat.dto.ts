import { IsNotEmpty } from 'class-validator';

/**
 * Dto to create a new cat
 */
export class CreateCatDto {
  @IsNotEmpty()
  public name: string | undefined;
}
