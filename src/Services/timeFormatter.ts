import { IDateFormat, IMoment, IUniFmtInterval, Moment } from "../contracts/timeline";
import { Throw } from "../utils";
import { ITextWizard } from "./text";

export interface ITimeFormatter {
    format(what: IMoment<IDateFormat> | IUniFmtInterval<IDateFormat>): string;
} 

export class TimeFormatter implements ITimeFormatter {
    private _text: ITextWizard;

    constructor(text: ITextWizard) {
        this._text = text;
    }
    
    private _round = (time: number, trashold: number, round: number) =>
        Math.round((time / trashold) * round) / round;

    private _fmt(
        time: number,
        trashold: number,
        round: number,
        keys: {
            commonPositive: string,
            commonNegative: string,
            bigPositive: string,
            bigNegative: string,
        }
    ): string {
        if (time >= 0) {
            return time >= trashold
                ? this._text.locResource(keys.bigPositive, this._round(time, trashold, round))
                : this._text.locResource(keys.commonPositive, time);
        } else {
            return time <= -trashold
                ? this._text.locResource(keys.bigNegative, -this._round(time, trashold, round))
                : this._text.locResource(keys.commonNegative, -time);
        }
    }
    private _fmtSimpleInterval(
        from: number,
        till: number,
        trashold: number,
        round: number,
        keys: {
            commonPositive: string,
            commonNegative: string,
            bigPositive: string,
            bigNegative: string,
        }
    ): string {
        if (from >= 0) {
            return from >= trashold
                ? this._text.locResource(keys.bigPositive, this._round(from, trashold, round), this._round(till, trashold, round))
                : this._text.locResource(keys.commonPositive, from, till);
        } else {
            return from <= -trashold
                ? this._text.locResource(keys.bigNegative, -this._round(from, trashold, round), -this._round(till, trashold, round))
                : this._text.locResource(keys.commonNegative, -from, -till);
        }
    }

    private _isMoment(what: any): what is IMoment<IDateFormat> {
        return Object.keys(what).filter(k => k === "fmt" || k === "val").length === 2;
    }
    
    private _isInterval(what: any): what is IUniFmtInterval<IDateFormat> {
        return Object.keys(what).filter(k => k === "fmt" || k === "fromVal" || k === "tillVal").length === 3;
    }

    format(what: IMoment<IDateFormat> | IUniFmtInterval<IDateFormat>): string {
        const trashold = what.fmt === "my"
            ? 1000
            : (what.fmt === "y" ? 1000000 : Throw());
        if (this._isMoment(what)) {
            return this._fmt(what.val, trashold, 10, {
                commonPositive: what.fmt === "my" ? "_my" : "_y",
                commonNegative: what.fmt === "my" ? "_mybce" : "_ybce",
                bigPositive: what.fmt === "my" ? "_by" : "_my",
                bigNegative: what.fmt === "my" ? "_bybce" : "_mybce",
            });
        } else {
            if (what.fromVal * what.tillVal >= 0 && (what.fromVal >= trashold) === (what.tillVal >= trashold)) {
                return this._fmtSimpleInterval(what.fromVal, what.tillVal, trashold, 10, {
                    commonPositive: what.fmt === "my" ? "__my" : "__y",
                    commonNegative: what.fmt === "my" ? "__mybce" : "__ybce",
                    bigPositive: what.fmt === "my" ? "__by" : "__my",
                    bigNegative: what.fmt === "my" ? "__bybce" : "__mybce",
                });
            } else {
                const f = Moment(what.fmt, what.fromVal), t = Moment(what.fmt, what.tillVal);
                return `${this.format(f)} — ${this.format(t)}`;
            }
        }
    }
}
