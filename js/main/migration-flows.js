// ============================
// The migration flows in the
// visualisation are supported
// in this javascript file
// ============================

var color = "yellow"
var origC = "#9e4848"

function drawLines(d, pos) {
	// The lines of the major refugee flows are drawn
	svg.selectAll(".line").remove()
	var data = d[dateKey][2];
	var sMax = 0;
	var to = pos;
	highlight = {}

	for (var n=0; n<data.length; n++) {
		var d = data[n];
		var thisd = countryDict[d[0]];
		var from = thisd[dateKey][4];
		var q = d[1];
		var s = scaleToFlow(Math.sqrt(q));
		

		if (s > sMax) {sMax = s}
		var line = svg.append("line")
			.attr("class", "line")
			.attr("id", "line"+n)
			.attr("x1", from[0])
			.attr("y1", from[1])
			.attr("x2", to[0])
			.attr("y2", to[1])
			.attr("stroke", "#9e4848")
			.attr("stroke-width", s)
			.on("mouseover", function() {
				$(this).attr("stroke",color);
			})
			.on("mouseout", function() {
				$(this).attr("stroke", origC);
			});

		highlight[d[0]] = n;
	}
}

function highLight(c) {
	// The flow-lines are highlighted on mouseovers
	try {
		if (c in highlight) {
			var n = highlight[c];
			$("#line"+n).attr("stroke",color);
		}
	}
	catch (err) {}
}

function lowLight(c) {
	// On a mouseout, the lines will return to original color
	try {
		if(c in highlight) {
			var n = highlight[c];
			$("#line"+n).attr("stroke",origC);
		}
	}
	catch (err) {}
}