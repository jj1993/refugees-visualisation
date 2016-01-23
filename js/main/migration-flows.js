function drawLines(d, pos) {
	// The lines of the major refugee flows are drawn
	svg.selectAll(".line").remove()
	var data = d[year][2];
	var sMax = 0;
	var to = pos;
	highlight = {}

	for (var n=0; n<data.length; n++) {
		var d = data[n];
		var thisd = countryDict[d[0]];
		var from = thisd[year][4];
		var q = d[1];
		var s = scaleToLine(Math.sqrt(q));
		

		if (s > sMax) {sMax = s}
		var line = svg.append("line")
			.attr("class", "line")
			.attr("id", "line"+n)
			.attr("x1", from[0])
			.attr("y1", from[1])
			.attr("x2", to[0])
			.attr("y2", to[1])
			.attr("stroke", "#9e4848")
			.attr("stroke-width", s);
		svg.append("circle")
			.attr("class", "line")
			.attr("id","circle"+n)
			.attr("cx", from[0])
			.attr("cy", from[1])
			.attr("r", s/2)
			.attr("fill", "#9e4848");

		highlight[d[0]] = n;
	}
	svg.append("circle")
		.attr("class", "line")
		.attr("id", "mcircle")
		.attr("cx", to[0])
		.attr("cy", to[1])
		.attr("r", sMax/2)
		.attr("fill", "#9e4848");
}

function highLight(c) {
	var color = "yellow"
	try {
		if (c in highlight) {
			var n = highlight[c];
			$("#line"+n).attr("stroke",color);
			$("#circle"+n).attr("fill",color);
			$("#mcircle").attr("fill",color);
		}
	}
	catch (err) {}
}

function lowLight(c) {
	var origC = "#9e4848"
	try {
		if(c in highlight) {
			var n = highlight[c];
			$("#line"+n).attr("stroke",origC);
			$("#circle"+n).attr("fill",origC);
			$("#mcircle").attr("fill",origC);
		}
	}
	catch (err) {}
}