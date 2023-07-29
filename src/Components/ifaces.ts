import { IDateFormat, IEvent, IMoment, IUniFmtInterval } from "../contracts/timeline";

export interface ILineReference {
    min: number;
    max: number;
    len: number;
    fmt: IDateFormat;
    minMoment: IMoment;
    maxMoment: IMoment;
    eventsToRender: IEvent[];
    mainColor: string;
}

export interface IEventCluster {
    events: IEvent[];
    meanReal: IMoment;
    minReal: IMoment;
    maxReal: IMoment;
    intervalReal: IUniFmtInterval;
    scopeRender: { min: number, max: number };
}

export type NumToStr = (n: number) => string;

export type IntervalToStr = (i: IUniFmtInterval) => string;
