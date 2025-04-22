import {
  BaseEntity,
  Column,
  DataSource,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn("identity")
  id: number;

  @Column("text", { nullable: true })
  name: string;

  @Column("text", { nullable: true })
  url: string;

  @Column("text", { nullable: true })
  directory: string;

  @Column("text", { nullable: true })
  privateKey: string;

  @Column("text", { nullable: true })
  keyId: string;

  @Column("text", { nullable: true })
  keySecret: string;

  @Column("text", { nullable: true })
  status: string;

  @Column("text", { nullable: true })
  log: string;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("identity")
  id: number;

  @Column("text", { nullable: true })
  email: string;
}

export const Db = new DataSource({
  type: "better-sqlite3",
  database: "data/data.db",
  synchronize: true,
  entities: [Workspace, User],
});
