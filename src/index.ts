import { IDateFormat, IEvent, ILineSettings } from "./dtos";
import { Main } from "./main";
import all from "./data.json";

function Throw(errorMessage?: string): never {
    throw new Error(errorMessage);
}

const allEvents = all.events as IEvent<IDateFormat>[];

const table = document.getElementById(`timeline-table`) ?? Throw("Cannot find the container.");

const lineSettings: ILineSettings[] = [
	{ interval: { fromVal: -250, tillVal: 1, fmt: "my" } },
	{ interval: { fromVal: -50000, tillVal: 10000, fmt: "y" } },
];

new Main().Render(
    lineSettings,
    allEvents,
    {
        getElementById: s => document.getElementById(s) ?? Throw(`Cannot find an element with id "${s}".`),
        createElement: s => document.createElement(s),
        addRow: tr => table.appendChild(tr),
    }
)