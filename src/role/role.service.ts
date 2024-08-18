import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  create(createRoleDto: CreateRoleDto, user: any) {
    return this.roleRepository.save({
      ...createRoleDto,
      createdBy: user.id,
      updatedBy: user.id,
    });
  }

  findAll() {
    return this.roleRepository.find({
      select: ['id', 'name', 'description', 'status'],
      where: { fullAccess: false },
      order: { name: 'ASC' },
    });
  }

  findRoles() {
    return this.roleRepository.find({
      select: ['id', 'name'],
      where: { status: true, fullAccess: false },
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.roleRepository.findOne({
      where: { id },
      select: ['id', 'name', 'description', 'status'],
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto, user: any) {
    return this.roleRepository.update(id, {
      ...updateRoleDto,
      updatedBy: user.id,
    });
  }

  remove(id: number) {
    return this.roleRepository.delete(id);
  }
}
