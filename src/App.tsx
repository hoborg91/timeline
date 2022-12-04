import React from "react";
import all from "../data/data.json";
import { Settings } from "./Components/Settings/Settings";
import { TimeLine } from "./Components/Timeline/Timeline";
import { IDateFormat, IEvent, ILineSettings, LineSettings } from "./contracts/timeline";
import allPalette from "../data/palette.json";

const _palette = allPalette.standard as string[];

export const App = () => {
    const [lineSettings, setLineSettings] = React.useState([
        LineSettings(_palette[0 % _palette.length], "my", -14000, 1),
        LineSettings(_palette[1 % _palette.length], "my", -4000, 1),
        LineSettings(_palette[2 % _palette.length], "y", -2000000, 2000),
        LineSettings(_palette[3 % _palette.length], "y", -1000, 2000),
        LineSettings(_palette[4 % _palette.length], "y", 1400, 2000),
        LineSettings(_palette[5 % _palette.length], "y", 1900, 2000),
    ] as ILineSettings[]);
    const allEvents = all.events as IEvent<IDateFormat>[];

    return <div>
        <Settings currentSettings={lineSettings} apply={setLineSettings} />
        <TimeLine allEvents={allEvents} lineSettings={lineSettings} />
    </div>;
}
