import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { BsChevronBarDown, BsChevronBarUp, BsTrash } from "react-icons/bs";
import { PureDi } from "../../context";
import { IUniFmtInterval } from "../../contracts/timeline";

export const LineSettingsComponent = ({ interval, color, remove, edit, moveUp, moveDown }: {
    interval: IUniFmtInterval,
    color: string,
    remove: () => any,
    edit: (i: IUniFmtInterval) => any,
    moveUp: (() => any) | null,
    moveDown: (() => any) | null,
}) => {
    const di = React.useContext(PureDi);

    const onChange1 = (e: any) => {
        const nm = e.target.name as keyof IUniFmtInterval;
        interval[nm] = e.target.value;
        edit(interval);
    };

    return <div>
        <InputGroup size="sm" className="mb-3">
            <Form.Select
                aria-label={di.text.locResource("fmt")}
                name="fmt"
                defaultValue={interval.fmt}
                onChange={onChange1}
            >
                <option value="y">{di.text.locResource("years")}</option>
                <option value="my">{di.text.locResource("millionyears")}</option>
            </Form.Select>
            <Form.Control
                name="fromVal"
                defaultValue={interval.fromVal}
                onChange={onChange1}
                type="number"
                placeholder={di.text.locResource("from")}
                aria-label={di.text.locResource("from")}
            />
            <Form.Control
                name="tillVal"
                defaultValue={interval.tillVal}
                onChange={onChange1}
                type="number"
                placeholder={di.text.locResource("till")}
                aria-label={di.text.locResource("till")}
            />
            <Form.Control
                type="color"
                defaultValue={color}
            />
            <Button
                variant="secondary"
                onClick={() => { if (moveUp !== null) moveUp(); }}
                disabled={moveUp === null}
            >
                <BsChevronBarUp />
            </Button>
            <Button
                variant="secondary"
                onClick={() => { if (moveDown !== null) moveDown(); }}
                disabled={moveDown === null}
            >
                <BsChevronBarDown />
            </Button>
            <Button variant="secondary" onClick={remove}><BsTrash /></Button>
        </InputGroup>
    </div>;
}
