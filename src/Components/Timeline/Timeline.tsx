import React from "react";
import { Context } from "../../context";
import { ITimeWizard } from "../../Services/time"
import { IDateFormat, IEvent, ILineSettings, Moment } from "../../contracts/timeline";
import { Throw } from "../../utils";
import { InterLine } from "./InterLine";
import { MainLine } from "./MainLine";

function _makeRef(
    lineSettings: ILineSettings[],
    allEvents: IEvent[],
    time: ITimeWizard
) {
    const lsRefs = lineSettings.map(ls => {
        if (!(ls.interval.fmt === "my" || ls.interval.fmt === "y"))
            throw new Error();
        return {
            ls,
            min: ls.interval.fromVal,
            max: ls.interval.tillVal,
            len: ls.interval.tillVal - ls.interval.fromVal,
            fmt: ls.interval.fmt,
            minMoment: Moment(ls.interval.fmt, ls.interval.fromVal),
            maxMoment: Moment(ls.interval.fmt, ls.interval.tillVal),
            eventsToRender: [] as IEvent[],
            mainColor: ls.mainColor,
        };
    });

    for (const evt of allEvents) {
        const scal = evt.scal || (evt.time.fmt === "my" || evt.time.fmt === "y"
            ? Moment(evt.time.fmt, evt.time.val / 10)
            : Throw("The given format is not supported."));
        let
            minLen: number | null = null,
            minIdx: number | null = null;
        for (let ri = 0; ri < lsRefs.length; ri++) {
            const r = lsRefs[ri];
            const rLen = time.ConvertTo(r.len, r.ls.interval.fmt, evt.time.fmt);
            const scalVal = time.ConvertTo(scal, evt.time.fmt).val;
            if (true
                //&& r.ls.interval.fmt === evt.time.fmt
                && rLen >= scalVal
                && time.Contains(r.ls.interval, evt.time)
                && (minLen === null || rLen < minLen)
            ) {
                [ minLen, minIdx ] = [ rLen, ri ];
            }
        }
        if (minIdx === null)
            continue;
        
        const lsRef = lsRefs[minIdx];
        lsRef.eventsToRender.push({ ...evt, time: time.ConvertTo(evt.time, lsRef.fmt) });
    }

    return lsRefs;
}

export const TimeLine = ({ lineSettings, allEvents }: {
    lineSettings: ILineSettings[],
    allEvents: IEvent[]
}) => {
    const ctx = React.useContext(Context);

    const refe = _makeRef(lineSettings, allEvents, ctx.time);

    const trTsxs = lineSettings
        .map((ls, lsi) => [
            <MainLine lineSettings={lineSettings} lsi={lsi} curRef={refe[lsi]} key={"MainLine" + lsi} />,
            <InterLine lineSettings={lineSettings} lsi={lsi} refe={refe} key={"InterLine" + lsi} />]
        )
        .flat();

    const tableWidth = ctx.dimensions.mainTdWidth + ctx.dimensions.sideTdWidth * 2;

    return <table style={{ width: tableWidth + "px" }} className="TimeLine">
        <tbody>{trTsxs}</tbody>
    </table>;
}
