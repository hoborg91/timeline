import { IMultiLangString } from "./text";

export type IDateFormat = "y" | "my";

export interface IMoment {
    val: any;
    fmt: IDateFormat;
}

export function Moment(fmt: IDateFormat, val: any): IMoment {
    return { fmt, val };
}

export interface IUniFmtInterval {
    fromVal: any;
    tillVal: any;
    fmt: IDateFormat;
}

export function Interval(fmt: IDateFormat, fromVal: any, tillVal: any): IUniFmtInterval {
    return { fmt, fromVal, tillVal };
}

export interface ILineSettings {
    interval: IUniFmtInterval;
    mainColor: string;
}

export function LineSettings(mainColor: string, fmt: IDateFormat, fromVal: number, tillVal: number): ILineSettings {
    return { interval: Interval(fmt, fromVal, tillVal), mainColor };
}

export interface IEvent {
    cpt: string | IMultiLangString,
    time: IMoment,
    scal: IMoment | null,
    img: string,
}
