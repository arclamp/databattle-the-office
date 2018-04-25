(async () => {
  fetch('sentiment.json').then(req => {
    req.json().then(data => {
      console.log(data);
      render_chart(data);
    })
  });
})();

function render_chart (data) {
  const stack = d3.layout.stack();
  let dataset = {
    categories: [...Array(9).keys()].map(x => `S${x + 1}`),
    "series": ["Michael"],
    "colors": ["#3498db"],
    "layers": [
      [
      ]
    ]
  };

  for (let i = 1; i <= 9; i++) {
    let d = {};
    d.season = `S${i}`;
    d.data = data['Michael'][i] || [];
    d.y = d3.min(d.data, val => val.pos) || 0;
    d.y0 = d3.max(d.data, val => val.pos) || 0;

    dataset.layers[0].push(d);
  }

  console.log(dataset);

  const n = dataset["series"].length; // Number of Layers
  // const n = dataset["categories"].length; // Number of Layers
  const m = dataset["layers"].length; // Number of Samples in 1 layer

  const yGroupMax = d3.max(dataset["layers"], function(layer) { return d3.max(layer, function(d) { return d.y0; }); });
  const yGroupMin = d3.min(dataset["layers"], function(layer) { return d3.min(layer, function(d) { return d.y; }); });

  var margin = {top: 50, right: 50, bottom: 50, left: 100},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .domain(dataset["categories"])
    .rangeRoundBands([0, width], .08);

  var y = d3.scale.linear()
    .domain([yGroupMin, yGroupMax])
    .range([height, 0]);

  var yColor = d3.scale.linear()
    .domain([yGroupMin, yGroupMax])
    .range(['red', 'blue']);

  var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(5)
    .tickPadding(6)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var svg = d3.select("#chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var layer = svg.selectAll(".layer")
    .data(dataset["layers"]);
    layer.enter().append("g")
    .attr("class", "layer");

  var rect = layer.selectAll("rect")
    .data(function(d,i){d.map(function(b){b.colorIndex=i;return b;});return d;})
    .enter().append("rect");

    // rect.transition()
    // .duration(500)
    // .delay(function(d, i) { return i * 10; })
    // .attr("x", function(d, i, j) { return x(d.season) + x.rangeBand() / n * j; })
    // .attr("width", x.rangeBand() / n)
    // .transition()
    // .attr("y", function(d) { return y(d.y0); })
    // .attr("height", function(d) { return height - y(d.y0-d.y)})
    // .attr("class","bar")
    // .style("fill",function(d){return dataset["colors"][d.colorIndex];})

  let barData = [];
  rect.selectAll('line')
    .data((d, i) => {
      // console.log(d);

      // d.map(b => {
        // b.colorIndex = i;
        // return b;
      // });

      // let data = [];
      // for (let k in d) {
        // data.push(d[k].data.map(x => (x.season = d[k].season, x)));
      // }
      // console.log('data', data);
      // return data;

      const data = d.data.map(x => (x.season = d.season, x));

      barData.push(data);

      return data;
    });

  console.log('barData', barData);

  var bargroups = layer.selectAll('g')
    .data(barData)
    .enter()
    .append('g');

  bargroups.selectAll('line')
    .data((d, i) => d)
    .enter()
    .append('line')
    .attr('x1', (d, i, j) => {
      // console.log(d, i, j, n, x);
      const val = x(d.season) + 0 * x.rangeBand() / n;
      if (isNaN(val)) {
        console.log(d, i, j, n, x);
        console.log(val);
      }
      return val;
    })
    .attr('y1', (d, i) => {
      const val = y(d.pos);
      return val;
    })
    .attr('x2', (d, i, j) => {
      // const val = x(d.season) + x.rangeBand() / n * j;
      const val = x(d.season) + 0 * x.rangeBand() / n + 75;
      if (isNaN(val)) {
        console.log('x2', d, i, j, n);
      }
      return val;
    })
    .attr('y2', (d, i) => {
      const val = y(d.pos);
      return val;
    })
    .classed('bar', true)
    .style('stroke', d => yColor(d.pos))
    .style('opacity', 0.05);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.select("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg.append("text")
    .attr("x", width/3)
    .attr("y", 0)
    .attr("dx", ".71em")
    .attr("dy", "-.71em")
    .text("Min - Max Temperature (Month wise)");

  // add legend
  // var legend = svg.append("g")
    // .attr("class", "legend")

  // legend.selectAll('text')
    // .data(dataset["colors"])
    // .enter()
    // .append("rect")
    // .attr("x", width-margin.right)
    // .attr("y", function(d, i){ return i *  20;})
    // .attr("width", 10)
    // .attr("height", 10)
    // .style("fill", function(d) {
      // return d;
    // })

  // legend.selectAll('text')
    // .data(dataset["series"])
    // .enter()
    // .append("text")
    // .attr("x", width-margin.right + 25)
    // .attr("y", function(d, i){ return i *  20 + 9;})
    // .text(function(d){return d});

  var tooltip = d3.select("body")
    .append('div')
    .attr('class', 'tooltip');

  tooltip.append('div')
    .attr('class', 'month');
  tooltip.append('div')
    .attr('class', 'tempRange');

  svg.selectAll("rect")
    .on('mouseover', function(d) {
      if(!d.season)return null;

      tooltip.select('.month').html("<b>" + d.season + "</b>");
      tooltip.select('.tempRange').html(d.y + "&#8451; to " + d.y0 + "&#8451;");

      tooltip.style('display', 'block');
      tooltip.style('opacity',2);

    })
    .on('mousemove', function(d) {

      if(!d.season)return null;

      tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('display', 'none');
      tooltip.style('opacity',0);
    });

}
