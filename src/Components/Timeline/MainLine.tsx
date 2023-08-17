import React from "react";
import { IEvent, ILineSettings, Interval, Moment } from "../../contracts/timeline";
import { Mapping } from "../../Services/time";
import { IEventCluster, ILineReference } from "../ifaces";
import { PureDi, IDimensions } from "../../context";
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
    mapping: Mapping,
    dims: IDimensions
): { 
    clusters: IEventCluster[],
    clusterWidthRnd: number,
} {
    const { clustersCount, clusterWidthRnd } = _clusterSettings(dims);
    const tuneRnd = 0;

    const clusters: IEventCluster[] = [];
    const evtToClst = curRef.eventsToRender.map(e => null as ({} | null));

    for (let ci = 0; ci < clustersCount; ci++) {
        const
            clLeftRnd = Math.floor(ci * clusterWidthRnd - tuneRnd),
            clRightRnd = Math.ceil((ci + 1) * clusterWidthRnd + tuneRnd);
        const events: IEvent[] = [];
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
        const cluster: IEventCluster = {
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
    const di = React.useContext(PureDi);
    const ls = lineSettings[lsi];
    const mapping = new Mapping(di.dimensions.mainTdWidth, ls.interval, di.time);
    const rowRef = _makeRowRef(curRef, mapping, di.dimensions);

    const evtTsxs = [];
    
    for (let ci = 0; ci < rowRef.clusters.length; ci++) {
        const cluster = rowRef.clusters[ci];

        evtTsxs.push(<ClusterAndDescr cluster={cluster} curRef={curRef} key={ci} />);
    }

    const style = {
        backgroundColor: curRef.mainColor,
        width: di.dimensions.mainTdWidth + "px",
        height: di.dimensions.mainTdHeight + "px",
        position: "relative" as const,
    };
    
    return <tr className="MainLine">
        <td style={{ textAlign: "right", width: di.dimensions.sideTdWidth + "px" }}>
            {di.timeFormatter.format(curRef.minMoment)}
        </td>
        <td style={style}>
            {evtTsxs}
        </td>
        <td style={{ width: di.dimensions.sideTdWidth + "px" }}>
            {di.timeFormatter.format(curRef.maxMoment)}
        </td>
    </tr>;
}
