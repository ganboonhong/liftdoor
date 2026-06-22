import { Controller, Get, Post, Body, Param, Put, Delete, Query, Res, HttpStatus } from '@nestjs/common';
import { LiftsService } from './lifts.service';
import { Response } from 'express';

@Controller('lifts')
export class LiftsController {
  constructor(private svc: LiftsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('csv')
  async csv(@Body() body: any, @Res() res: Response) {
    // Accept rows in body (POST would be better, but keep GET for quick tests)
    const rows = body?.rows ?? [];
    const csv = this.svc.generateCsv(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lifts.csv"');
    res.status(HttpStatus.OK).send(csv);
  }

  @Get('lookup')
  async lookup(@Query('block') block: string, @Query('region') region: string) {
    return this.svc.lookupAddress(block, region);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
