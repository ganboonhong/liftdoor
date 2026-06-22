import { LiftsService } from './lifts.service';
import { Response } from 'express';
export declare class LiftsController {
    private svc;
    constructor(svc: LiftsService);
    create(dto: any): Promise<import("./lift.entity").Lift>;
    findAll(): Promise<import("./lift.entity").Lift[]>;
    csv(body: any, res: Response): Promise<void>;
    lookup(block: string, region: string): Promise<{
        address: any;
        postal: any;
    }>;
    findOne(id: string): Promise<import("./lift.entity").Lift>;
    update(id: string, dto: any): Promise<import("./lift.entity").Lift>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
