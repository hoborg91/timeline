import React from "react";
import { Context } from "../../context";
import { IDateFormat, IMoment } from "../../contracts/timeline";
import { IEventCluster, NumToStr } from "../ifaces";

const _dims = {
    mainTdWidth: 600,
    mainTdHeight: 100,
    descrBoxWidth: 150,
    descrBoxHeight: 50,
};

const Caption = ({ cluster }: {
    cluster: IEventCluster<IDateFormat>,
}) => {
    const ctx = React.useContext(Context);

    if (cluster.events.length === 1) {
        const text  = ctx.text.toString(cluster.events[0].cpt) ?? ctx.text.locResource("unkevt");
        return <div>{text}</div>;
    }

    const renderedCount = cluster.events.length > 4
        ? 3
        : cluster.events.length;
    const mainPart = cluster.events
        .slice(0, renderedCount)
        .map(e => ctx.text.toString(e.cpt) ?? ctx.text.locResource("unkevt"))
        .reduce((acc, add) => acc + ", " + add);
    let extraPart = "";
    const extraCount = cluster.events.length - renderedCount;
    if (extraCount > 0) {
        extraPart = `${ctx.text.locResource("otherevts", extraCount)}`;
    }

    return <div>{mainPart} <i>{extraPart}</i></div>;
}

const Date = ({ cluster, evt }: {
    cluster: IEventCluster<IDateFormat>,
    evt: { timeVal: number, img: string | null, timeMoment: IMoment<IDateFormat> },
}) => {
    const ctx = React.useContext(Context);

    if (cluster.events.length === 1) {
        return <div><small>{ctx.timeFormatter.format(evt.timeMoment)}</small></div>;
    }

    return <div><small>{ctx.timeFormatter.format(cluster.interval)}</small></div>;
}

export const Description = ({ci, cluster, evt, leftRender }: {
    ci: number,
    cluster: IEventCluster<IDateFormat>,
    evt: { timeVal: number, img: string | null, timeMoment: IMoment<IDateFormat> },
    leftRender: number,
}) => {        
    const style = {
        width: _dims.descrBoxWidth + "px",
        left: leftRender + "px",
        top: "-60px",
        zIndex: ci,
        position: "absolute" as const,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    };

    return <div style={style}>
        <Caption cluster={cluster} />
        <Date cluster={cluster} evt={evt} />
    </div>;
}