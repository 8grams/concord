import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
  currentBranch: string;

  @Column("text", { nullable: true })
  mainDirectory: string;

  @Column("text", { nullable: true })
  outputDirectory: string;

  @Column("text", { nullable: true })
  privateKey: string;

  @Column("text", { nullable: true })
  status: string;

  @Column("text", { nullable: true })
  log: string;

  @Column("json", { nullable: true })
  envVars: { key: string; value: string }[];

  @Column("json", { nullable: true })
  secrets: { key: string; value: string }[];
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

  @Column("text", { nullable: true })
  role: "maintainer" | "editor" | "viewer";
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
  sourceBranch: string;

  @Column("text", { nullable: true })
  lastPlanOutput: string;

  @Column("text")
  branch: string;

  @Column("text", { nullable: true })
  status: "On Review" | "Applied" | "Rejected";

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy", referencedColumnName: "id" })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "lastPlanExecutor", referencedColumnName: "id" })
  lastPlanExecutor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "applyExecutor", referencedColumnName: "id" })
  applyExecutor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "rejector", referencedColumnName: "id" })
  rejector: User;
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
  role: "maintainer",
  picture:
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
};
