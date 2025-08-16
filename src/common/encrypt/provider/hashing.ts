export abstract class Hashing {
    abstract hashPassword(password: string | Buffer): Promise<string>;
    abstract comparePassword(password: string | Buffer, hash: string): Promise<boolean>;
}
