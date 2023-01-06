import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Context } from "../../context";
import { IDateFormat, IMoment } from "../../contracts/timeline";
import { IEventCluster } from "../ifaces";

const Caption = ({ cluster, leftRender }: {
    cluster: IEventCluster<IDateFormat>,
    leftRender: number,
}) => {
    const ctx = React.useContext(Context);

    if (cluster.events.length === 1) {
        const evt = cluster.events[0];
        const text  = ctx.text.toString(evt.cpt) ?? ctx.text.locResource("unkevt");
        return <div>{text}<br /><small>{ctx.timeFormatter.format(evt.time)}</small></div>;
    }

    let mainPart = null as string | null;
    let maxEventsCount = 4, renderedCount = 0;
    for (; maxEventsCount > 0 && (mainPart === null || mainPart.length > 60); maxEventsCount--) {
        renderedCount = cluster.events.length > maxEventsCount
            ? (maxEventsCount - 1)
            : cluster.events.length;
        mainPart = cluster.events
            .slice(0, renderedCount)
            .map(e => ctx.text.toString(e.cpt) ?? ctx.text.locResource("unkevt"))
            .reduce((acc, add) => acc + ", " + add);
    }
    
    let extraPart = "";
    const extraCount = cluster.events.length - renderedCount;
    if (extraCount > 0) {
        extraPart = renderedCount > 0
            ? `${ctx.text.locResource("and_otherevts", extraCount)}`
            : `${ctx.text.locResource("_evts", extraCount)}`;
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

    const placement = leftRender <= ctx.dimensions.mainTdWidth / 2
        ? "right"
        : "left";

    return <OverlayTrigger trigger="click" placement={placement} overlay={popover}>
        <div>{mainPart} <i>{extraPart}</i></div>
    </OverlayTrigger>;
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

export const Description = ({ci, cluster, evt, leftRender, descrWidthRedner }: {
    ci: number,
    cluster: IEventCluster<IDateFormat>,
    evt: { timeVal: number, img: string | null, timeMoment: IMoment<IDateFormat> },
    leftRender: number,
    descrWidthRedner: number,
}) => {
    const dims = React.useContext(Context).dimensions;
    console.log({ leftRender, descrWidthRedner });
    const style = {
        maxWidth: descrWidthRedner/*dims.descrBoxWidth*/ + "px",
        left: leftRender + "px",
        top: "-60px",
        zIndex: ci,
        position: "absolute" as const,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        wordWrap: "break-word" as const,
    };

    return <div style={style}>
        <Caption cluster={cluster} leftRender={leftRender} />
        {/* <Date cluster={cluster} evt={evt} /> */}
    </div>;
}