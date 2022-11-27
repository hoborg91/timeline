import { IDateFormat, IEvent, ILineSettings, Interval } from "./dtos";
import { Main } from "./main";
import all from "./data.json";
import { Throw } from "./utils";
import { TimeWizard } from "./time";
import { StringUtils } from "./text";

const allEvents = all.events as IEvent<IDateFormat>[];

const table = document.getElementById(`timeline-table`) ?? Throw("Cannot find the container.");

const lineSettings: ILineSettings[] = [
	{ interval: Interval("my", -500, 1) },
	{ interval: Interval("y", -50000, 10000) },
];

new Main(
    new TimeWizard(),
    new StringUtils(navigator.languages)
).Render(
    lineSettings,
    allEvents,
    {
        createElement: s => document.createElement(s),
        addRow: tr => table.appendChild(tr),
    }
);
