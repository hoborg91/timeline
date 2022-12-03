import { IMultiLangString } from "./text";

export type IDateFormat = "y" | "my";

export interface IMoment<T extends IDateFormat> {
    fmt: T;
    val: any;
}

export function Moment<T extends IDateFormat>(fmt: T, val: any): IMoment<T> {
    return { fmt, val };
}

export interface IUniFmtInterval<T extends IDateFormat> { // TODO It seems that type arguments is redundant. Refactor?
    fromVal: any;
    tillVal: any;
    fmt: T;
}

export function Interval<T extends IDateFormat>(fmt: T, fromVal: any, tillVal: any): IUniFmtInterval<T> {
    return { fmt, fromVal, tillVal };
}

export interface ILineSettings {
    interval: IUniFmtInterval<IDateFormat>;
    mainColor: string;
}

export function LineSettings(mainColor: string, fmt: IDateFormat, fromVal: number, tillVal: number): ILineSettings {
    return { interval: Interval(fmt, fromVal, tillVal), mainColor };
}

export interface IEvent<T extends IDateFormat> {
    cpt: string | IMultiLangString,
    time: IMoment<T>,
    scal: IMoment<T> | null,
    img: string,
}
