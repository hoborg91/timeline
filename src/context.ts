import * as React from 'react';
import { ITextWizard, StringUtils } from './Services/text';
import { ITimeWizard, TimeWizard } from './Services/time';
import { ITimeFormatter, TimeFormatter } from './Services/timeFormatter';

const text = new StringUtils(navigator.languages);

export const Context = React.createContext<{
    text: ITextWizard,
    time: ITimeWizard,
    timeFormatter: ITimeFormatter,
}>({
    text,
    time: new TimeWizard(),
    timeFormatter: new TimeFormatter(text),
});
