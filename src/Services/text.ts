import { IMultiLangString, IPlurString } from "../dtos";
import allResources from "../../data/resources.json";

export interface ITextWizard {
    locResource(key: string, ...params: any[]): string;
    toString(str: string | IMultiLangString, ...params: any[]): string;
}

export class StringUtils implements ITextWizard {
    private _langs: string[];
    private _allTexts: { key: string, loc: IMultiLangString }[];

    constructor(preferredLanguages: readonly string[]) {
        this._langs = [];
        let enAdded = false, enUsAdded = false;
        for (let loc of preferredLanguages) {
            this._langs.push(loc);
            if (loc === "en")
                enAdded = true;
            else if (loc === "en-US")
                enUsAdded = true;
        }
        if (!enAdded)
            this._langs.push("en");
        if (!enUsAdded)
            this._langs.push("en-US");
            
        this._allTexts = allResources.texts;
    }

    locResource(key: string, ...params: any[]): string {
        const recs = this._allTexts.filter(r => r.key === key);
        if (recs.length === 0)
            throw new Error(`Cannot find a resource text with key "${key}".`);
        if (recs.length > 1)
            throw new Error(`There are more than one resource text with key "${key}".`);
        const resourceLoc = recs[0].loc;
        const result = this.toString(resourceLoc, params);
        return result;
    }

    toString(str: string | IMultiLangString, ...params: any[]): string {
        let strNoParams = this.toStringNoParams(str);
        if (typeof strNoParams !== "string") {
            strNoParams = this.selectPluralForm(strNoParams, params);
        }
        let result = strNoParams;
        for (let pi = 0; pi < params.length; pi++) {
            const reg = new RegExp("\\{" + pi + "\\}", "gi");
            result = result.replace(reg, params[pi]);
        }
        // TODO Check all parameters are substituted.
        return result;
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

        for (let loc of this._langs) {
            const s = str[loc];
            if (s !== undefined && s !== null)
                return s;
        }

        for (const k in str) {
            return str[k];
        }

        throw new Error("The given text provides no suitable localizations.");
    }
}
