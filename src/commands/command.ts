export abstract class Command<TInput> {
    abstract execute(payload: TInput): Promise<void>;
}
