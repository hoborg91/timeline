import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Context } from "../../context";
import { IMoment } from "../../contracts/timeline";
import { IEventCluster } from "../ifaces";
import { compact } from "./utils";

const Caption = ({ cluster, leftRender }: {
    cluster: IEventCluster,
    leftRender: number,
}) => {
    // TODO https://stackoverflow.com/questions/37406353/make-container-shrink-to-fit-child-elements-as-they-wrap

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
                    {cluster.events.map((e, ei) => <li key={ei}>{ctx.text.toString(e.cpt) ?? ctx.text.locResource("unkevt")} ({ctx.timeFormatter.format(e.time)})</li>)}
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
    cluster: IEventCluster,
    evt: { timeMoment: IMoment },
}) => {
    const ctx = React.useContext(Context);

    if (cluster.events.length === 1) {
        return <div><small>{ctx.timeFormatter.format(evt.timeMoment)}</small></div>;
    }

    return <div><small>{ctx.timeFormatter.format(cluster.intervalReal)}</small></div>;
}

export const Description = ({ci, cluster, evt, leftRender, descrWidthRedner, widthRender, eventImageMontageCenter }: {
    ci: number,
    cluster: IEventCluster,
    evt: { timeMoment: IMoment },
    leftRender: number,
    descrWidthRedner: number,
    widthRender: number,
    eventImageMontageCenter: number,
}) => {
    const dims = React.useContext(Context).dimensions;
    const compacted = compact(eventImageMontageCenter - descrWidthRedner / 2, descrWidthRedner, cluster.scopeRender);
    
    const style = {
        maxWidth: descrWidthRedner + "px",
        left: compacted + "px",
        bottom: (dims.mainTdHeight + 10) + "px",
        zIndex: ci,
        position: "absolute" as const,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        wordWrap: "break-word" as const,
    };

    const myRef = React.createRef<HTMLDivElement>();
    window.requestAnimationFrame(() => {
        if (myRef.current) {
            const cmp = compact(
                eventImageMontageCenter - myRef.current.offsetWidth / 2,
                myRef.current.offsetWidth,
                cluster.scopeRender
            ) + "px";

            myRef.current.style.left = cmp;
        }
    });
    return <div style={style} ref={myRef} className="Description">
        <Caption cluster={cluster} leftRender={leftRender} />
        {/* <Date cluster={cluster} evt={evt} /> */}
    </div>;
}