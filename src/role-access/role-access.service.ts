import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleAccess } from './entities/role-access.entity';

@Injectable()
export class RoleAccessService {
  constructor(
    @InjectRepository(RoleAccess)
    private roleAccessRepository: Repository<RoleAccess>,
  ) {}

  findAccess(id: number) {
    return this.roleAccessRepository.find({
      where: { roleId: id },
    });
  }

  async editRoleAccess(id: number, body: any, user: any) {
    try {
      // Fetch existing role access for the given roleId
      const existingForms = await this.roleAccessRepository.find({
        where: { roleId: id },
      });

      const newFormIdsSet = new Set(body.forms);
      const formsToDelete = existingForms.filter(
        (form) => !newFormIdsSet.has(form.formId),
      );
      this.roleAccessRepository.delete({
        roleId: id,
        formId: In(formsToDelete.map((form) => form.formId)),
      });

      // Forms to add
      const existingFormIdsSet = new Set(
        existingForms.map((form) => form.formId),
      );

      const formsToAdd = body.forms.filter(
        (formId: number) => !existingFormIdsSet.has(formId),
      );

      if (formsToAdd.length > 0) {
        const newRoleAccessEntries = formsToAdd.map((formId: number) => ({
          roleId: id,
          formId,
          createdBy: user.id,
          updatedBy: user.id,
        }));

        await this.roleAccessRepository.save(newRoleAccessEntries);
      }
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Failed to edit role access',
        error.message,
      );
    }
  }
}
