import { AuthService } from './auth.service';
export declare class AuthController {
    private svc;
    constructor(svc: AuthService);
    register(body: any): Promise<import("../users/user.entity").User>;
    login(body: any): Promise<{
        token: string;
        user: {
            id: number;
            username: string;
        };
    }>;
}
