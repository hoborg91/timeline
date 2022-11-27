import { IMultiLangString } from "./dtos";
import allResources from "./resources.json";

export class StringUtils {
    private _langs: string[];
    private _allTexts: { key: string, loc: IMultiLangString }[];

    constructor() {
        this._langs = [];
        let enAdded = false, enUsAdded = false;
        for (let loc of navigator.languages) {
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

    toString(str: string | IMultiLangString, ...params: any[]): string {
        const strNoParams = this.toStringNoParams(str);
        let result = strNoParams;
        for (let pi = 0; pi < params.length; pi++) {
            const reg = new RegExp("\\{" + pi + "\\}", "gi");
            result = result.replace(reg, params[pi]);
        }
        // TODO Check all parameters are substituted.
        // TODO Support plural forms or switch to a normal loc. library.
        return result;
    }

    private toStringNoParams(str: string | IMultiLangString): string {
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
}
