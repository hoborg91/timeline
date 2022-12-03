export interface IPlurString {
    paramIndex: number;
    options: { from: number; till: number; val: string }[];
    default: string;
}

export type IMultiLangString = {
    [key: string]: string | IPlurString;
}
