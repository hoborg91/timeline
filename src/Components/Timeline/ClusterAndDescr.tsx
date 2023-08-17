import React, { useState } from "react";
import { PureDi } from "../../context";
import { IEventCluster, ILineReference } from "../ifaces";
import { Description } from "./Description";
import { EventImageMontage } from "./Event";

export const ClusterAndDescr = ({ cluster, curRef }: {
    cluster: IEventCluster,
    curRef: ILineReference,
}) => {
    const di = React.useContext(PureDi);
    
    const relToRnd = (rel: number) => rel * di.dimensions.mainTdWidth / curRef.len;

    const leftRnd = relToRnd(cluster.minReal.val - curRef.min);
    const widthRnd = relToRnd(cluster.maxReal.val - cluster.minReal.val);

    let debug = <></>;
    if (di.devMode) {
        const styleOuter = {
            border: di.devMode ? "1px solid grey" : "none",
            position: "absolute" as const,
            left: (cluster.scopeRender.min + 2) + "px",
            top: "0px",
            width: (cluster.scopeRender.max - cluster.scopeRender.min - 4) + "px",
            height: "50px",
            zIndex: 1000,
        };
        const styleInner = {
            border: di.devMode ? "1px solid red" : "none",
            position: "absolute" as const,
            left: leftRnd + "px",
            top: "0px",
            width: widthRnd + "px",
            height: "40px",
            zIndex: 1000,
        };
    
        debug = <>
            <div style={styleOuter}></div>
            <div style={styleInner}>
                {cluster.events.length}
            </div>
        </>;
    }
    const descrWidthRed = 4;

    const descrWidthRender = cluster.scopeRender.max - cluster.scopeRender.min - descrWidthRed * 2;

    const onCenter = (centerRnd: number) => {
        window.requestAnimationFrame(() => {
            setEventImageMontageCenterRnd(centerRnd);
        });
    };

    const [eventImageMontageCenterRnd, setEventImageMontageCenterRnd] = useState(leftRnd + widthRnd / 2);

    return <>
        <Description
            ci={10}
            cluster={cluster}
            evt={{ timeMoment: cluster.meanReal }}
            descrWidthRedner={descrWidthRender}
            leftRender={leftRnd}
            widthRender={widthRnd}
            eventImageMontageCenter={eventImageMontageCenterRnd} />
        <EventImageMontage
            ci={10}
            cluster={cluster}
            leftRender={leftRnd}
            widthRender={widthRnd}
            onCenter={onCenter} />
        {debug}
    </>;
}
