import { QueryBuilder } from "knex";
import { IRepositorySpecification } from "./IRepository";

export class AllRecordsSpecification implements IRepositorySpecification{
    applySqlClauses(query: QueryBuilder): QueryBuilder { return query; }
}