import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/dto/signUpDto';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(user: SignUpDto): Promise<User> {
    const userExists = await this.usersRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const newUser = this.usersRepository.create({
      ...user,
      password: await bcrypt.hash(user.password, await bcrypt.genSalt()),
    });
    return this.usersRepository.save(newUser);
  }

  async update(id: number, user: Record<string, any>): Promise<User> {
    const updatedUser = await this.usersRepository.update(id, user);

    if (!updatedUser) {
      throw new BadRequestException('User not found');
    }

    return this.usersRepository.findOne({ where: { id } });
  }

  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    if (user.password !== oldPassword) {
      throw new BadRequestException('Invalid password');
    }

    await this.usersRepository.update(id, {
      password: await bcrypt.hash(newPassword, await bcrypt.genSalt()),
    });

    return this.usersRepository.findOne({ where: { id } });
  }

  async getUsers(userObj: any) {
    return this.usersRepository.find({
      select: ['id', 'username', 'email', 'telephone', 'status', 'role'],
      where: { id: Not(userObj.id) },
    });
  }

  async getUserById(id: number) {
    return this.usersRepository.findOne({
      select: ['username', 'email', 'telephone', 'status', 'mfa'],
      where: { id },
    });
  }

  async disableUser(id: number, userId: number) {
    await this.usersRepository.update(id, {
      status: !(await this.usersRepository.findOne({ where: { id } })).status,
      updatedBy: userId,
    });
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateRole(id: number, user: Record<string, any>, userId: number) {
    await this.usersRepository.update(id, {
      role: user.role,
      updatedBy: userId,
    });
    return this.usersRepository.findOne({ where: { id } });
  }

  async findPaths(userObj: any) {
    let paths = [];
    const isFullAccess = await this.usersRepository.query(`
        SELECT full_access FROM role where id = ${userObj.role}
       `);

    if (isFullAccess.length > 0 && isFullAccess[0].full_access) {
      paths = await this.usersRepository.query(`
          SELECT id, path, name FROM form where status=1
          ORDER BY name ASC
         `);
      return paths;
    }

    paths = await this.usersRepository.query(`
        SELECT 
        f.id,
        f.path,
        f.name
        FROM role_access ra
        INNER JOIN form f
        ON ra.formId = f.id
        WHERE ra.roleId = ${userObj.role} AND f.status =1
        ORDER BY f.name ASC
      `);

    return paths;
  }

  async protected(user: any, path: string) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const isFullAccess = await this.usersRepository.query(
      `SELECT full_access from role where id=${user.role}`,
    );
    if (
      isFullAccess &&
      isFullAccess.length > 0 &&
      isFullAccess[0].full_access
    ) {
      return {
        message: 'You are authorized',
      };
    }

    const isAuth = await this.usersRepository.query(`
        SELECT ra.id from role_access ra
        INNER JOIN form f
        ON f.id = ra.formId
        WHERE ra.roleId = ${user.role} and f.path='${path}'
      `);

    if (isAuth && isAuth.length > 0) {
      return {
        message: 'You are authorized',
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
