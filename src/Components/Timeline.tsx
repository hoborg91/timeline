import React from "react";
import { Context } from "../context";
import { IDateFormat, IEvent, ILineSettings } from "../dtos";
import { ILineReference, NumToStr } from "./ifaces";
import { InterLine } from "./InterLine";
import { MainLine } from "./MainLine";

const _palette = [
    "#abcdef",
    "#fedcba",
    "#cdabef",
    "#cdefab",
    "#dcfeba",
    "#dcbafe",
];

function _makeRef(
    lineSettings: ILineSettings[],
    allEvents: IEvent<IDateFormat>[]
) {
    const refe: ILineReference[] = [];

    for (let lsi = 0; lsi < lineSettings.length; lsi++) {
        const ls = lineSettings[lsi];
        if (!(ls.interval.fmt === "my" || ls.interval.fmt === "y"))
            throw new Error();

        const eventsToRender = [];
        for (const evt of allEvents) {
            if (evt.time.fmt !== ls.interval.fmt)
                continue;
            
            eventsToRender.push(evt);
        }
    
        if (eventsToRender.length === 0)
            throw new Error("No suitable events to render.");

        refe[lsi] = {
            min: ls.interval.fromVal,
            max: ls.interval.tillVal,
            len: ls.interval.tillVal - ls.interval.fromVal,
            eventsToRender,
            mainColor: _palette[lsi % _palette.length],
        };
    }

    return refe;
}

export const TimeLine = ({ lineSettings, allEvents }: {
    lineSettings: ILineSettings[],
    allEvents: IEvent<IDateFormat>[]
}) => {
    const ctx = React.useContext(Context);

    const _dateFormatters: {
        [K in IDateFormat]: NumToStr;
    } = {
        my: (time: number) => time >= 0 ? ctx.text.locResource("_my", time) : ctx.text.locResource("_mybce", -time),
        y: (time: number) => time >= 0 ? ctx.text.locResource("_y", time) : ctx.text.locResource("_ybce", -time)
    };

    const refe = _makeRef(lineSettings, allEvents);

    const trTsxs = lineSettings
        .map((ls, lsi) => [
            <MainLine lineSettings={lineSettings} lsi={lsi} curRef={refe[lsi]} fmtDt={_dateFormatters[lineSettings[lsi].interval.fmt]} />,
            <InterLine lineSettings={lineSettings} lsi={lsi} refe={refe} />]
        )
        .flat();

    return <table>{trTsxs}</table>;
}




