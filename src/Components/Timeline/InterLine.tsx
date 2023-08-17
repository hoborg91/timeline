import React from "react";
import { PureDi } from "../../context";
import { ILineSettings, Interval } from "../../contracts/timeline";
import { ILineReference } from "../ifaces";

export const InterLine = ({ lineSettings, lsi, refe }: {
    lineSettings: ILineSettings[],
    lsi: number,
    refe: ILineReference[],
}) => {
    if (lsi >= lineSettings.length - 1)
        return <></>;

    const ls = lineSettings[lsi];
    const nextLs = lineSettings[lsi + 1];
    const curRef = refe[lsi];
    const nextRef = refe[lsi + 1];

    const di = React.useContext(PureDi);

    const intersection = di.time.GetIntersection(
        Interval(ls.interval.fmt, curRef.min, curRef.max),
        Interval(nextLs.interval.fmt, nextRef.min, nextRef.max)
    );

    if (intersection === "No intersection") {
        return <tr className="InterLine"><td></td><td style={{ height: "100px" }}></td><td></td></tr>;
    }

    const
        h100 = di.dimensions.mainTdHeight, h50 = Math.ceil(di.dimensions.mainTdHeight / 2),
        up1 = di.dimensions.mainTdWidth * (intersection.isc1.fromVal - curRef.min) / curRef.len,
        up2 = di.dimensions.mainTdWidth * (intersection.isc1.tillVal - curRef.min) / curRef.len,
        lo1 = di.dimensions.mainTdWidth * (intersection.isc2.fromVal - nextRef.min) / nextRef.len,
        lo2 = di.dimensions.mainTdWidth * (intersection.isc2.tillVal - nextRef.min) / nextRef.len;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${di.dimensions.mainTdWidth} ${h100}">
        <defs>
            <linearGradient fx="0" fy="0.49" id="svg_1" x2="0" y2="1">
                <stop id="jq_stop_3595" offset="0" stop-color="${curRef.mainColor}"/>
                <stop id="jq_stop_9701" offset="1" stop-color="${nextRef.mainColor}"/>
            </linearGradient>
        </defs>
        <path
            d="M${lo1},${h100} C${lo1},${h50} ${up1},${h50} ${up1},0 L${up2},0 C${up2},${h50} ${lo2},${h50} ${lo2},${h100} z"
            fill="url(#svg_1)"
            stroke="none" />
    </svg>`;
    const smth = 'url("data:image/svg+xml;base64,' + btoa(svg) + '")';
    
    const style = {
        height: h100 + "px",
        backgroundImage: smth,
    };

    return <tr className="InterLine"><td></td><td style={style}></td><td></td></tr>;
}