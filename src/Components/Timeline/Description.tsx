import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { PureDi } from "../../context";
import { IMoment } from "../../contracts/timeline";
import { IEventCluster } from "../ifaces";
import { compact } from "./utils";

const Caption = ({ cluster, leftRender }: {
    cluster: IEventCluster,
    leftRender: number,
}) => {
    // TODO https://stackoverflow.com/questions/37406353/make-container-shrink-to-fit-child-elements-as-they-wrap

    const di = React.useContext(PureDi);

    if (cluster.events.length === 1) {
        const evt = cluster.events[0];
        const text  = di.text.toString(evt.cpt) ?? di.text.locResource("unkevt");
        return <div>{text}<br /><small>{di.timeFormatter.format(evt.time)}</small></div>;
    }

    let mainPart = null as string | null;
    let maxEventsCount = 4, renderedCount = 0;
    for (; maxEventsCount > 0 && (mainPart === null || mainPart.length > 60); maxEventsCount--) {
        renderedCount = cluster.events.length > maxEventsCount
            ? (maxEventsCount - 1)
            : cluster.events.length;
        if (renderedCount === 0) {
            mainPart = null;
            break;
        }
        mainPart = cluster.events
            .slice(0, renderedCount)
            .map(e => di.text.toString(e.cpt) ?? di.text.locResource("unkevt"))
            .reduce((acc, add) => acc + ", " + add);
    }
    
    let extraPart = "";
    const extraCount = cluster.events.length - renderedCount;
    if (extraCount > 0) {
        extraPart = renderedCount > 0
            ? `${di.text.locResource("and_otherevts", extraCount)}`
            : `${di.text.locResource("_evts", extraCount)}`;
    }

    const popover = (
        <Popover>
            <Popover.Body>
                <ul>
                    {cluster.events.map((e, ei) => <li key={ei}>{di.text.toString(e.cpt) ?? di.text.locResource("unkevt")} ({di.timeFormatter.format(e.time)})</li>)}
                </ul>
            </Popover.Body>
        </Popover>
    );

    const placement = leftRender <= di.dimensions.mainTdWidth / 2
        ? "right"
        : "left";

    return <OverlayTrigger trigger="click" placement={placement} overlay={popover}>
        <div>{mainPart} <i>{extraPart}</i></div>
    </OverlayTrigger>;
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
    const dims = React.useContext(PureDi).dimensions;
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
    </div>;
}