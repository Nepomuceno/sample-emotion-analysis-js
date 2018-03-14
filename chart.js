var count = 1;
function renderChart(emotion) {
    count++;
    dps.forEach(dp => {
        console.log(dp.name.toLowerCase() + ": " + emotion[dp.name.toLowerCase()]);
        dp.dataPoints.push(
            {
                x: count,
                y: emotion[dp.name.toLowerCase()]
            }
        )
        if (dp.dataPoints.length > dataLength) {
            dp.dataPoints.shift();
        }
    });
    chart.render();
}
var dps = [{
    type: "stackedColumn100",
    name: "Anger",
    color: "#A61103",
    showInLegend: true,
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Contempt",
    showInLegend: true,
    color: "#A4A9FF",
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Disgust",
    showInLegend: true,
    color: "#4E2596",
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Fear",
    showInLegend: true,
    color: "#F2B705",
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Happiness",
    showInLegend: true,
    color: "#067302",
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Neutral",
    showInLegend: true,
    color: "#F2F2F2",
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Sadness",
    showInLegend: true,
    color: "#1F1E1E",
    dataPoints: [
    ]
},
{
    type: "stackedColumn100",
    name: "Surprise",
    showInLegend: true,
    color: "#F06E09",
    dataPoints: [
    ]
}];
var dataLength = 30; // number of dataPoints visible at any point
var chart;
(function () {
    chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Dynamic Data"
        },
        axisX: {
            interval: 1,
            intervalType: "seconds"
        },
        axisY: {
            suffix: "%"
        },
        toolTip: {
            shared: true
        },
        legend: {
            reversed: true,
            verticalAlign: "center",
            horizontalAlign: "right"
        },
        data: dps
    });
    chart.render();
})()

var generateGauge  = function(value,id,name) {
    value = Math.ceil(value * 100);
    /*var g = new JustGage({
        id: id,
        value: value,
        min: 0,
        max: 100,
        title: name
    });*/
    var chart = c3.generate({
        bindto: '#' + id,
        data: {
            columns: [
                [name, value]
            ],
            type: 'gauge',
        },
        gauge: {            
        },
        color: {
            pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
            threshold: {
                values: [30, 60, 90, 100]
            }
        },
        size: {
            width: 170,
            height: 120
        }
    });
}