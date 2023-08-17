import { IDateFormat, IUniFmtInterval, Interval, IMoment, Moment } from "../contracts/timeline";

function ThrowFmtNotSupported(): never {
    throw new Error("The given time format is not supported.");
}

export interface ITimeWizard {
    Contains(interval: IUniFmtInterval, moment: IMoment): boolean;

    GetIntersection(
        int1: IUniFmtInterval,
        int2: IUniFmtInterval
    )
        : { isc1: IUniFmtInterval, isc2: IUniFmtInterval } | "No intersection";

    ConvertTo(moment: IMoment, targetFormat: IDateFormat): IMoment;
    
    ConvertTo(value: number, sourceFormat: IDateFormat, targetFormat: IDateFormat): number;
}

export class TimeWizard implements ITimeWizard {
    private _yFactor(withFmt: IUniFmtInterval | IMoment): number | never {
        if (withFmt.fmt == "y")
            return 1;
        if (withFmt.fmt == "my")
            return 1000 * 1000;
        ThrowFmtNotSupported();
    }

    public Contains(interval: IUniFmtInterval, moment: IMoment): boolean {
        this.ThrowIfFmtNotSupported(interval.fmt, moment.fmt);

        const
            from = (interval.fromVal as number) * this._yFactor(interval),
            till = (interval.tillVal as number) * this._yFactor(interval),
            mmnt = (moment.val as number) * this._yFactor(moment);

        return from <= mmnt && mmnt <= till;
    }
    
    public GetIntersection(
        int1: IUniFmtInterval,
        int2: IUniFmtInterval
    )
        : { isc1: IUniFmtInterval, isc2: IUniFmtInterval } | "No intersection"
    {
        this.ThrowIfFmtNotSupported(int1.fmt, int2.fmt);

        const
            int1from = (int1.fromVal as number) * this._yFactor(int1),
            int1till = (int1.tillVal as number) * this._yFactor(int1),
            int2from = (int2.fromVal as number) * this._yFactor(int2),
            int2till = (int2.tillVal as number) * this._yFactor(int2);

        if (int1from > int2till || int1till < int2from) {
            return "No intersection";
        }

        const isc = (from: number, till: number) => ({
            isc1: Interval(int1.fmt, from / this._yFactor(int1), till / this._yFactor(int1)),
            isc2: Interval(int2.fmt, from / this._yFactor(int2), till / this._yFactor(int2)),
        });

        if (int1from <= int2from) {
            if (int1till <= int2till)
                return isc(int2from, int1till);
            else
                return isc(int2from, int2till);
        } else {
            if (int1till <= int2till)
                return isc(int1from, int1till);
            else
                return isc(int1from, int2till);
        }
    }

    public ConvertTo(moment: IMoment, targetFormat: IDateFormat): IMoment;
    public ConvertTo(value: number, sourceFormat: IDateFormat, targetFormat: IDateFormat): number;
    public ConvertTo(a1: IMoment | number, a2: IDateFormat, a3?: IDateFormat) : IMoment | number {
        if (typeof a1 === "number") {
            const value = a1;
            const sourceFormat = a2;
            const targetFormat = a3 as IDateFormat;

            this.ThrowIfFmtNotSupported(sourceFormat, targetFormat);

            if (sourceFormat === targetFormat)
                return value;
            
            if (sourceFormat === "my" && targetFormat === "y")
                return value * 1000 * 1000;
            
            if (sourceFormat === "y" && targetFormat === "my")
                return value / (1000 * 1000);
            
            ThrowFmtNotSupported();
        } else {
            const moment = a1;
            const targetFormat = a2;

            this.ThrowIfFmtNotSupported(moment.fmt, targetFormat);

            if (moment.fmt === targetFormat)
                return moment;
            
            if (moment.fmt === "my" && targetFormat === "y")
                return Moment(targetFormat, moment.val * 1000 * 1000);
            
            if (moment.fmt === "y" && targetFormat === "my")
                return Moment(targetFormat, moment.val / (1000 * 1000));
            
            ThrowFmtNotSupported();
        }
    }

    private ThrowIfFmtNotSupported(...fmts: IDateFormat[]) {
        if (fmts
            .filter(fmt => fmt !== "y" && fmt !== "my")
            .length > 0)
            ThrowFmtNotSupported();
    }
}

export class Mapping {
    private _widthRnd: number;
    private _widthReal: number;
    private _scale: number;
    private _real: IUniFmtInterval;
    private _time: ITimeWizard;

    constructor (widthRnd: number, real: IUniFmtInterval, time: ITimeWizard) {
        if (real.fmt !== "my" && real.fmt != "y")
            ThrowFmtNotSupported();
        if (widthRnd <= 0)
            throw new Error("The given width must be positive.");
        
        this._widthRnd = widthRnd;
        this._widthReal = real.tillVal - real.fromVal;
        this._scale = this._widthReal / this._widthRnd;
        this._real = real;
        this._time = time;
    }

    public FromRealToRender(moment: IMoment): number {
        const convMoment = this._time.ConvertTo(moment, this._real.fmt);
        
        const difReal = convMoment.val - this._real.fromVal;
        const result = difReal / this._scale;
        return result;
    }
}
