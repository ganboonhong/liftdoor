import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lift } from './lift.entity';
import axios from 'axios';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class LiftsService {
  constructor(@InjectRepository(Lift) private repo: Repository<Lift>) {}

  create(dto: Partial<Lift>) {
    const ent = this.repo.create(dto);
    return this.repo.save(ent);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const r = await this.repo.findOneBy({ id });
    if (!r) throw new NotFoundException('Lift not found');
    return r;
  }

  async update(id: number, dto: Partial<Lift>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  // Use OneMap Search API to get full address from block number and optional region/district
  async lookupAddress(block: string, region?: string) {
    // const base = 'https://developers.onemap.sg/commonapi/search';
    const base = 'https://www.onemap.gov.sg/api/common/elastic/search';
    // build a flexible search value: prefer `region + block` (e.g. "punggol 126b")
    const searchVal = `${region ? region + ' ' : ''}${block}`;
    const params = new URLSearchParams({ searchVal, returnGeom: 'N', getAddrDetails: 'Y' });
    const url = `${base}?${params.toString()}`;

    console.log(url)

    // include token if provided in environment
    const headers: Record<string, string> = {};
    const token = process.env.ONEMAP_TOKEN || process.env.ONEMAP_API_KEY;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await axios.get(url, { headers });
    const results = res.data?.results ?? [];
    if (results.length === 0) return null;
    // return first match's ADDRESS and postal
    const first = results[0];
    return { address: first.ADDRESS, postal: first.POSTAL };
  }

  // Generate CSV from provided rows (array of objects)
  generateCsv(rows: any[]) {
    if (!Array.isArray(rows)) throw new Error('Expected array');
    const csv = stringify(rows, { header: true });
    return csv;
  }
}
