import React from "react";
import { Context } from "../../context";
import { ITimeWizard } from "../../Services/time"
import { IDateFormat, IEvent, ILineSettings, Moment } from "../../contracts/timeline";
import { Throw } from "../../utils";
import { InterLine } from "./InterLine";
import { MainLine } from "./MainLine";

function _makeRef(
    lineSettings: ILineSettings[],
    allEvents: IEvent<IDateFormat>[],
    time: ITimeWizard
) {
    const refe = lineSettings.map(ls => {
        if (!(ls.interval.fmt === "my" || ls.interval.fmt === "y"))
            throw new Error();
        return {
            ls,
            min: ls.interval.fromVal,
            max: ls.interval.tillVal,
            len: ls.interval.tillVal - ls.interval.fromVal,
            minMoment: Moment(ls.interval.fmt, ls.interval.fromVal),
            maxMoment: Moment(ls.interval.fmt, ls.interval.tillVal),
            eventsToRender: [] as IEvent<IDateFormat>[],
            mainColor: ls.mainColor,
        };
    });

    for (const evt of allEvents) {
        const scal = evt.scal || (evt.time.fmt === "my" || evt.time.fmt === "y"
            ? Moment(evt.time.fmt, evt.time.val / 10) // TODO Refactor.
            : Throw("The given format is not supported."));
        let minLen: number | null = null, minIdx: number | null = null;
        for (let ri = 0; ri < refe.length; ri++) {
            const r = refe[ri];
            if (true
                && r.ls.interval.fmt === evt.time.fmt
                && r.len >= scal.val
                && time.Contains(r.ls.interval, evt.time)
                && (minLen === null || r.len < minLen)
            ) {
                [ minLen, minIdx ] = [ r.len, ri ];
            }
        }
        if (minIdx === null)
            continue;
        
        refe[minIdx].eventsToRender.push(evt);
    }

    return refe;
}

// const _thousand = 1000;
// const _million = 1000 * 1000;



// const _dateFormatters = (text: ITextWizard) => {
//     const myFormatter: NumToStr = (time: number) => {
//         if (time >= 0) {
//             return time >= _thousand
//                 ? text.locResource("_by", Math.round((time / _thousand) * 10) / 10)
//                 : text.locResource("_my", time);
//         } else {
//             return time <= -_thousand
//                 ? text.locResource("_bybce", -Math.round((time / _thousand) * 10) / 10)
//                 : text.locResource("_mybce", -time);
//         }
//     };
    
//     const yFormmater: NumToStr = (time: number) => {
//         if (time >= 0) {
//             return time >= _million
//                 ? text.locResource("_my", Math.round((time / _million) * 10) / 10)
//                 : text.locResource("_y", time);
//         } else {
//             return time <= -_million
//                 ? text.locResource("_mybce", -Math.round((time / _million) * 10) / 10)
//                 : text.locResource("_ybce", -time);
//         }
//     };

//     return {
//         my: myFormatter,
//         y: yFormmater,
//     } as {
//         [K in IDateFormat]: NumToStr;
//     };
// };

export const TimeLine = ({ lineSettings, allEvents }: {
    lineSettings: ILineSettings[],
    allEvents: IEvent<IDateFormat>[]
}) => {
    const ctx = React.useContext(Context);

    const refe = _makeRef(lineSettings, allEvents, ctx.time);

    const trTsxs = lineSettings
        .map((ls, lsi) => [
            <MainLine lineSettings={lineSettings} lsi={lsi} curRef={refe[lsi]} />,
            <InterLine lineSettings={lineSettings} lsi={lsi} refe={refe} />]
        )
        .flat();

    return <table>{trTsxs}</table>;
}




