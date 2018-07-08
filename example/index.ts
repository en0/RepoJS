import { v4 as uuid } from "uuid";
import Knex from "knex";
import {
    Mapper,
    Repository,
    column,
    table,
    IColumnAdapter,
    AllRecordsSpecification,
    IRepositorySpecification,
} from "..";

const knex = Knex({
    client: "mysql",
    connection: "mysql://root:password@localhost/devel?charset=utf8",
    debug: true,
});

/** Customer query specification */
class ProductByNameSpecification implements IRepositorySpecification {
    constructor(private name: string) { }
    applySqlClauses(query: Knex.QueryBuilder): Knex.QueryBuilder {
        return query.where("name", this.name);
    }
}

/**
 * A custom data adapter to convert date types to string.
 * This is just for demonstration purposes. Knex will translate
 * JavaScript dates to sql just fine without it.
 */
class DateAdapter implements IColumnAdapter<Date | null, string | null> {

    public fromEntity(val: Date | null): string | null {
        if (!val) return null;
        return val.toISOString();
    }

    public toEntity(val: string | null): Date | null {
        if (!val) return null;
        return new Date(val);
    }
}

/** The Business Domain Object Model. */
@table("repository_example_product")
class Product {

    @column("id", { isPrimary: true })
    private _id: string | null;

    @column("name")
    private _name: string | null;

    @column("created", { Adapter: DateAdapter })
    private _created: Date | null;

    constructor() {
        // All column decorated fields require a value.
        this._id = uuid();
        this._created = new Date();
        this._name = null;
    }

    public get id() { return this._id; }
    public get name() { return this._name; }
    public set name(value) { this._name = value; }
    public get created() { return this._created; }
    public set created(value) { this._created = value; }
}

/** Repository specify for the Product model. */
class ProductRepository extends Repository<Product> {
    constructor(knexProvider: () => Promise<Knex>) {
        super(knexProvider, new Mapper(Product));
    }
}

(async () => {

    // Create the table
    await knex.raw([
        "CREATE TABLE IF NOT EXISTS `repository_example_product` (",
            "`id` char(36) NOT NULL,",
            "`name` varchar(255) NOT NULL,",
            "`created` varchar(24) NOT NULL,",
            "PRIMARY KEY (`id`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;",
    ].join(" "));

    // Create the product repository
    const productRepository = new ProductRepository(() => Promise.resolve(knex));

    // Add 3 new products
    const product1 = new Product();
    product1.name = "Product 1";
    await productRepository.add(product1);

    const product2 = new Product();
    product2.name = "Product 2";
    await productRepository.add(product2);

    const product3 = new Product();
    product3.name = "Product 3";
    await productRepository.add(product3);

    // List all records.
    const result1 = await productRepository
        .query(new AllRecordsSpecification());

    // Get first matching record
    const [ result2 ] = await productRepository
        .query(new ProductByNameSpecification("Product 1"));

    // Get specific record (Only supports single column primary keys)
    const result3 = await productRepository
        .getById(result2.id);

    // Update record
    result3.name = "Product One";
    await productRepository.update(result3);

    // Delete products
    await productRepository.remove(product1);
    await productRepository.remove(product2);
    await productRepository.remove(product3);

    //await knex.raw("DROP TABLE repository_example_product");

    await knex.destroy();
})();