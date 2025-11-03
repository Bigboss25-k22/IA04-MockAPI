import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private refreshTokens: Map<string, string>; 

    constructor(private jwtService: JwtService) {
        this.refreshTokens = new Map<string, string>();
    }

    login(email: string, password: string){
        if (!email) {
            throw new UnauthorizedException('Email is required');
        }

        if (!password) {
            throw new UnauthorizedException('Password is required');
        }

        const payload = { email };
    // Short-lived tokens for testing: access 1 minute, refresh 3 minutes
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '3m' });

        this.refreshTokens.set(refreshToken, email);
        return { accessToken, refreshToken };
    }

    refreshToken(refreshToken: string){
        try {
            const payload = this.jwtService.verify(refreshToken);
            const storedEmail = this.refreshTokens.get(refreshToken);

            if (storedEmail !== payload.email) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // New access token should also be short-lived
            const newAccessToken = this.jwtService.sign({ email: payload.email }, { expiresIn: '1m' });
            return { accessToken: newAccessToken };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    getProfile(accessToken: string){
        try {
            const payload = this.jwtService.verify(accessToken);
            return { email: payload.email, name: 'Mock User' };
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    logout(refreshToken: string){
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is required');
        }

        if (!this.refreshTokens.has(refreshToken)) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        this.refreshTokens.delete(refreshToken);
        return { success: true, message: 'Logged out' };
    }
}