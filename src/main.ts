import { IDateFormat, IEvent, ILineSettings, IMoment, Interval, Moment } from "./dtos";
import * as time from "./time";
import { ITextWizard } from "./text";

interface ILineReference {
    min: number;
    max: number;
    len: number;
    eventsToRender: IEvent<IDateFormat>[];
    mainColor: string;
}

interface IDocApi {
    createElement: (s: string) => HTMLElement;
    addRow: (tr: HTMLElement) => void;
}

interface IEventCluster<T extends IDateFormat> {
    events: IEvent<T>[];
    meanReal: IMoment<T>;
    minReal: IMoment<T>;
    maxReal: IMoment<T>;
}

type NumToStr = (n: number) => string;

export class Main {
    private _time: time.ITimeWizard;
    private _text: ITextWizard;

    private _palette = [
        "#abcdef",
        "#fedcba",
        "#cdabef",
        "#cdefab",
        "#dcfeba",
        "#dcbafe",
    ];

    private _dims = {
        mainTdWidth: 600,
        mainTdHeight: 100,
        descrBoxWidth: 150,
        descrBoxHeight: 50,
    };

    private _dateFormatters: {
        [K in IDateFormat]: NumToStr;
    } = {
        my: (time: number) => time >= 0 ? this._text.locResource("_my", time) : this._text.locResource("_mybce", -time),
        y: (time: number) => time >= 0 ? this._text.locResource("_y", time) : this._text.locResource("_ybce", -time)
    };

    constructor(timeWizard: time.ITimeWizard, textWizard: ITextWizard) {
        this._time = timeWizard;
        this._text = textWizard;
    }

    public Render(
        lineSettings: ILineSettings[],
        allEvents: IEvent<IDateFormat>[],
        docApi: IDocApi
    ) {
        // TODO EVERYWHERE! Date calculations: check operations with (million) years, e. g. (10 y. CE) - (10 y. BCE) = ?
        const refe = this._makeRef(lineSettings, allEvents);

        for (let lsi = 0; lsi < lineSettings.length; lsi++) {
            const ls = lineSettings[lsi];
            const fmtDt = this._dateFormatters[ls.interval.fmt];
            const curRef = refe[lsi];

            this._renderMainRow(ls, curRef, fmtDt, docApi);
            
            if (lsi < lineSettings.length - 1) {
                let nextLs = lineSettings[lsi + 1];
                let nextRef = refe[lsi + 1];
                this._renderInterRow(ls, nextLs, curRef, nextRef, docApi);
            }
        }
    }

    private _makeRef(
        lineSettings: ILineSettings[],
        allEvents: IEvent<IDateFormat>[]
    ) {
        const refe: ILineReference[] = [];

        for (let lsi = 0; lsi < lineSettings.length; lsi++) {
            const ls = lineSettings[lsi];
            if (!(ls.interval.fmt === "my" || ls.interval.fmt === "y"))
                throw new Error();

            const eventsToRender = [];
            for (const evt of allEvents) {
                if (evt.time.fmt !== ls.interval.fmt)
                    continue;
                
                eventsToRender.push(evt);
            }
        
            if (eventsToRender.length === 0)
                throw new Error("No suitable events to render.");

            refe[lsi] = {
                min: ls.interval.fromVal,
                max: ls.interval.tillVal,
                len: ls.interval.tillVal - ls.interval.fromVal,
                eventsToRender,
                mainColor: this._palette[lsi % this._palette.length],
            };
        }

        return refe;
    }

    private _renderMainRow(
        ls: ILineSettings,
        curRef: ILineReference,
        fmtDt: NumToStr,
        docApi: IDocApi
    ) {
        const mapping = new time.Mapping(this._dims.mainTdWidth, ls.interval);
        const rowRef = this._makeRowRef(curRef, mapping);
        
        const td = docApi.createElement("td");
        td.style.cssText = `
            background-color: ${curRef.mainColor};
            width: ${this._dims.mainTdWidth}px;
            height: ${this._dims.mainTdHeight}px;
            position: relative;
        `;
    
        for (let ci = 0; ci < rowRef.clusters.length; ci++) {
            const cluster = rowRef.clusters[ci];
            const evt = {
                timeVal: cluster.meanReal.val as number,
                img: cluster.events.length === 1 ? cluster.events[0].img : null,
            };
            const leftRel = (evt.timeVal - curRef.min) / curRef.len;
            const leftRender = leftRel * this._dims.mainTdWidth - 20; // TODO 20, 50 and so on - magic numbers. Refactor.
            
            const evtDiv = this._rednerEvent(
                ci,
                cluster,
                evt,
                leftRender,
                docApi
            );
            td.appendChild(evtDiv);
            
            const descrDiv = this._renderDescription(
                ci,
                cluster,
                evt,
                leftRender,
                fmtDt,
                docApi
            );
            td.appendChild(descrDiv);
        }
    
        const tr = docApi.createElement("tr");

        const tdLeft = docApi.createElement("td");
        tdLeft.innerText = fmtDt(curRef.min);

        const tdRight = docApi.createElement("td");
        tdRight.innerText = fmtDt(curRef.max);

        tr.appendChild(tdLeft);
        tr.appendChild(td);
        tr.appendChild(tdRight);
        
        docApi.addRow(tr);
    }

    private _rednerEvent(
        ci: number,
        cluster: IEventCluster<IDateFormat>,
        evt: { timeVal: number, img: string | null },
        leftRender: number,
        docApi: IDocApi
    ): HTMLElement {
        const evtDiv = docApi.createElement("div");

        let ei = 0, images = 0;
        for (let e of cluster.events) {
            if (e.img === undefined || e.img === null)
                continue;
            images++;
            if (images > 3)
                break;
            //const eDiv = docApi.createElement("div");
            //.style.cssText =
            const eImg = docApi.createElement("img");
            eImg.setAttribute("src", e.img);
            eImg.style.cssText = `
                height: 50px;
            `;

            evtDiv.appendChild(eImg);

            ei++;
        }

        // const borderCssVal = evt.img === undefined || evt.img === null || evt.img.length === 0
        //     ? "2px solid white"
        //     : "none";
        // evtDiv.style.cssText = `
        //     border: ${borderCssVal};
        //     width: 50px;
        //     height: 50px;
        //     left: ${leftRender}px;
        //     top: 20px;
        //     z-index: ${ci};
        //     position: absolute;
        //     background-image: url(${evt.img});
        //     background-repeat: no-repeat;
        //     background-size: 100%;
        // `;
        evtDiv.style.cssText = `
            left: ${leftRender}px;
            top: 20px;
            z-index: ${ci};
            position: absolute;
        `;
        return evtDiv;
    }

    private _renderDescription(
        ci: number,
        cluster: IEventCluster<IDateFormat>,
        evt: { timeVal: number, img: string | null },
        leftRender: number,
        fmtDt: NumToStr,
        docApi: IDocApi
    ): HTMLElement {
        const descrDiv = docApi.createElement("div");
            
        descrDiv.style.cssText = `
            width: ${this._dims.descrBoxWidth}px;
            left: ${leftRender}px;
            top: -60px;
            z-index: ${ci};
            position: absolute;
            background-color: rgba(255, 255, 255, 0.5);
        `;

        const divCaption = docApi.createElement("div");
        if (cluster.events.length === 1) {
            divCaption.innerText = this._text.toString(cluster.events[0].cpt) ?? this._text.locResource("unkevt");
        } else {
            const renderedCount = cluster.events.length > 4
                ? 3
                : cluster.events.length;
            let captionHtml = cluster.events
                .slice(0, renderedCount)
                .map(e => this._text.toString(e.cpt) ?? this._text.locResource("unkevt"))
                .reduce((acc, add) => acc + ", " + add);
            const extraCount = cluster.events.length - renderedCount;
            if (extraCount > 0) {
                captionHtml += ` <i>${this._text.locResource("otherevts", extraCount)}</i>`;
            }
            divCaption.innerHTML = captionHtml;
        }

        const divDate = docApi.createElement("div");
        if (cluster.events.length === 1) {
            divDate.innerHTML = `<small>${fmtDt(evt.timeVal)}</small>`;
        } else {
            // const min = cluster.minReal.val, max = cluster.maxReal.val;
            // if (min * max < 0)
                divDate.innerHTML = `<small>${fmtDt(cluster.minReal.val)} — ${fmtDt(cluster.maxReal.val)}</small>`;
            // else
            //     divDate.innerHTML = `<small>${min} — ${fmtDt(max)}</small>`;
        }

        descrDiv.appendChild(divCaption);
        descrDiv.appendChild(divDate);

        return descrDiv;
    }

    private _renderInterRow(
        ls: ILineSettings,
        nextLs: ILineSettings,
        curRef: ILineReference,
        nextRef: ILineReference,
        docApi: IDocApi
    ) {
        const intersection = this._time.GetIntersection(
            Interval(ls.interval.fmt, curRef.min, curRef.max),
            Interval(nextLs.interval.fmt, nextRef.min, nextRef.max)
        );

        if (intersection === "No intersection") {
            let interTr = docApi.createElement("tr");
            let interTrHtml = `<td></td><td>---</td><td></td>`;
            interTr.innerHTML = interTrHtml;
            
            docApi.addRow(interTr);
        } else {
            const
                h100 = this._dims.mainTdHeight, h50 = Math.ceil(this._dims.mainTdHeight / 2),
                up1 = this._dims.mainTdWidth * (intersection.isc1.fromVal - curRef.min) / curRef.len,
                up2 = this._dims.mainTdWidth * (intersection.isc1.tillVal - curRef.min) / curRef.len,
                lo1 = this._dims.mainTdWidth * (intersection.isc2.fromVal - nextRef.min) / nextRef.len,
                lo2 = this._dims.mainTdWidth * (intersection.isc2.tillVal - nextRef.min) / nextRef.len;
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this._dims.mainTdWidth} ${h100}">
                <defs>
                    <linearGradient fx="0" fy="0.49" id="svg_1" x2="0" y2="1">
                        <stop id="jq_stop_3595" offset="0" stop-color="${curRef.mainColor}"/>
                        <stop id="jq_stop_9701" offset="1" stop-color="${nextRef.mainColor}"/>
                    </linearGradient>
                </defs>
                <path
                    d="M${lo1},${h100} C${lo1},${h50} ${up1},${h50} ${up1},0 L${up2},0 C${up2},${h50} ${lo2},${h50} ${lo2},${h100} z"
                    fill="url(#svg_1)"
                    stroke="none" />
            </svg>`;
            const smth = 'url("data:image/svg+xml;base64,' + btoa(svg) + '")';

            const td = docApi.createElement("td");
            td.style.cssText = `
                height: ${h100}px;
                background-image: ${smth};
            `;

            const interTr = docApi.createElement("tr");
            interTr.appendChild(docApi.createElement("td"));
            interTr.appendChild(td);
            interTr.appendChild(docApi.createElement("td"));
            
            docApi.addRow(interTr);
        }
    }
        
    private _makeRowRef(curRef: ILineReference, mapping: time.Mapping<IDateFormat>): { clusters: IEventCluster<IDateFormat>[] } {
        const clustersCount = 2, clusterWidthRnd = this._dims.mainTdWidth / clustersCount;
        const tuneRnd = 0;

        const clusters: IEventCluster<IDateFormat>[] = [];
        const evtToClst = curRef.eventsToRender.map(e => null as ({} | null));

        for (let ci = 0; ci < clustersCount; ci++) {
            const
                clLeftRnd = Math.floor(ci * clusterWidthRnd - tuneRnd),
                clRightRnd = Math.ceil((ci + 1) * clusterWidthRnd + tuneRnd);
            const events: IEvent<IDateFormat>[] = [];
            const eventIndices: number[] = [];
            let min: number | null = null, max: number | null = null, sum = 0;
            for (let ei = 0; ei < curRef.eventsToRender.length; ei++) {
                if (evtToClst[ei] !== null)
                    continue;
                const evt = curRef.eventsToRender[ei];
                const evtTimeRnd = mapping.FromRealToRender(evt.time);
                if (clLeftRnd <= evtTimeRnd && evtTimeRnd <= clRightRnd) {
                    events.push(evt);
                    eventIndices.push(ei);
                    if (min === null || evt.time.val <= min)
                        min = evt.time.val;
                    if (max === null || evt.time.val >= max)
                        max = evt.time.val;
                    sum += evt.time.val;
                }
            }
            if (events.length === 0)
                continue;
            const fmt = events[0].time.fmt;
            const cluster: IEventCluster<IDateFormat> = {
                events,
                meanReal: Moment(fmt, sum / events.length),
                minReal: Moment(fmt, min),
                maxReal: Moment(fmt, max),
            };
            for (let ei of eventIndices) {
                evtToClst[ei] = cluster;
            }
            clusters.push(cluster);
        }

        return { clusters };
    }
}