import React from "react";
import all from "../data/data.json";
import { Settings } from "./Components/Settings/Settings";
import { TimeLine } from "./Components/Timeline/Timeline";
import { IDateFormat, IEvent, ILineSettings, LineSettings } from "./contracts/timeline";
import allPalette from "../data/palette.json";
import { LanguageSelection } from "./Components/Settings/LanguageSelection";
import { Context } from "./context";
import { LangMonkier } from "./contracts/text";

const _palette = allPalette.standard as string[];

export const App = () => {
    const ctx = React.useContext(Context);

    const setForceUpdateDummy = React.useState(0)[1];
    const forceUpdate = () => setForceUpdateDummy(x => x + 1);

    let colorIndex = 0;
    const color = () => {
        const result = _palette[colorIndex % _palette.length];
        colorIndex++;
        return result;
    }
    const [lineSettings, setLineSettings] = React.useState([
        LineSettings(color(), "my", -14000, 1),
        LineSettings(color(), "my", -2500, 1),
        LineSettings(color(), "my", -300, 1),
        LineSettings(color(), "y", -2000000, 2000),
        LineSettings(color(), "y", -10000, 2000),
        LineSettings(color(), "y", -1000, 2000),
        LineSettings(color(), "y", 1400, 2000),
        LineSettings(color(), "y", 1900, 2000),
    ] as ILineSettings[]);
    const allEvents = all.events as IEvent[];

    const changeLang = (lang: LangMonkier) => {
        ctx.setLanguage(lang);
        forceUpdate();
    };

    return <>
        <Settings currentSettings={lineSettings} apply={setLineSettings} />
        <LanguageSelection set={changeLang} />
        <TimeLine allEvents={allEvents} lineSettings={lineSettings} />
    </>;
}
