import * as React from 'react';
import { ITextWizard, StringUtils } from './Services/text';
import { ITimeWizard, TimeWizard } from './Services/time';

export const Context = React.createContext<{ text: ITextWizard, time: ITimeWizard }>({
    text: new StringUtils(navigator.languages),
    time: new TimeWizard(),
});