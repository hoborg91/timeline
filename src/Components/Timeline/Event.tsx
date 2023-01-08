import React, { SyntheticEvent } from "react";
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

const compact = (leftRender: number, imgWidthRender: number, scopeRender: { min: number, max: number }) => {
    let lr = leftRender;// - imgWidthRender / 2;
    if (lr < scopeRender.min)
        lr = scopeRender.min;
    else if (lr + imgWidthRender > scopeRender.max)
        lr = scopeRender.max - imgWidthRender;
    return lr;
}

const singleImageHeightRender = 80;

const EventImageSingle = ({ url, leftRender, cluster }: {
    url: string,
    leftRender: number,
    cluster: IEventCluster<IDateFormat>,
}) => {
    const [left, setLeft] = React.useState(leftRender + "px");
    const onLoad = (evt: SyntheticEvent<HTMLImageElement>) => {
        const img = evt.target as HTMLImageElement;
        const scale = img.naturalHeight / singleImageHeightRender;
        const imgWidthRender = img.naturalWidth / scale;
        setLeft(compact(leftRender, imgWidthRender, cluster.scopeRender) + "px");
    };
    return <img
        src={url}
        onLoad={onLoad}
        style={{
            height: singleImageHeightRender + "px",
            position: "absolute" as const,
            left,
            top: "0px",
            //clipPath: "circle(40px)",// "polygon(50% 0%, 0% 100%, 100% 100%)",
        }} />;
}

const doubleImageHeightRender = 50;

const EventImageDouble = ({ urls, leftRender, widthRender, cluster }: {
    urls: string[],
    leftRender: number,
    widthRender: number,
    cluster: IEventCluster<IDateFormat>,
}) => {
    if (urls.length !== 2)
        throw new Error();
    const centre = leftRender + widthRender / 2;
    const [geom, setGeom] = React.useState({
        widthsRender: [] as number[],
        left: leftRender + "px",
    });
    const onLoad = (evt: SyntheticEvent<HTMLImageElement>) => {
        const img = evt.target as HTMLImageElement;
        const scale = img.naturalHeight / doubleImageHeightRender;
        setGeom(curGeom => {
            const natWidhtScaled = img.naturalWidth / scale;
            const widthsRender = [...curGeom.widthsRender, Math.min(natWidhtScaled, doubleImageHeightRender * 1.1)];
            const wRender = widthsRender.reduce((acc, add) => acc + add, 0);
            const leftAdjusted = centre - wRender / 2;
            const left = compact(leftAdjusted, wRender, cluster.scopeRender);
            return {
                widthsRender,
                left: compact(leftAdjusted, wRender, cluster.scopeRender) + "px",
            };
        });
    };
    return <div style={{ position: "absolute" as const, left: geom.left, top: "0px" }}>
        <img src={urls[0]} onLoad={onLoad} style={{
            height: doubleImageHeightRender + "px",
            maxWidth: (doubleImageHeightRender * 1.1) + "px",
            objectFit: "cover",
        }} />
        <img src={urls[1]} onLoad={onLoad} style={{
            height: doubleImageHeightRender + "px",
            maxWidth: (doubleImageHeightRender * 1.1) + "px",
            objectFit: "cover",
        }} />
    </div>;
}

const EventImageMany = ({ urls, leftRender, widthRender, cluster }: {
    urls: string[],
    leftRender: number,
    widthRender: number,
    cluster: IEventCluster<IDateFormat>,
}) => {
    if (urls.length <= 2)
        throw new Error();
    const debug = urls.filter(u => u.indexOf("Stellar_Fireworks_Finale.jpg") >= 0).length > 0;
    
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
    left = compact(left, rowCount * maxDim, cluster.scopeRender)
    
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
    return <div style={{ position: "absolute" as const, left: left + "px", top: "0px" }}>
        {imgRef.map(ir => <img
            src={ir.url}
            style={{ ...imgStyle, left: (maxDim * ir.col) + "px", top: (maxDim * ir.row) + "px" }}
            id={ir.url} />)}
    </div>;
}

function div(dividend: number, divisor: number) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    return [ quotient, remainder ];
}

export const EventImageMontage = ({ cluster, leftRender, widthRender, ci }: {
    cluster: IEventCluster<IDateFormat>,
    leftRender: number,
    widthRender: number,
    ci: number, // for z-index
}) => {
    let ei = 0, imagesCount = 0;
    const images = cluster.events
        .map(e => e.img)
        .filter(i => i !== undefined && i !== null);
    
    if (images.length === 0) {
        return <></>;
    } else if (images.length === 1) {
        return <EventImageSingle url={images[0]} leftRender={leftRender} cluster={cluster} />;
    } else if (images.length === 2) {
        return <EventImageDouble urls={images} leftRender={leftRender} widthRender={widthRender} cluster={cluster} />;
    } else {
        return <EventImageMany urls={images} leftRender={leftRender} widthRender={widthRender} cluster={cluster} />;
    }
};
