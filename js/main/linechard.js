// =====================================================
// The small and extended pop-up linegraphs are initiated
// here. 
// =====================================================

function drawGraph(data, svg, dim, e) {
	// Code of simple graph from http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5
	// The e-variable stands for 'extended' and is a boolean

	// Set the ranges
	var margin = {top: 0, right: 0, bottom: 0.2*dim[1], left: 0.1*dim[0]};
    var width = dim[0] - margin.left - margin.right;
    var height = dim[1] - margin.top - margin.bottom;
	x = d3.time.scale().range([margin.left, width]);
	var y = d3.scale.linear().range([height, margin.bottom]);
	var t = Object.keys(data).length;

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);

    // Scale the range of the data
    x.domain([new Date(dateFormat.parse(YEARS["20100"])), new Date(dateFormat.parse(YEARS["20155"]))]);
    y.domain([0, d3.max(data, function(d) {
    	if (e && d.name == "Total") {return};
    	return d3.max(d.values, function(c) { return c[1]; });
    })]);

    for (var i=0; i<data.length; i++) {
    	var c = data[i]
    	if ((c.name == "Total" && !e ) || ( !(c.name == "Total") && e )) {

			// Define the line
			var valueline = d3.svg.line()
			    .x(function(d) { return x(d[0]); })
			    .y(function(d) { return y(d[1]); });

			// Add the valueline path.
			var colors = ["#7fc97f","#beaed4", "#fdc086", "#ffff99", "#386cb0"];

			svg.append("path").datum(c)
			        .attr("class", "graphline")
			        .attr("d", function(c) {return valueline(c.values)})
			        .attr('stroke', colors[i%6])
			        .on('mouseover', function(c) {
			        	$(".legend").remove()
			        	svg.append("text")
					    	.attr("x", '50px')
					    	.attr("y", '15px')
					    	.attr("class", "legend")
					    	.text(c.name);
					    svg.append("path")
					    	.attr("class", "legend")
					    	.attr("d", valueline(c.values))
					    	.attr('stroke', 'yellow')
					    svg.selectAll(".labels text").each(function(d) {
					    	if (d.data.label == c.name) {
					    		$(this).css("color", "red");
					    	}
					    })
			        });


		}
    }
    if(e) {svg.append("line")
    		.attr("id", "graphTimeLine")
			.attr("x1", x(new Date(dateFormat.parse(YEARS[dateKey]))))
			.attr("y1", 40)
			.attr("x2", x(new Date(dateFormat.parse(YEARS[dateKey]))))
			.attr("y2", height)
			.attr("stroke", "black")
			.style("stroke-dasharray", ("3, 3"))
	}

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
    	.attr("transform", "translate(" + width + ",0)")
        .call(yAxis);
}