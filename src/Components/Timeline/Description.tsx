import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Context } from "../../context";
import { IDateFormat, IMoment } from "../../contracts/timeline";
import { IEventCluster } from "../ifaces";
import { compact } from "./utils";

const Caption = ({ cluster, leftRender }: {
    cluster: IEventCluster<IDateFormat>,
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
    evt: { timeMoment: IMoment<IDateFormat> },
}) => {
    const ctx = React.useContext(Context);

    if (cluster.events.length === 1) {
        return <div><small>{ctx.timeFormatter.format(evt.timeMoment)}</small></div>;
    }

    return <div><small>{ctx.timeFormatter.format(cluster.intervalReal)}</small></div>;
}

export const Description = ({ci, cluster, evt, leftRender, descrWidthRedner, widthRender, eventImageMontageCenter }: {
    ci: number,
    cluster: IEventCluster<IDateFormat>,
    evt: { timeMoment: IMoment<IDateFormat> },
    leftRender: number,
    descrWidthRedner: number,
    widthRender: number,
    eventImageMontageCenter: number,
}) => {
    const dims = React.useContext(Context).dimensions;
    const compacted = compact(eventImageMontageCenter - descrWidthRedner / 2, descrWidthRedner, cluster.scopeRender);
    //console.log({ leftRender, descrWidthRedner });
    const style = {
        maxWidth: descrWidthRedner/*dims.descrBoxWidth*/ + "px",
        left: compacted + "px",
        //top: "-60px",
        bottom: (dims.mainTdHeight + 10) + "px",
        zIndex: ci,
        position: "absolute" as const,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        wordWrap: "break-word" as const,
    };

    // const debug1 = cluster.events.filter(e => e.img.indexOf('panoramio') >= 0).length > 0;
    // if (debug1) {
    //     console.log(`leftRender=${leftRender}`);
    //     console.log(`descrWidthRedner=${descrWidthRedner}`);
    //     console.log(`widthRender=${widthRender}`);
    //     console.log(`cluster.scopeRender.min=${cluster.scopeRender.min}`);
    //     console.log(`cluster.scopeRender.max=${cluster.scopeRender.max}`);
    //     console.log(`compacted=${compacted}`);

    //     console.log(`eventImageMontageCenter=${eventImageMontageCenter}`);
    // }

    const myRef = React.createRef<HTMLDivElement>();
    window.requestAnimationFrame(() => {
        //const debug = cluster.events.filter(e => e.img.indexOf('panoramio') >= 0).length > 0;
        if (myRef.current) {
            const cmp = compact(
                eventImageMontageCenter - myRef.current.offsetWidth / 2,// leftRender,// + widthRender / 2,
                myRef.current.offsetWidth,
                cluster.scopeRender
            ) + "px";

            // console.log('in requestAnimationFrame');
            // console.log(`leftRender=${leftRender}`);
            // console.log(`descrWidthRedner=${descrWidthRedner}`);
            // console.log(`widthRender=${widthRender}`);
            // console.log(`myRef.current.offsetWidth=${myRef.current.offsetWidth}`);
            // console.log(`cluster.scopeRender.min=${cluster.scopeRender.min}`);
            // console.log(`cluster.scopeRender.max=${cluster.scopeRender.max}`);
            // console.log(`cmp=${cmp}`);

            myRef.current.style.left = cmp;
            //myRef.current.style.border = '1px solid green';

            //console.log(myRef.current);
        }
    });
    return <div style={style} ref={myRef}>
        <Caption cluster={cluster} leftRender={leftRender} />
        {/* <Date cluster={cluster} evt={evt} /> */}
    </div>;
}