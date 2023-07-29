export interface IPlurString {
    paramIndex: number;
    options: { from: number; till: number; val: string }[];
    default: string;
}

export type IMultiLangString = {
    [key: LangMonkier]: string | IPlurString;
}

export type LangMonkier = string & { readonly '': unique symbol };
