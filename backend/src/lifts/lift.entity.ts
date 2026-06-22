import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lifts')
export class Lift {
  @PrimaryGeneratedColumn() id: number;

  @Column() block: string;
  @Column({ nullable: true }) street?: string;
  @Column({ nullable: true }) postal?: string;
  @Column({ nullable: true }) region?: string;
  @Column({ nullable: true }) notes?: string;

  // New fields
  @Column({ nullable: true }) liftcode?: string;
  @Column({ nullable: true }) sidebyside?: string;
  @Column({ nullable: true }) height?: string;
  @Column({ nullable: true }) keyhole?: string;

  // Timestamps (auto-managed)
  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
