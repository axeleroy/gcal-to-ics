type Success<T> = { ok: true; result: T };
type Failure = { ok: false };

export type Result<T> = Failure | Success<T>;

export const success = <T>(result: T): Result<T> => ({ ok: true, result });
export const failure = (): Failure => ({ ok: false });
