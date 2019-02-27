function StackedAreaChartExample(data, xAccess, yAccess) {
  var colors = d3.scale.category20();
  var chart;
  nv.addGraph(function() {
    chart = nv.models.stackedAreaChart()
      .useInteractiveGuideline(true)
      .x(function(d) { return d[0] })
      .y(function(d) { return d[1] })
      .controlLabels({stacked: "Stacked"})
      .duration(300);
    chart.xAxis.tickFormat(function(d,i) {
      if (i % 2 === 0) {
        return "";
      } else {
        return d3.time.format('%m/%d-%H:00')(new Date(d))
      }
    });
    chart.yAxis.tickFormat(d3.format(',d'));
    chart.legend.vers('furious');
    d3.select('#chart1')
      .datum(data)
      .transition().duration(1000)
      .call(chart)
      .each('start', function() {
        setTimeout(function() {
          d3.selectAll('#chart1 *').each(function() {
            if(this.__transition__)
              this.__transition__.duration = 1;
          })
        }, 0)
      });
    nv.utils.windowResize(chart.update);
    graph = chart; // Save the chart so we can work with it later
    return chart;
  });
}

var graph;
function BuildUserListenGraph(data) {
  let xAccess = function(d) {
    return d.key;
  };
  let yAccess = function(d) {
    return d.values;
  };
  StackedAreaChartExample(data, xAccess, yAccess);
}