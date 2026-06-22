"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lift_entity_1 = require("./lift.entity");
const axios_1 = require("axios");
const sync_1 = require("csv-stringify/sync");
let LiftsService = class LiftsService {
    constructor(repo) {
        this.repo = repo;
    }
    create(dto) {
        const ent = this.repo.create(dto);
        return this.repo.save(ent);
    }
    findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        const r = await this.repo.findOneBy({ id });
        if (!r)
            throw new common_1.NotFoundException('Lift not found');
        return r;
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        return this.repo.delete(id);
    }
    async lookupAddress(block, region) {
        const base = 'https://www.onemap.gov.sg/api/common/elastic/search';
        const searchVal = `${region ? region + ' ' : ''}${block}`;
        const params = new URLSearchParams({ searchVal, returnGeom: 'N', getAddrDetails: 'Y' });
        const url = `${base}?${params.toString()}`;
        console.log(url);
        const headers = {};
        const token = process.env.ONEMAP_TOKEN || process.env.ONEMAP_API_KEY;
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
        const res = await axios_1.default.get(url, { headers });
        const results = res.data?.results ?? [];
        if (results.length === 0)
            return null;
        const first = results[0];
        return { address: first.ADDRESS, postal: first.POSTAL };
    }
    generateCsv(rows) {
        if (!Array.isArray(rows))
            throw new Error('Expected array');
        const csv = (0, sync_1.stringify)(rows, { header: true });
        return csv;
    }
};
exports.LiftsService = LiftsService;
exports.LiftsService = LiftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lift_entity_1.Lift)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LiftsService);
//# sourceMappingURL=lifts.service.js.map