import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const { username, password } = body;
    return this.svc.register(username, password);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { username, password } = body;
    return this.svc.login(username, password);
  }
}
