var generateFile = function (items) {
    let csv = "";
    for (let row = 0; row < items.length; row++) {
        let keysAmount = Object.keys(items[row]).length
        let keysCounter = 0
        if (row === 0) {
            for (let key in items[row]) {
                csv += key + (keysCounter + 1 < keysAmount ? ',' : '\r\n')
                keysCounter++
            }
            keysCounter = 0
        }
        for (let key in items[row]) {
            csv += items[row][key] + (keysCounter + 1 < keysAmount ? ',' : '\r\n')
            keysCounter++
        }
        keysCounter = 0
    }
    console.log(csv)
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'result.csv';
    hiddenElement.click();
}
