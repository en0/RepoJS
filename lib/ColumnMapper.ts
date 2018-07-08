import "reflect-metadata";
import { PassThroughAdapter } from "./PassThroughAdapter";
import { IColumnAdapter, IMapper, ITableSpec } from "./IRepository";

interface IColumnMap {
    propName: string;
    column: string;
    isPrimary: boolean,
    adapter: IColumnAdapter<any, any>,
}

const columnMetadataKey = Symbol("dal.entity.metadata/column");
const tableMetadataKey = Symbol("dal.entity.metadata/table");

interface ColumnOpts {
    Adapter?: new () => IColumnAdapter<any, any>;
    isPrimary?: boolean;
}

/**
 * Map a property to a database column.
 * @param name Name of column in database
 * @param Adapter Data adapter to translate between the entity and the record.
 */
export function column(name: string, opts?: ColumnOpts) {
    return Reflect.metadata(columnMetadataKey, {
        column: name,
        adapter: opts && opts.Adapter && new opts.Adapter() || new PassThroughAdapter(),
        isPrimary: opts && opts.isPrimary || false,
    });
}

/**
 * Map a class to a database table.
 * @param name Name of the table in the database
 */
export function table(name: string) {
    return (cls: new () => any) => {
        Reflect.defineMetadata(tableMetadataKey, name, cls);
        return cls;
    };
}

function getColumnMap<T extends object>(Target: new () => T): IColumnMap[] {
    const target = new Target();
    return Reflect.ownKeys(target)

        .filter((prop) =>
            Reflect.hasMetadata(columnMetadataKey, target, prop.toString()))

        .map((prop) => {

            const propName = prop.toString();
            const { column, adapter, isPrimary } =
                Reflect.getMetadata(columnMetadataKey, target, propName);

            // const setEntityValue = (val: any) => Reflect.set(target, prop, adapter.toEntity(val));
            // const getColumnValue = () => adapter.fromEntity(Reflect.get(target, prop));

            return { propName, column, adapter, isPrimary };
        });
}

export class Mapper<T extends object> implements IMapper<T> {

    private columnMap: IColumnMap[];
    private tableName: string;

    public constructor(private Entity: new () => T) {
        this.tableName = Reflect.getMetadata(tableMetadataKey, Entity);
        this.columnMap = getColumnMap(Entity);
    }

    public fromEntity(entity: T): any {
        const record = {};
        this.columnMap.forEach((item) => {
            const value = Reflect.get(entity, item.propName);
            Reflect.set(record, item.column, item.adapter.fromEntity(value));
        });
        return record;
    }

    public toEntity(record: any): T {
        const entity = new this.Entity();
        this.columnMap.forEach((item) => {
            const value = Reflect.get(record, item.column);
            Reflect.set(entity, item.propName, item.adapter.toEntity(value));
        });
        return entity;
    }

    public getTableSpec(): ITableSpec {
        const result: ITableSpec = {
            name: this.tableName,
            columns: [],
            primary: [],
        };
        this.columnMap.forEach((item) => {
            if (item.isPrimary)
                result.primary.push(item.column);
            result.columns.push(item.column);
        });
        return result;
    }
}
