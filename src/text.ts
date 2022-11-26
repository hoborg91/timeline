import { IMultiLangString } from "./dtos";

export class StringUtils {
    private _langs: string[];

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
    }

    toString(str: string | IMultiLangString): string | null {
        if (typeof str === "string")
            return str;

        for (let loc of this._langs) {
            const s = str[loc];
            if (s !== undefined && s !== null)
                return s;
        }

        return null;
    }
}
