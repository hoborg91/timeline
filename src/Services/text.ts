import { IMultiLangString, IPlurString, LangMonkier } from "../contracts/text";
import allResources from "../../data/resources.json";

export interface ITextWizard {
    locResource(key: string, ...params: any[]): string;
    toString(str: string | IMultiLangString, ...params: any[]): string;
}

export class StringUtils implements ITextWizard {
    private _getLanguages: () => readonly LangMonkier[];
    private _allTexts: { key: string, loc: IMultiLangString }[];
    private _checkLocReg = new RegExp("\\{\\d+\\}", "gi");
    private _paramRegs = Array(5).fill(1).map((_, i) => new RegExp(`\\{${i}\\}`, "gi"));
    
    constructor(getLanguages: () => readonly LangMonkier[]) {
        this._getLanguages = getLanguages;
        this._allTexts = allResources.texts;
    }

    locResource(key: string, ...params: any[]): string {
        const recs = this._allTexts.filter(r => r.key === key);
        if (recs.length === 0)
            throw new Error(`Cannot find a resource text with key "${key}".`);
        if (recs.length > 1)
            throw new Error(`There are more than one resource text with key "${key}".`);
        const resourceLoc = recs[0].loc;
        const result = this.toString(resourceLoc, ...params);
        return result;
    }

    toString(str: string | IMultiLangString, ...params: any[]): string {
        let strNoParams = this.toStringNoParams(str);
        if (typeof strNoParams !== "string") {
            strNoParams = this.selectPluralForm(strNoParams, params);
        }
        let result = strNoParams;
        for (let pi = 0; pi < params.length; pi++) {
            const reg = this.regForParam(pi);
            const paramStr = this.locValue(params[pi]);
            result = result.replace(reg, paramStr);
        }
        if (this._checkLocReg.test(result))
            throw new Error(`No enough parameter values for text "${strNoParams}".`);
        return result;
    }

    private regForParam(i: number) {
        if (i < this._paramRegs.length) {
            return this._paramRegs[i];
        }

        return new RegExp(`\\{${i}\\}`, "gi");
    }

    private locValue(val: any) {
        const tryToLocaleString = (typeof val.toLocaleString === "function");
        for (const lng of this._getLanguages()) {
            try {
                if (tryToLocaleString)
                    return val.toLocaleString(lng);
            } catch {}
        }

        return typeof val.toString === "function"
            ? val.toString()
            : val;
    }

    private selectPluralForm(plural: IPlurString, ...params: any[]): string {
        const switchValue = params[plural.paramIndex];
        for (let option of plural.options) {
            if (option.from <= switchValue && switchValue <= option.till)
                return option.val;
        }
        return plural.default;
    }

    private toStringNoParams(str: string | IMultiLangString): string | IPlurString {
        if (typeof str === "string")
            return str;

        for (let loc of this._getLanguages()) {
            const s = str[loc];
            if (s !== undefined && s !== null)
                return s;
        }

        for (const k in str) {
            return str[k as LangMonkier];
        }

        throw new Error("The given text provides no suitable localizations.");
    }
}
