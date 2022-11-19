import { IDateFormat, IEvent, ILineSettings } from './dtos';
import * as time from './time';

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

    private _dateFormatters = {
        my: (time: number) => time >= 0 ? `${time} m. y.` : `${-time} m. y. ago`,
        y: (time: number) => time >= 0 ? `${time} y.` : `${-time} y. BCE`,
    };

    public Render(
        lineSettings: ILineSettings[],
        allEvents: IEvent<IDateFormat>[],
        docApi: {
            getElementById: (s: string) => HTMLElement;
            createElement: (s: string) => HTMLElement;
            addRow: (tr: HTMLElement) => void;
        }
    ) {
        const refe: { min: number, max: number, len: number, eventsToRender: IEvent<IDateFormat>[] }[] = [];
        for (let lsi = 0; lsi < lineSettings.length; lsi++) {
            const ls = lineSettings[lsi];
            if (!(ls.interval.fmt === "my" || ls.interval.fmt === "y"))
                throw new Error();

            let minMu = null, maxMu = null;
            let eventsToRender = [];
            for (const evt of allEvents) {
                if (evt.time.fmt !== ls.interval.fmt)
                    continue;
                let curMu = evt.time.val;
                if (minMu === null || curMu < minMu) minMu = curMu;
                if (maxMu === null || curMu > maxMu) maxMu = curMu;
                eventsToRender.push(evt);
            }
        
            if (eventsToRender.length === 0)
                throw new Error("No suitable events to render.");
        
            let adjustedMinMu = minMu, adjustedMaxMu = maxMu, len = maxMu - minMu, fix = 10; // TODO It seams that fix should depend on render width and height.
            if (len > 0) {
                let fix = Math.ceil(len * 0.1);
            }
        
            adjustedMinMu = ls.interval.fromVal;// Math.floor(adjustedMinMu - fix);
            adjustedMaxMu = ls.interval.tillVal;// Math.ceil(adjustedMaxMu + fix);
            let adjustedLenMu = adjustedMaxMu - adjustedMinMu;

            refe[lsi] = {
                min: adjustedMinMu,
                max: adjustedMaxMu,
                len: adjustedLenMu,
                eventsToRender,
            };
        }

        for (let lsi = 0; lsi < lineSettings.length; lsi++) {
            const ls = lineSettings[lsi];
            const fmtDt = this._dateFormatters[ls.interval.fmt];
            const adMu = refe[lsi];
        
            let tr = docApi.createElement("tr");
            let rowHtml = `<td>${fmtDt(adMu.min)}</td><td id="timeline-td-${lsi}"></td><td>${fmtDt(adMu.max)}</td>`;
            tr.innerHTML = rowHtml;
            
            docApi.addRow(tr);
        
            let tdRenderWidth = 600;
        
            let td = docApi.getElementById(`timeline-td-${lsi}`);
            td.style.cssText = `
                background-color: ${this._palette[lsi % this._palette.length]};
                width: ${tdRenderWidth}px;
                height: 100px;
                position: relative;
            `;
        
            for (let i = 0; i < adMu.eventsToRender.length; i++) {
                let evt = adMu.eventsToRender[i];
                let leftRel = (evt.time.val - adMu.min) / adMu.len;
                let leftRender = leftRel * tdRenderWidth - 20; // TODO 20, 50 and so on - magic numbers. Refactor.
                let evtDiv = docApi.createElement("div"); // TODO img might not be defined
                evtDiv.style.cssText = `
                    border: 1px solid red;
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
                
                let descrDiv = docApi.createElement("div");
                
                descrDiv.innerText = `${evt.cpt}, ${fmtDt(evt.time.val)}`;
                descrDiv.style.cssText = `
                    border: 1px solid yellow;
                    width: 150px;
                    height: 50px;
                    left: ${leftRender}px;
                    top: -60px;
                    z-index: ${i};
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.5);
                `;
                td.appendChild(descrDiv);
            }
            
            if (lsi < lineSettings.length - 1) {
                let nextLs = lineSettings[lsi + 1];
                const intersection = this._time.GetIntersection(
                    ls.interval,
                    nextLs.interval
                );

                if (intersection === "No intersection") {
                    let interTr = docApi.createElement("tr");
                    let interTrHtml = `<td></td><td>Inter-row</td><td></td>`;
                    interTr.innerHTML = interTrHtml;
                    
                    docApi.addRow(interTr);
                } else {
                    const
                        h100 = 100, h50 = 50,
                        up1 = tdRenderWidth * (intersection.isc1.fromVal - ls.interval.fromVal) / adMu.len,
                        up2 = tdRenderWidth * (intersection.isc1.tillVal - ls.interval.fromVal) / adMu.len,
                        lo1 = tdRenderWidth * (intersection.isc2.fromVal - nextLs.interval.fromVal) / refe[lsi + 1].len,
                        lo2 = tdRenderWidth * (intersection.isc2.tillVal - nextLs.interval.fromVal) / refe[lsi + 1].len;
                    const svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 tdRenderWidth ${h100}">
                        <defs>
                            <linearGradient fx="0" fy="0.49" id="svg_1" x2="0" y2="1">
                                <stop id="jq_stop_3595" offset="0" stop-color="#abcdef"/>
                                <stop id="jq_stop_9701" offset="1" stop-color="#fedcba"/>
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

                    let interTr = docApi.createElement("tr");
                    interTr.appendChild(docApi.createElement("td"));
                    interTr.appendChild(td);
                    interTr.appendChild(docApi.createElement("td"));
                    
                    docApi.addRow(interTr);
                }
            }
        }
    }
}