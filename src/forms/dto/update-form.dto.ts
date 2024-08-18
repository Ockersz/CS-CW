import { PartialType } from '@nestjs/mapped-types';
import { CreateFormDto } from './create-form.dto';

export class UpdateFormDto extends PartialType(CreateFormDto) {
  name?: string;
  description?: string;
  path?: string;
  status?: boolean;
}
