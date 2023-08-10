import React, { SyntheticEvent } from "react";
import { IEventCluster } from "../ifaces";
import { compact } from "./utils";

export const Event = ({ cluster, leftRender, ci }: {
    cluster: IEventCluster,
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

        imgTsxs.push(<img style={{ height: "50px" }} src={e.img} />);
        ei++;
    }

    const style = {
        left: leftRender + "px",
        top: "20px",
        zIndex: ci,
        position: "absolute" as const,
    };

    return <div style={style} className="Event">{imgTsxs}</div>;
};

const singleImageHeightRender = 80;

const EventImageSingle = ({ url, leftRender, cluster, onCenter }: {
    url: string,
    leftRender: number,
    cluster: IEventCluster,
    onCenter: (centerRnd: number) => any,
}) => {
    const [left, setLeft] = React.useState(leftRender + "px");
    const onLoad = (evt: SyntheticEvent<HTMLImageElement>) => {
        const img = evt.target as HTMLImageElement;
        const scale = img.naturalHeight / singleImageHeightRender;
        const imgWidthRender = img.naturalWidth / scale;
        const newLeft = compact(leftRender, imgWidthRender, cluster.scopeRender);
        setLeft(newLeft + "px");
        onCenter(newLeft + imgWidthRender / 2);
    };
    return <a href={url}>
        <img
            src={url}
            onLoad={onLoad}
            style={{
                height: singleImageHeightRender + "px",
                position: "absolute" as const,
                left,
                top: "0px",
            }}
            className="EventImageSingle" />
    </a>;
}

const doubleImageHeightRender = 50;

const EventImageDouble = ({ urls, leftRender, widthRender, cluster, onCenter }: {
    urls: string[],
    leftRender: number,
    widthRender: number,
    cluster: IEventCluster,
    onCenter: (centerRnd: number) => any,
}) => {
    if (urls.length !== 2)
        throw new Error();
    
    const centre = leftRender + widthRender / 2;
    const [geom, setGeom] = React.useState({
        widthsRender: [doubleImageHeightRender, doubleImageHeightRender],
        left: leftRender + "px",
    });

    const onLoad0 = (evt: SyntheticEvent<HTMLImageElement>) => {
        const img = evt.target as HTMLImageElement;
        const scale = img.naturalHeight / doubleImageHeightRender;

        setGeom(curGeom => {
            const natWidhtScaled = img.naturalWidth / scale;
            const tw = Math.min(natWidhtScaled, doubleImageHeightRender * 1.1);
            const widthsRender = [tw, curGeom.widthsRender[1]];
            const wRender = widthsRender.reduce((acc, add) => acc + add, 0);
            const leftAdjusted = centre - wRender / 2;
            const left = compact(leftAdjusted, wRender, cluster.scopeRender);

            onCenter(left + wRender / 2);
            return {
                widthsRender,
                left: left + "px",
            };
        });
    }

    const onLoad1 = (evt: SyntheticEvent<HTMLImageElement>) => {
        const img = evt.target as HTMLImageElement;
        const scale = img.naturalHeight / doubleImageHeightRender;

        setGeom(curGeom => {
            const natWidhtScaled = img.naturalWidth / scale;
            const tw = Math.min(natWidhtScaled, doubleImageHeightRender * 1.1);
            const widthsRender = [curGeom.widthsRender[0], tw];
            const wRender = widthsRender.reduce((acc, add) => acc + add, 0);
            const leftAdjusted = centre - wRender / 2;
            const left = compact(leftAdjusted, wRender, cluster.scopeRender);

            onCenter(left + wRender / 2);
            return {
                widthsRender,
                left: left + "px",
            };
        });
    };
    return <div
        style={{ position: "absolute" as const, left: geom.left, top: "0px" }}
        className="EventImageDouble"
        >
            <a href={urls[0]}>
                <img src={urls[0]} onLoad={onLoad0} style={{
                    height: doubleImageHeightRender + "px",
                    maxWidth: (doubleImageHeightRender * 1.1) + "px",
                    objectFit: "cover",
                }} />
            </a>
            <a href={urls[1]}>
                <img src={urls[1]} onLoad={onLoad1} style={{
                    height: doubleImageHeightRender + "px",
                    maxWidth: (doubleImageHeightRender * 1.1) + "px",
                    objectFit: "cover",
                }} />
            </a>
        </div>;
}

const EventImageMany = ({ urls, leftRender, widthRender, cluster, onCenter }: {
    urls: string[],
    leftRender: number,
    widthRender: number,
    cluster: IEventCluster,
    onCenter: (centerRnd: number) => any,
}) => {
    if (urls.length <= 2)
        throw new Error();
    
    const maxRowCount = 5, maxCount = maxRowCount * maxRowCount;
    if (urls.length > maxCount) {
        urls = urls.slice(0, maxCount);
    }
    let rowCount = 1, colCount;
    for (let i = 2; i <= maxRowCount; i++) {
        if (urls.length > i * i)
            continue;
        rowCount = i;
        colCount = i;
        break;
    }
    const maxDim = 80 / rowCount;
    let left = (leftRender + widthRender / 2) - (rowCount * maxDim / 2);
    left = compact(left, rowCount * maxDim, cluster.scopeRender);
    onCenter(left + widthRender / 2);
    
    const imgRef = urls.map((url, i) => {
        const [row, col] = div(i, rowCount);
        const result = {
            url,
            left: col * maxDim,
            top: row * maxDim,
            col,
            row,
            rowCount,
        };
        return result;
    });
    const imgStyle = {
        maxWidth: maxDim + "px",
        maxHeight: maxDim + "px",
        position: "absolute" as const,
    };
    return <div
        style={{ position: "absolute" as const, left: left + "px", top: "0px" }}
        className="EventImageMany"
        >
            {imgRef.map(ir => <a href={ir.url} key={ir.url}>
                <img
                    src={ir.url}
                    style={{ ...imgStyle, left: (maxDim * ir.col) + "px", top: (maxDim * ir.row) + "px" }}
                    id={ir.url} />
            </a>)}
        </div>;
}

function div(dividend: number, divisor: number) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    return [ quotient, remainder ];
}

export const EventImageMontage = ({ cluster, leftRender, widthRender, ci, onCenter }: {
    cluster: IEventCluster,
    leftRender: number,
    widthRender: number,
    ci: number, // for z-index
    onCenter: (centerRnd: number) => any,
}) => {
    const images = cluster.events
        .map(e => e.img)
        .filter(i => i !== undefined && i !== null);
    
    if (images.length === 0) {
        return <></>;
    } else if (images.length === 1) {
        return <EventImageSingle url={images[0]} leftRender={leftRender} cluster={cluster} onCenter={onCenter} />;
    } else if (images.length === 2) {
        return <EventImageDouble urls={images} leftRender={leftRender} widthRender={widthRender} cluster={cluster} onCenter={onCenter} />;
    } else {
        return <EventImageMany urls={images} leftRender={leftRender} widthRender={widthRender} cluster={cluster} onCenter={onCenter} />;
    }
};
