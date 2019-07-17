export function getLabelsOnTheSameLevel(
    cols,
    initialArr,
    depth,
    flattenedArr,
    lastEl
) {
    for (let i = 0; i < cols.length; i++) {
        if (cols[i].cols === undefined) {
            for (let j = 0; j < cols.length; j++) {
                flattenedArr.push(cols[j]);
            }

            if (lastEl !== null)
                lastEl.colSpan = cols.length + lastEl.colSpan;

            depth--;
            while (depth > 0) {
                // initialArr[depth][initialArr[depth].length-1].colSpan+=lastEl.colSpan
                depth--;
                initialArr[depth][initialArr[depth].length - 1].colSpan +=
                    lastEl.colSpan;
            }

            return { initialArr, flattenedArr };
        }

        if (initialArr[depth] === undefined) {
            initialArr[depth] = [];
        }

        initialArr[depth].push({
            label: cols[i].label,
            colSpan: 0
        });

        let res = getLabelsOnTheSameLevel(
            cols[i].cols,
            initialArr,
            depth + 1,
            flattenedArr,
            initialArr[depth][initialArr[depth].length - 1]
        );
        initialArr = res.initialArr;
    }

    return { initialArr, flattenedArr };
}