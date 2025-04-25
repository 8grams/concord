import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text", { nullable: true })
  name: string;

  @Column("text", { nullable: true })
  url: string;

  @Column("text", { nullable: true })
  mainBranch: string;

  @Column("text", { nullable: true })
  mainDirectory: string;

  @Column("text", { nullable: true })
  privateKey: string;

  @Column("text", { nullable: true })
  status: string;

  @Column("text", { nullable: true })
  log: string;

  @Column("json", { nullable: true })
  envVars: { key: string; value: string }[];
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text")
  email: string;

  @Column("text", { nullable: true })
  name: string;

  @Column("text", { nullable: true })
  picture: string;
}

@Entity()
export class Proposal extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("int")
  workspace: number;

  @Column("text")
  hash: string;

  @Column("text")
  branch: string;

  @Column("text", { nullable: true })
  status: "On Review" | "Applied" | "Rejected";

  @Column("text", { nullable: true })
  planOutput: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("int")
  workspace: number;

  @Column("text")
  hash: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user", referencedColumnName: "id" })
  user: User;

  @Column("text", { nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}

export const Db = new DataSource({
  type: "better-sqlite3",
  database: "data/data.db",
  synchronize: true,
  entities: [Workspace, User, Proposal, Comment],
});

export const admin = {
  id: 10001,
  email: "admin@admin",
  name: "Admin",
  picture:
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
};
