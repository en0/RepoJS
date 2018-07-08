import { QueryBuilder } from "knex";

export interface IRepositorySpecification {
    applySqlClauses(query: QueryBuilder): QueryBuilder;
}

export interface IRepository<T> {
    add(entity: T): Promise<void>;
    remove(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    getById(id: any): Promise<T>;
    query(spec: IRepositorySpecification): Promise<T[]>;
}

export interface ITableSpec {
    name: string;
    primary: string[];
    columns: string[];
}

export interface IMapper<T> {
    getTableSpec(): ITableSpec;
    fromEntity(entity: T): any;
    toEntity(record: any): T;
}

export interface IColumnAdapter<TEntity, TColumn> {
    fromEntity(val: TEntity): TColumn;
    toEntity(val: TColumn): TEntity;
}
