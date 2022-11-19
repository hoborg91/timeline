import { IDateFormat, IEvent, ILineSettings, Interval } from './dtos';
import * as time from './time';

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

type NumToStr = (n: number) => string;

export class Main {
    private _time = new time.Wizard;

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
    };

    private _dateFormatters: {
        [K in IDateFormat]: NumToStr;
    } = {
        my: (time: number) => time >= 0 ? `${time} m. y.` : `${-time} m. y. ago`,
        y: (time: number) => time >= 0 ? `${time} y.` : `${-time} y. BCE`,
    };

    public Render(
        lineSettings: ILineSettings[],
        allEvents: IEvent<IDateFormat>[],
        docApi: IDocApi
    ) {
        const refe = this._makeRef(lineSettings, allEvents);

        for (let lsi = 0; lsi < lineSettings.length; lsi++) {
            const ls = lineSettings[lsi];
            const fmtDt = this._dateFormatters[ls.interval.fmt];
            const curRef = refe[lsi];

            this._renderMainRow(curRef, fmtDt, docApi);
            
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
        curRef: ILineReference,
        fmtDt: NumToStr,
        docApi: IDocApi
    ) {
        const td = docApi.createElement("td");
        td.style.cssText = `
            background-color: ${curRef.mainColor};
            width: ${this._dims.mainTdWidth}px;
            height: ${this._dims.mainTdHeight}px;
            position: relative;
        `;
    
        for (let i = 0; i < curRef.eventsToRender.length; i++) {
            const evt = curRef.eventsToRender[i];
            const leftRel = (evt.time.val - curRef.min) / curRef.len;
            const leftRender = leftRel * this._dims.mainTdWidth - 20; // TODO 20, 50 and so on - magic numbers. Refactor.
            const evtDiv = docApi.createElement("div"); // TODO img might not be defined
            const borderCssVal = evt.img === undefined || evt.img === null || evt.img.length === 0
                ? "2px solid white"
                : "none";
            evtDiv.style.cssText = `
                border: ${borderCssVal};
                width: 50px;
                height: 50px;
                left: ${leftRender}px;
                top: 20px;
                z-index: ${i};
                position: absolute;
                background-image: url(${evt.img});
                background-repeat: no-repeat;
                background-size: 100%;
            `;
            td.appendChild(evtDiv);
            
            const descrDiv = docApi.createElement("div");
            
            descrDiv.style.cssText = `
                width: 150px;
                height: 50px;
                left: ${leftRender}px;
                top: -60px;
                z-index: ${i};
                position: absolute;
                background-color: rgba(255, 255, 255, 0.5);
            `;

            const divCaption = docApi.createElement("div");
            divCaption.innerText = evt.cpt;

            const divDate = docApi.createElement("div");
            divDate.innerHTML = `<small>${fmtDt(evt.time.val)}</small>`;

            descrDiv.appendChild(divCaption);
            descrDiv.appendChild(divDate);

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
}