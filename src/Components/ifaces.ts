import { IDateFormat, IEvent, IMoment, IUniFmtInterval } from "../contracts/timeline";

export interface ILineReference {
    min: number;
    max: number;
    len: number;
    minMoment: IMoment<IDateFormat>;
    maxMoment: IMoment<IDateFormat>;
    eventsToRender: IEvent<IDateFormat>[];
    mainColor: string;
}

export interface IEventCluster<T extends IDateFormat> {
    events: IEvent<T>[];
    meanReal: IMoment<T>;
    minReal: IMoment<T>;
    maxReal: IMoment<T>;
    intervalReal: IUniFmtInterval<IDateFormat>;
    scopeRender: { min: number, max: number };
}

export type NumToStr = (n: number) => string;

export type IntervalToStr = (i: IUniFmtInterval<IDateFormat>) => string;
