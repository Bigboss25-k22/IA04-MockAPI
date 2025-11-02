import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    login(@Body('email') email: string) {
        return this.authService.login(email);
    }

    @Post('refresh')
    refreshToken(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Get('profile')
    getProfile(@Headers('Authorization') authHeader: string) {
        const token = authHeader?.split(' ')[1];
        return this.authService.getProfile(token);
    }
}