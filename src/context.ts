import * as React from 'react';
import { ITextWizard, StringUtils } from './Services/text';
import { ITimeWizard, TimeWizard } from './Services/time';
import { ITimeFormatter, TimeFormatter } from './Services/timeFormatter';
import { LangMonkier } from './contracts/text';

let languages = navigator.languages as LangMonkier[];
const updateLanguages = (preferredLanguage: LangMonkier) => {
    languages = [preferredLanguage, ...navigator.languages, "en", "en-US"]
        .filter((v, i, a) => a.indexOf(v) === i) as LangMonkier[];
}

const text = new StringUtils(() => languages);

export type IDimensions = Readonly<{
    mainTdWidth: number;
    mainTdHeight: number;
    sideTdWidth: number;
    descrBoxWidth: number;
    descrBoxHeight: number;
    wholeTableWidh: number;
}>

const mainTdWidth = 1000, 
      sideTdWidth = 100;

export const Context = React.createContext<{
    setLanguage: (language: LangMonkier) => any,
    text: ITextWizard,
    time: ITimeWizard,
    timeFormatter: ITimeFormatter,
    dimensions: IDimensions,
    devMode: boolean,
}>({
    setLanguage: (lang: LangMonkier) => updateLanguages(lang),
    text,
    time: new TimeWizard(),
    timeFormatter: new TimeFormatter(text),
    dimensions: {
        mainTdWidth,
        mainTdHeight: 100,
        sideTdWidth,
        descrBoxWidth: 150,
        descrBoxHeight: 50,
        wholeTableWidh: mainTdWidth + sideTdWidth * 2,
    },
    devMode: false,
});
