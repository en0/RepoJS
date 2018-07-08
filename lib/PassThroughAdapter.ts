import { IColumnAdapter } from ".";

export class PassThroughAdapter implements IColumnAdapter<any, any> {
    public fromEntity(val: any) { return val; }
    public toEntity(val: any) { return val; }
}
