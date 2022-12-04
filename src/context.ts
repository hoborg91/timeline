import * as React from 'react';
import { ITextWizard, StringUtils } from './Services/text';
import { ITimeWizard, TimeWizard } from './Services/time';
import { ITimeFormatter, TimeFormatter } from './Services/timeFormatter';

const text = new StringUtils(navigator.languages);

export interface IDimensions {
    mainTdWidth: number;
    mainTdHeight: number;
    sideTdWidth: number;
    descrBoxWidth: number;
    descrBoxHeight: number;
}

export const Context = React.createContext<{
    text: ITextWizard,
    time: ITimeWizard,
    timeFormatter: ITimeFormatter,
    dimensions: IDimensions,
}>({
    text,
    time: new TimeWizard(),
    timeFormatter: new TimeFormatter(text),
    dimensions: {
        mainTdWidth: 1000,
        mainTdHeight: 100,
        sideTdWidth: 100,
        descrBoxWidth: 150,
        descrBoxHeight: 50,
    },
});
