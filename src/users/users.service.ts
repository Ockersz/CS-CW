import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/dto/signUpDto';
import { Repository } from 'typeorm';
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
}
