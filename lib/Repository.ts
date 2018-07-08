import * as Knex from "knex";
import { EntityNotFoundError } from "./EntityNotFoundError";
import {
    IRepository,
    IRepositorySpecification,
    ITableSpec,
    IMapper
} from "./IRepository";

export class Repository<T> implements IRepository<T> {

    private table: ITableSpec;

    public constructor(
        private knexProvider: (opts?: any) => Promise<Knex>,
        private mapper: IMapper<T>,
    ) { this.table = mapper.getTableSpec(); }

    public async add(entity: T): Promise<void> {
        const knex = await this.knexProvider();
        const record = this.mapper.fromEntity(entity);
        const query = knex(this.table.name)
        await query.insert(record);
    }

    public async remove(entity: T): Promise<void> {
        const knex = await this.knexProvider();
        const record = this.mapper.fromEntity(entity);
        const query = knex(this.table.name);
        this.table.primary.forEach((v) => query.where(v, record[v]));
        query.delete();
    }

    public async update(entity: T): Promise<void> {
        const knex = await this.knexProvider();
        const record = this.mapper.fromEntity(entity);
        const query = knex(this.table.name);
        this.table.primary.forEach((v) => query.where(v, record[v]));
        query.update(record);
    }

    public async getById(id: any): Promise<T> {
        const knex = await this.knexProvider();
        const query = knex(this.table.name);
        this.table.primary.forEach((v) => query.where(v, id));
        const result = await query;
        if (result && result[0])
            return this.mapper.toEntity(result[0]);
        throw new EntityNotFoundError();
    }

    public async query(spec: IRepositorySpecification): Promise<T[]> {
        const knex = await this.knexProvider();
        const result = await spec.applySqlClauses(knex(this.table.name));
        return result && result.map((v: any) => this.mapper.toEntity(v)) || [];
    }
}
