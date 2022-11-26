export type IDateFormat = "y" | "my";

export interface IMoment<T extends IDateFormat> {
    fmt: T;
    val: any;
}

export function Moment<T extends IDateFormat>(fmt: T, val: any): IMoment<T> {
    return { fmt, val };
}

export interface IUniFmtInterval<T extends IDateFormat> {
    fromVal: any;
    tillVal: any;
    fmt: T;
}

export function Interval<T extends IDateFormat>(fmt: T, fromVal: any, tillVal: any): IUniFmtInterval<T> {
    return { fmt, fromVal, tillVal };
}

export interface ILineSettings {
    interval: IUniFmtInterval<IDateFormat>;
}

export type IMultiLangString = { [key: string]: string }

export interface IEvent<T extends IDateFormat> {
    cpt: string | IMultiLangString,
    time: IMoment<T>,
    img: string,
}