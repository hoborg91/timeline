import React from "react";
import { IDateFormat } from "../../contracts/timeline";
import { IEventCluster } from "../ifaces";

export const Event = ({ cluster, leftRender, ci }: {
    cluster: IEventCluster<IDateFormat>,
    leftRender: number,
    ci: number,
}) => {
    let ei = 0, images = 0;
    const imgTsxs = [];
    for (let e of cluster.events) {
        if (e.img === undefined || e.img === null)
            continue;
        images++;
        if (images > 3)
            break;

        // TODO Images would collapse in a column when placed closed to end of line. Looks ugly.
        imgTsxs.push(<img style={{ height: "50px" }} src={e.img} />);
        ei++;
    }

    // TODO Adjust z-indices. Place events above all lines and place descriptions above all other objects.
    const style = {
        left: leftRender + "px",
        top: "20px",
        zIndex: ci,
        position: "absolute" as const,
    };

    return <div style={style}>{imgTsxs}</div>;
};
