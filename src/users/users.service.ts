import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async create(user: Record<string, any>): Promise<User> {
    const userExists = await this.usersRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }
}
