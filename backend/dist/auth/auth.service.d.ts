import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
export declare class AuthService {
    private repo;
    constructor(repo: Repository<User>);
    register(username: string, password: string): Promise<User>;
    validateUser(username: string, password: string): Promise<User>;
    login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: number;
            username: string;
        };
    }>;
}
