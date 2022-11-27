import React from "react";
import { ILineSettings } from "../dtos";

const LineSettings = ({ ls }: { ls: ILineSettings }) => {
    return <div>
        <input value={ls.interval.fmt} type="text" />
        <input value={ls.interval.fromVal} type="number" />
        <input value={ls.interval.tillVal} type="number" />
        <button>Remove</button>
    </div>;
}

export const Settings = ({ currentSettings, apply }: {
    currentSettings: ILineSettings[],
    apply: (newSettings: ILineSettings[]) => any,
}) => {
    return <div>
        {currentSettings.map(ls => <LineSettings ls={ls} />)}
        <button onClick={() => { console.log("add"); }}>+</button>
    </div>;
}
