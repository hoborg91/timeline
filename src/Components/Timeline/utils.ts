export function compact(
    leftRender: number,
    imgWidthRender: number,
    scopeRender: { min: number, max: number }
) {
    let lr = leftRender;
    if (lr < scopeRender.min)
        lr = scopeRender.min;
    else if (lr + imgWidthRender > scopeRender.max)
        lr = scopeRender.max - imgWidthRender;
    return lr;
}
