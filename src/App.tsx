import React from "react";
import all from "../data/data.json";
import { Settings } from "./Components/Settings";
import { TimeLine } from "./Components/Timeline";
import { IDateFormat, IEvent, ILineSettings, Interval } from "./dtos";

export const App = () => {
    const [lineSettings, setLineSettings] = React.useState([
        { interval: Interval("my", -500, 1) },
        { interval: Interval("y", -50000, 10000) },
    ] as ILineSettings[]);
    const allEvents = all.events as IEvent<IDateFormat>[];

    return <div>
        <Settings currentSettings={lineSettings} apply={setLineSettings} />
        <TimeLine allEvents={allEvents} lineSettings={lineSettings} />
    </div>;
}
