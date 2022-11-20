export function Throw(errorMessage?: string): never {
    throw new Error(errorMessage);
}
