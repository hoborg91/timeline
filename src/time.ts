import { IDateFormat, IUniFmtInterval, Interval, IMoment } from "./dtos";

function ThrowFmtNotSupported(): never { throw new Error("The given time format is not supported."); }

export interface ITimeWizard {
    GetIntersection<T1 extends IDateFormat, T2 extends IDateFormat>(
        int1: IUniFmtInterval<T1>,
        int2: IUniFmtInterval<T2>
    )
        : { isc1: IUniFmtInterval<T1>, isc2: IUniFmtInterval<T2> } | "No intersection";
}

export class TimeWizard implements ITimeWizard{
    private _yFactor(withFmt: IUniFmtInterval<IDateFormat>): number | never {
        if (withFmt.fmt == "y")
            return 1;
        if (withFmt.fmt == "my")
            return 1000 * 1000;
        ThrowFmtNotSupported();
    }
    
    public GetIntersection<T1 extends IDateFormat, T2 extends IDateFormat>(
        int1: IUniFmtInterval<T1>,
        int2: IUniFmtInterval<T2>
    )
        : { isc1: IUniFmtInterval<T1>, isc2: IUniFmtInterval<T2> } | "No intersection"
    {
        if ([int1.fmt, int2.fmt]
            .filter(fmt => fmt !== "y" && fmt !== "my")
            .length > 0)
            ThrowFmtNotSupported();

        const
            int1from = (int1.fromVal as number) * this._yFactor(int1),
            int1till = (int1.tillVal as number) * this._yFactor(int1),
            int2from = (int2.fromVal as number) * this._yFactor(int2),
            int2till = (int2.tillVal as number) * this._yFactor(int2);

        if (int1from > int2till || int1till < int2from)
            return "No intersection";

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
}

export class Mapping<T extends IDateFormat> {
    private _widthRnd: number;
    private _widthReal: number;
    private _scale: number;
    private _real: IUniFmtInterval<T>;

    constructor (widthRnd: number, real: IUniFmtInterval<T>) {
        if (real.fmt !== "my" && real.fmt != "y")
            ThrowFmtNotSupported();
        if (widthRnd <= 0)
            throw new Error("The given width must be positive.");
        
        this._widthRnd = widthRnd;
        this._widthReal = real.tillVal - real.fromVal;
        this._scale = this._widthReal / this._widthRnd;
        this._real = real;
    }

    public FromRealToRender(moment: IMoment<T>): number {
        if (moment.fmt !== this._real.fmt)
            throw new Error("Different date formats are not supported.");
        
        const difReal = moment.val - this._real.fromVal;
        const result = difReal / this._scale;
        return result;
    }
}