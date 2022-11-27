import React from "react";
import ReactDOM from "react-dom";
import all from "../data/data.json";
import { IDateFormat, IEvent, ILineSettings, Interval } from "./dtos";
import { TimeLine } from "./Components/Timeline";

const allEvents = all.events as IEvent<IDateFormat>[];

const lineSettings: ILineSettings[] = [
	{ interval: Interval("my", -500, 1) },
	{ interval: Interval("y", -50000, 10000) },
];

ReactDOM.render(<TimeLine
    lineSettings={lineSettings}
    allEvents={allEvents} />,
    document.getElementById("container")
);
