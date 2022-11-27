import React from "react";
import { IDateFormat, IEvent, ILineSettings, IMoment, Moment } from "../dtos";
import { Mapping } from "../Services/time";
import { Description } from "./Description";
import { ILineReference, NumToStr } from "./ifaces";

interface IEventCluster<T extends IDateFormat> {
    events: IEvent<T>[];
    meanReal: IMoment<T>;
    minReal: IMoment<T>;
    maxReal: IMoment<T>;
}

const _dims = {
    mainTdWidth: 600,
    mainTdHeight: 100,
    descrBoxWidth: 150,
    descrBoxHeight: 50,
};

function _makeRowRef(curRef: ILineReference, mapping: Mapping<IDateFormat>): { 
    clusters: IEventCluster<IDateFormat>[] 
} {
    const clustersCount = 2, clusterWidthRnd = _dims.mainTdWidth / clustersCount;
    const tuneRnd = 0;

    const clusters: IEventCluster<IDateFormat>[] = [];
    const evtToClst = curRef.eventsToRender.map(e => null as ({} | null));

    for (let ci = 0; ci < clustersCount; ci++) {
        const
            clLeftRnd = Math.floor(ci * clusterWidthRnd - tuneRnd),
            clRightRnd = Math.ceil((ci + 1) * clusterWidthRnd + tuneRnd);
        const events: IEvent<IDateFormat>[] = [];
        const eventIndices: number[] = [];
        let min: number | null = null, max: number | null = null, sum = 0;
        for (let ei = 0; ei < curRef.eventsToRender.length; ei++) {
            if (evtToClst[ei] !== null)
                continue;
            const evt = curRef.eventsToRender[ei];
            const evtTimeRnd = mapping.FromRealToRender(evt.time);
            if (clLeftRnd <= evtTimeRnd && evtTimeRnd <= clRightRnd) {
                events.push(evt);
                eventIndices.push(ei);
                if (min === null || evt.time.val <= min)
                    min = evt.time.val;
                if (max === null || evt.time.val >= max)
                    max = evt.time.val;
                sum += evt.time.val;
            }
        }
        if (events.length === 0)
            continue;
        const fmt = events[0].time.fmt;
        const cluster: IEventCluster<IDateFormat> = {
            events,
            meanReal: Moment(fmt, sum / events.length),
            minReal: Moment(fmt, min),
            maxReal: Moment(fmt, max),
        };
        for (let ei of eventIndices) {
            evtToClst[ei] = cluster;
        }
        clusters.push(cluster);
    }

    return { clusters };
}

const Event = ({ cluster, leftRender, ci }: {
    cluster: IEventCluster<IDateFormat>,
    leftRender: number,
    ci: number,
}) => {
    let ei = 0, images = 0;
    const imgTsxs = [];
    for (let e of cluster.events) {
        if (e.img === undefined || e.img === null)
            continue;
        images++;
        if (images > 3)
            break;

        imgTsxs.push(<img style={{ height: "50px" }} src={e.img} />);
        ei++;
    }

    const style = {
        left: leftRender + "px",
        top: "20px",
        zIndex: ci,
        position: "absolute" as const,
    };

    return <div style={style}>{imgTsxs}</div>;
}

export const MainLine = ({ lineSettings, lsi, curRef, fmtDt }: 
    { lineSettings: ILineSettings[], lsi: number, curRef: ILineReference, fmtDt: NumToStr }) => {
        const ls = lineSettings[lsi];
        const mapping = new Mapping(_dims.mainTdWidth, ls.interval);
        const rowRef = _makeRowRef(curRef, mapping);

        const evtTsxs = [];
        
        for (let ci = 0; ci < rowRef.clusters.length; ci++) {
            const cluster = rowRef.clusters[ci];
            const evt = {
                timeVal: cluster.meanReal.val as number,
                img: cluster.events.length === 1 ? cluster.events[0].img : null,
            };
            const leftRel = (evt.timeVal - curRef.min) / curRef.len;
            const leftRender = leftRel * _dims.mainTdWidth - 20; // TODO 20, 50 and so on - magic numbers. Refactor.
            
            evtTsxs.push(<Event
                cluster={cluster}
                leftRender={leftRender}
                ci={ci} />);
            evtTsxs.push(<Description
                cluster={cluster}
                evt={evt}
                leftRender={leftRender}
                ci={ci}
                fmtDt={fmtDt} />)
        }

        const style = {
            backgroundColor: curRef.mainColor,
            width: _dims.mainTdWidth + "px",
            height: _dims.mainTdHeight + "px",
            position: "relative" as const,
        };
        
    return <tr><td>{fmtDt(curRef.min)}</td><td style={style}>{evtTsxs}</td><td>{fmtDt(curRef.max)}</td></tr>;
}
