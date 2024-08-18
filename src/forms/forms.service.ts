import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Form } from './entities/form.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
  ) {}

  create(createFormDto: CreateFormDto, user: any) {
    return this.formRepository.save({
      ...createFormDto,
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  findAll() {
    return this.formRepository.find();
  }

  findOne(id: number) {
    return this.formRepository.findOne({ where: { id } });
  }

  findPaths(user: any) {
    console.log(user);
  }

  update(id: number, updateFormDto: UpdateFormDto, user: any) {
    this.formRepository.update(id, {
      ...updateFormDto,
      updatedBy: user.id,
    });

    return this.formRepository.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.formRepository.delete(id);
  }

  disable(id: number, user: any, status: boolean) {
    return this.formRepository.update(id, {
      status: status,
      updatedBy: user.id,
    });
  }
}
