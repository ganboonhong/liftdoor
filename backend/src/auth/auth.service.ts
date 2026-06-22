import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async register(username: string, password: string) {
    const existing = await this.repo.findOne({ where: { username } });
    if (existing) throw new ConflictException('Username taken');
    const hash = await bcrypt.hash(password, 10);
    const user = this.repo.create({ username, password: hash });
    return this.repo.save(user);
  }

  async validateUser(username: string, password: string) {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign({ sub: user.id, username: user.username }, secret, { expiresIn: '7d' });
    return { token, user: { id: user.id, username: user.username } };
  }
}
