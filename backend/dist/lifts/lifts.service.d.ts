import { Repository } from 'typeorm';
import { Lift } from './lift.entity';
export declare class LiftsService {
    private repo;
    constructor(repo: Repository<Lift>);
    create(dto: Partial<Lift>): Promise<Lift>;
    findAll(): Promise<Lift[]>;
    findOne(id: number): Promise<Lift>;
    update(id: number, dto: Partial<Lift>): Promise<Lift>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    lookupAddress(block: string, region?: string): Promise<{
        address: any;
        postal: any;
    }>;
    generateCsv(rows: any[]): string;
}
