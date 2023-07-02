import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { BsChevronBarDown, BsChevronBarUp, BsTrash } from "react-icons/bs";
import { Context } from "../../context";
import { IDateFormat, IUniFmtInterval } from "../../contracts/timeline";

export const LineSettingsComponent = ({ interval, color, remove, edit, moveUp, moveDown }: {
    interval: IUniFmtInterval<IDateFormat>,
    color: string,
    remove: () => any,
    edit: (i: IUniFmtInterval<IDateFormat>) => any,
    moveUp: (() => any) | null,
    moveDown: (() => any) | null,
}) => {
    const ctx = React.useContext(Context);

    const onChange1 = (e: any) => {
        const nm = e.target.name as keyof IUniFmtInterval<IDateFormat>;
        interval[nm] = e.target.value;
        edit(interval);
    };

    return <div>
        <InputGroup size="sm" className="mb-3">
            <Form.Select
                aria-label={ctx.text.locResource("fmt")}
                name="fmt"
                defaultValue={interval.fmt}
                onChange={onChange1}
            >
                <option value="y">{ctx.text.locResource("years")}</option>
                <option value="my">{ctx.text.locResource("millionyears")}</option>
            </Form.Select>
            <Form.Control
                name="fromVal"
                defaultValue={interval.fromVal}
                onChange={onChange1}
                type="number"
                placeholder={ctx.text.locResource("from")}
                aria-label={ctx.text.locResource("from")}
            />
            <Form.Control
                name="tillVal"
                defaultValue={interval.tillVal}
                onChange={onChange1}
                type="number"
                placeholder={ctx.text.locResource("till")}
                aria-label={ctx.text.locResource("till")}
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
