import * as React from 'react';
import { ITextWizard, StringUtils } from './Services/text';
import { ITimeWizard, TimeWizard } from './Services/time';
import { ITimeFormatter, TimeFormatter } from './Services/timeFormatter';

const text = new StringUtils(navigator.languages);

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
    text: ITextWizard,
    time: ITimeWizard,
    timeFormatter: ITimeFormatter,
    dimensions: IDimensions,
    devMode: boolean,
}>({
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
