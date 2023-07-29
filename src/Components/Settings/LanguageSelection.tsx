import React from "react";
import { Button } from "react-bootstrap";
import { LangMonkier } from "../../contracts/text";

export const LanguageSelection = (props: { set: (lang: LangMonkier) => any }) => {
    return <div className="LanguageSelection" style={{ display: "inline-block" }}>
        <Button size="sm" variant="outline-secondary" onClick={() => props.set("en" as LangMonkier)}>English</Button>
        <Button size="sm" variant="outline-secondary" onClick={() => props.set("ru" as LangMonkier)}>Русский</Button>
    </div>;
}
