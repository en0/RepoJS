# RepoJS

A Basic Repository framework for [Knex](https://knexjs.org/).

- Object Model Decorators.
- Custom column adapters.
- Simple to construct concrete repositories.
- Extensible query interface.
- Supports custom Mappers.
- Simple to use

# Features

Define business object models with mapping decorations inline.

```typescript
@table("repository_example_product")
class Product {

    @column("id", { isPrimary: true }) private _id: string | null; 
    @column("name") private _name: string | null; 
    @column("created", { Adapter: DateAdapter }) private _created: Date | null;

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
```

Create custom column adapters.

```typescript
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
```

Simple to construct concrete repositories.

```typescript
class ProductRepository extends Repository<Product> {
    constructor(knexProvider: () => Promise<Knex>) {
        super(knexProvider, new Mapper(Product));
    }
}
```

Extensible query interface.

```typescript
class ProductByNameSpecification implements IRepositorySpecification {
    constructor(private name: string) { }
    applySqlClauses(query: Knex.QueryBuilder): Knex.QueryBuilder {
        return query.where("name", this.name);
    }
}

const result =
    productRepository.query(new ProductByNameSpecification("product name"));
```

Supports custom mappers. Simply implement the IMapper interface on your custom mapper.

```typescript
class CustomMapper implements IMapper<Model> {
    getTableSpec(): ITableSpec {
        return {
            name: "my_table",
            columns: [ "col1", "col2", "col3" ],
            primary: [ "col1" ]
        }
    }

    fromEntity(entity: Model): any {
        return {
            col1: entity.colOne,
            col2: entity.colTwo,
            col3: entity.colThree
        }
    }

    toEntity(record: any): Model {
        const e = new Model();
        e.colOne = record.col1;
        e.colTwo = record.col2;
        e.colThree = record.col3;
        return e;
    }
}
```

Simple to use.

```typescript
const productRepository = new ProductRepository(() => Promise.resolve(knex));

const product1 = new Product();
product1.name = "Product 1";

// Add Things
await productRepository.add(product1);

// Update Things
product1.name = "Product One";
await productRepository.update(product1);

// Search Things
const [ firstResult ] = await productRepository
    .query(new ProductByNameSpecification("Product One"));

// List Things
const listResult = await productRepository
    .query(new AllRecordsSpecification());

// Delete Things
await productRepository.remove(product1);
```

Checkout the [example](example/index.ts).