import React from "react";
import { IDateFormat, IEvent, ILineSettings, IMoment, Interval, Moment } from "../../contracts/timeline";
import { Mapping } from "../../Services/time";
import { IEventCluster, ILineReference } from "../ifaces";
import { Context, IDimensions } from "../../context";
import { ClusterAndDescr } from "./ClusterAndDescr";

function _clusterSettings(dims: IDimensions) {
    let clustersCount: number, clusterWidthRnd: number;
    clusterWidthRnd = dims.descrBoxWidth;
    clustersCount = Math.floor(dims.mainTdWidth / clusterWidthRnd);
    clusterWidthRnd = dims.mainTdWidth / clustersCount;
    return { clustersCount, clusterWidthRnd };
}

function _makeRowRef(
    curRef: ILineReference,
    mapping: Mapping<IDateFormat>,
    dims: IDimensions
): { 
    clusters: IEventCluster<IDateFormat>[],
    clusterWidthRnd: number,
} {
    // TODO 1. Refactor this (clustersCount may not be an appropriate way to determine clusters).
    const { clustersCount, clusterWidthRnd } = _clusterSettings(dims);
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
        events.sort((a, b) => a.time.val - b.time.val);
        const fmt = events[0].time.fmt;
        const cluster: IEventCluster<IDateFormat> = {
            events,
            meanReal: Moment(fmt, sum / events.length),
            minReal: Moment(fmt, min),
            maxReal: Moment(fmt, max),
            intervalReal: Interval(fmt, min, max),
            scopeRender: { min: clLeftRnd, max: clRightRnd },
        };
        for (let ei of eventIndices) {
            evtToClst[ei] = cluster;
        }

        clusters.push(cluster);
    }

    return { clusters, clusterWidthRnd };
}

export const MainLine = ({ lineSettings, lsi, curRef }: 
    { lineSettings: ILineSettings[], lsi: number, curRef: ILineReference }
) => {
    const ctx = React.useContext(Context);
    const ls = lineSettings[lsi];
    const mapping = new Mapping(ctx.dimensions.mainTdWidth, ls.interval);
    const rowRef = _makeRowRef(curRef, mapping, ctx.dimensions);

    const evtTsxs = [];
    
    for (let ci = 0; ci < rowRef.clusters.length; ci++) {
        const cluster = rowRef.clusters[ci];

        evtTsxs.push(<ClusterAndDescr cluster={cluster} curRef={curRef} />);
    }

    const style = {
        backgroundColor: curRef.mainColor,
        width: ctx.dimensions.mainTdWidth + "px",
        height: ctx.dimensions.mainTdHeight + "px",
        position: "relative" as const,
    };
    
    return <tr>
        <td style={{ textAlign: "right", width: ctx.dimensions.sideTdWidth + "px" }}>
            {ctx.timeFormatter.format(curRef.minMoment)}
        </td>
        <td style={style}>
            {evtTsxs}
        </td>
        <td style={{ width: ctx.dimensions.sideTdWidth + "px" }}>
            {ctx.timeFormatter.format(curRef.maxMoment)}
        </td>
    </tr>;
}
