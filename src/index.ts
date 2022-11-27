import { IDateFormat, IEvent, ILineSettings, Interval } from "./dtos";
import { Main } from "./main";
import all from "./data.json";
import { Throw } from "./utils";

const allEvents = all.events as IEvent<IDateFormat>[];

const table = document.getElementById(`timeline-table`) ?? Throw("Cannot find the container.");

const lineSettings: ILineSettings[] = [
	{ interval: Interval("my", -500, 1) },
	{ interval: Interval("y", -50000, 10000) },
];

new Main().Render(
    lineSettings,
    allEvents,
    {
        createElement: s => document.createElement(s),
        addRow: tr => table.appendChild(tr),
    }
);
