import React from "react";
import all from "../data/data.json";
import { Settings } from "./Components/Settings/Settings";
import { TimeLine } from "./Components/Timeline/Timeline";
import { IDateFormat, IEvent, ILineSettings, LineSettings } from "./contracts/timeline";
import allPalette from "../data/palette.json";

const _palette = allPalette.standard as string[];

export const App = () => {
    let colorIndex = 0;
    const color = () => {
        const result = _palette[colorIndex % _palette.length];
        colorIndex++;
        return result;
    }
    const [lineSettings, setLineSettings] = React.useState([
        LineSettings(color(), "my", -14000, 1),
        LineSettings(color(), "my", -4000, 1),
        LineSettings(color(), "my", -600, 1),
        LineSettings(color(), "y", -2000000, 2000),
        LineSettings(color(), "y", -1000, 2000),
        LineSettings(color(), "y", 1400, 2000),
        LineSettings(color(), "y", 1900, 2000),
    ] as ILineSettings[]);
    const allEvents = all.events as IEvent<IDateFormat>[];

    return <div>
        <Settings currentSettings={lineSettings} apply={setLineSettings} />
        <TimeLine allEvents={allEvents} lineSettings={lineSettings} />
    </div>;
}
