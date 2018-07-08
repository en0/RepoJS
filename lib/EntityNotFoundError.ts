export class EntityNotFoundError extends Error {
    constructor(message?: string) {
        super(message || "Entity Not Found");
        this.name = this.constructor.name;
    }
}
