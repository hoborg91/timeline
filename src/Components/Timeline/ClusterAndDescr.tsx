import React, { useState } from "react";
import { Context } from "../../context";
import { IDateFormat } from "../../contracts/timeline";
import { IEventCluster, ILineReference } from "../ifaces";
import { Description } from "./Description";
import { EventImageMontage } from "./Event";
import { compact } from "./utils";

export const ClusterAndDescr = ({ cluster, curRef }: {
    cluster: IEventCluster<IDateFormat>,
    curRef: ILineReference,
}) => {
    const ctx = React.useContext(Context);
    
    const relToRnd = (rel: number) => rel * ctx.dimensions.mainTdWidth / curRef.len;

    const leftRnd = relToRnd(cluster.minReal.val - curRef.min);
    const widthRnd = relToRnd(cluster.maxReal.val - cluster.minReal.val);

    let debug = <></>;
    if (ctx.devMode) {
        const styleOuter = {
            border: ctx.devMode ? "1px solid grey" : "none",
            position: "absolute" as const,
            left: (cluster.scopeRender.min + 2) + "px",
            top: "0px",
            width: (cluster.scopeRender.max - cluster.scopeRender.min - 4) + "px",
            height: "50px",
            zIndex: 1000,
        };
        const styleInner = {
            border: ctx.devMode ? "1px solid red" : "none",
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
    const l1 = compact(
        (leftRnd + descrWidthRender / 2), //(cluster.scopeRender.min + descrWidthRed) //leftRnd
        descrWidthRender,
        cluster.scopeRender
    );
    //offsetWidth

    // if (cluster.events.filter(e => e.img.indexOf('Chartres') >= 0).length > 0) {
    //     console.log('DEBUG');        
    //     console.log(`cluster.minReal.val=${cluster.minReal.val}`);
    //     console.log(`cluster.maxReal.val=${cluster.maxReal.val}`);
    //     console.log(`curRef.min=${curRef.min}`);
    //     console.log(`leftRnd=${leftRnd}`);
    //     console.log(`widthRnd=${widthRnd}`);
    //     console.log(`descrWidthRender=${descrWidthRender}`);
    //     console.log(`cluster.scopeRender.min=${cluster.scopeRender.min}`);
    //     console.log(`cluster.scopeRender.max=${cluster.scopeRender.max}`);
    //     console.log(`l1=${l1}`);
    // }

    const onCenter = (centerRnd: number) => {
        //console.log(`onCenter(${centerRnd})`);
        setEventImageMontageCenterRnd(centerRnd);
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
