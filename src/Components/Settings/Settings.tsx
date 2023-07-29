import React from "react";
import { Button, Modal } from "react-bootstrap";
import { Context } from "../../context";
import { IDateFormat, ILineSettings, IUniFmtInterval, LineSettings } from "../../contracts/timeline";
import { LineSettingsComponent } from "./LineSettingsComponent";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";
import allPalette from "../../../data/palette.json";

const newKey = () => Math.floor(Math.random() * 1000 * 1000);

const maxLinesCount = 10;

const _palette = allPalette.standard as string[];

export const Settings = ({ currentSettings, apply }: {
    currentSettings: ILineSettings[],
    apply: (newSettings: ILineSettings[]) => any,
}) => {
    const ctx = React.useContext(Context);

    const [settings, setSettings] = React.useState(
        currentSettings.map(ls => ({ ls, renderKey: newKey() })));
    const [show, setShow] = React.useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const addLine = () => {
        if (settings.length >= maxLinesCount)
            return;
        let color = _palette[settings.length % _palette.length];
        for (const clr of _palette) {
            if (settings.filter(s => s.ls.mainColor === clr).length === 0) {
                color = clr;
                break;
            }
        }
        const n = [...settings, { ls: LineSettings(color, "y", 0, 3000), renderKey: newKey() }];
        setSettings(n);
    };

    const removeLine = (renderKey: number) => {
        setSettings(settings.filter(s => s.renderKey !== renderKey));
    };

    const editLine = (renderKey: number, i: IUniFmtInterval) => {
        setSettings(settings.map(s => {
            if (s.renderKey === renderKey)
                s.ls.interval = i;
            return s;
        }));
    };
    
    const discard = () => {
        handleClose();
        setSettings(currentSettings.map(ls => ({ ls, renderKey: newKey() })))
    };

    const save = () => {
        handleClose();
        apply(settings.map(s => s.ls));
    };

    const moveUp = (renderKey: number) => {
        const n: { ls: ILineSettings, renderKey: number }[] = [];
        for (let si = 0; si < settings.length; ) {
            if (si + 1 < settings.length && settings[si + 1].renderKey === renderKey) {
                n.push(settings[si + 1]);
                n.push(settings[si]);
                si += 2;
            } else {
                n.push(settings[si]);
                si++;
            }
        }
        setSettings(n);
    };

    const moveDown = (renderKey: number) => {
        const n: { ls: ILineSettings, renderKey: number }[] = [];
        for (let si = 0; si < settings.length; ) {
            if (settings[si].renderKey === renderKey) {
                if (si + 1 < settings.length)
                    n.push(settings[si + 1]);
                n.push(settings[si]);
                si += 2;
            } else {
                n.push(settings[si]);
                si++;
            }
        }
        setSettings(n);
    };

    return <div style={{ display: "inline-block" }}>
        <Button size="sm" variant="primary" onClick={handleShow}>
            {ctx.text.locResource("settings")}
        </Button>

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{ctx.text.locResource("settings")}</Modal.Title>
            </Modal.Header>
            
            {settings.map((ls, lsi) => <LineSettingsComponent
                interval={ls.ls.interval}
                color={ls.ls.mainColor}
                remove={() => removeLine(ls.renderKey)}
                edit={(i) => editLine(ls.renderKey, i)}
                moveUp={(lsi === 0 ? null : () => moveUp(ls.renderKey))}
                moveDown={(lsi === settings.length - 1 ? null : () => moveDown(ls.renderKey))}
                key={ls.renderKey} />)}
            <Button
                size="sm"
                variant="success"
                onClick={addLine}
                disabled={settings.length >= maxLinesCount}
            >
                {ctx.text.locResource("addline")}
            </Button>
            
            <Modal.Footer>
                <Button size="sm" variant="secondary" onClick={discard}>
                    <BsXCircle /> {ctx.text.locResource("discardchanges")}
                </Button>
                <Button size="sm" variant="primary" onClick={save}>
                    <BsCheckCircle /> {ctx.text.locResource("savechanges")}
                </Button>
            </Modal.Footer>
        </Modal>
    </div>;
};
