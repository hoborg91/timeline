import { IDateFormat, IEvent, IMoment } from "../dtos";

export interface ILineReference {
    min: number;
    max: number;
    len: number;
    eventsToRender: IEvent<IDateFormat>[];
    mainColor: string;
}

export interface IEventCluster<T extends IDateFormat> {
    events: IEvent<T>[];
    meanReal: IMoment<T>;
    minReal: IMoment<T>;
    maxReal: IMoment<T>;
}

export type NumToStr = (n: number) => string;
