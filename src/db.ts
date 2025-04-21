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

  @Column("text")
  name: string;

  @Column("text")
  url: string;

  @Column("text")
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

  @Column("text")
  email: string;
}

export const Db = new DataSource({
  type: "better-sqlite3",
  database: "data/data.db",
  synchronize: true,
  entities: [Workspace, User],
});
