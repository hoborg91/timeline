import React from "react";
import all from "../data/data.json";
import { Settings } from "./Components/Settings/Settings";
import { TimeLine } from "./Components/Timeline/Timeline";
import { IDateFormat, IEvent, ILineSettings, LineSettings } from "./contracts/timeline";

export const App = () => {
    const [lineSettings, setLineSettings] = React.useState([
        LineSettings("#abcdef", "my", -14000, -4000),
        LineSettings("#efcdab", "my", -5000, 1),
    ] as ILineSettings[]);
    const allEvents = all.events as IEvent<IDateFormat>[];

    return <div>
        <Settings currentSettings={lineSettings} apply={setLineSettings} />
        <TimeLine allEvents={allEvents} lineSettings={lineSettings} />
    </div>;
}
