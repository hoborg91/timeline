import React from "react";
import all from "../data/data.json";
import { Settings } from "./Components/Settings/Settings";
import { TimeLine } from "./Components/Timeline/Timeline";
import { IEvent, ILineSettings, LineSettings } from "./contracts/timeline";
import allPalette from "../data/palette.json";
import { LanguageSelection } from "./Components/Settings/LanguageSelection";
import { PureDi } from "./context";
import { LangMonkier } from "./contracts/text";

const _palette = allPalette.standard as string[];

export const App = () => {
    const di = React.useContext(PureDi);

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
        LineSettings(color(), "my", -650, 1),
        LineSettings(color(), "my", -10, 1),
        LineSettings(color(), "y", -10000, 2000),
        LineSettings(color(), "y", 1000, 2000),
        LineSettings(color(), "y", 1900, 2000),
    ] as ILineSettings[]);
    const allEvents = all.events as IEvent[];

    const changeLang = (lang: LangMonkier) => {
        di.setLanguage(lang);
        forceUpdate();
    };

    return <>
        <Settings currentSettings={lineSettings} apply={setLineSettings} />
        <LanguageSelection set={changeLang} />
        <TimeLine allEvents={allEvents} lineSettings={lineSettings} />
    </>;
}
