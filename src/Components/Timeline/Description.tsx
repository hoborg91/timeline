import React from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { Context } from "../../context";
import { IDateFormat, IMoment } from "../../contracts/timeline";
import { IEventCluster, NumToStr } from "../ifaces";

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

    const popover = (
        <Popover>
            <Popover.Body>
                <ul>
                    {cluster.events.map(e => <li>{ctx.text.toString(e.cpt) ?? ctx.text.locResource("unkevt")} ({ctx.timeFormatter.format(e.time)})</li>)}
                </ul>
            </Popover.Body>
        </Popover>
    );

    return <OverlayTrigger trigger="click" placement="right" overlay={popover}>
        <div>{mainPart} <i>{extraPart}</i></div>
    </OverlayTrigger>;
}

const Date = ({ cluster, evt }: {
    cluster: IEventCluster<IDateFormat>,
    evt: { timeVal: number, img: string | null, timeMoment: IMoment<IDateFormat> },
}) => {
    const ctx = React.useContext(Context);

    if (cluster.events.length === 1) {
        //console.log(cluster.events[0].cpt);
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
    const dims = React.useContext(Context).dimensions;

    const style = {
        width: dims.descrBoxWidth + "px",
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