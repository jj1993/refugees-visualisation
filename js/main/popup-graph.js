function drawInfo(d, pos) {
	// The popup window when clicking on a country is drawn

	var xOffset = -500;
	var yOffset = -250;
	var x = pos[0]+xOffset;
	var y = pos[1]+yOffset;
	if (x < 0) {x = 0};
	if (y < 0) {y = 0};
	var graph = document.createElement("div");
	document.getElementById("map").appendChild(graph);
	graph.style.position = "absolute";
	graph.style.left = x + 'px';
	graph.style.top = y + 'px';
	graph.style.padding = "25px";
	graph.setAttribute("class", "graph");

	var data = reformatData(d)
	if (data.length == 1) {
		d3.select(".graph")
				.style("display", "block")
				.style("width", '400px')
				.style("height", '150px')
			.append("text")
				.text("Sorry, no data available for "+d[year][3])
				.attr("id", "graphName");
		return
	}

	d3.select(".graph").append("text")
		.text("Total number of refugees in "+d[year][3])
		.attr("id", "graphName");

	var graphSVG = d3.select(".graph").append("svg")
						.attr("width", 300)
						.attr("height", 125)
						.attr("id", "graphSVG");

	// this function makes sure that the title will fit in the div
	$(function() {
	    while( $('#graphName').height() > 30) {
	        $('#graphName').css('font-size', (parseInt($('#graphName').css('font-size')) - 1) + "px" );
	    }
	});

	
	var dim = [parseInt(graphSVG.style("width")), parseInt(graphSVG.style("height"))]
	drawGraph(data, graphSVG, dim, false);

	d3.select(".graph").append("button")
		.attr("type", "button")
		.attr("class", "btn btn-info")
		.attr("id", "extgraph")
		.text("Meer informatie")
		.on("click", function() {extendInfo(d)});

}

function extendInfo(d) {
	// This function is called when clicking on the "show more info" button
	// in the pop-up graph, after clicking on a country

	var graph = d3.select(".graph")
	var width = graph.style("width")
	var height = graph.style("height")
	$(".graph").empty()

	graph.append("text")
		.text("Extended data on refugees in "+d[year][3])
		.attr("id", "extGraphName");

	graph
		.style("width", width)
		.style("height", height)
		.transition()
		.style("top", "20px")
		.style("left", screen.width*0.1+'px')
		.style("width", screen.width*0.8+'px')
		.style("height", screen.height*0.4+'px')
		.style("opacity", 0.95)
		.style("pointer-events", "auto")
		.style("padding-top", "50px");

	var svg = graph.append("svg")
		.style("height", "90%")
		.style("width", "100%")
		.attr("id", "extgraphsvg");

	var data = reformatData(d)

	var dim = [screen.width*0.4,screen.height*0.28]
	drawGraph(data, svg, dim, true)
	drawPie(d, svg, dim)

	svg.append("text")
		.style("left", parseInt(width)/2)
		.style("top", 50)
		.text(d[year][1][0], d[year][1][1], d[year][1][2])

	graph.append("button")
		.attr("type", "button")
		.attr("class", "btn btn-link")
		.text("close")
		.attr("id","closebtn")
		.on("click", function() {$(".graph").remove()})

	drawRanks(d)
}

function drawRanks(data) {

	var l = data[year][1]
	var keys = Object.keys(l)

	for (var n=0; n<keys.length; n++) {
		d3.select(".graph").append("p")
			.attr("class", "extrank")
			.style("left", 50 + 300*n + 'px')
			.text(typeText[keys[n]]+": "+l[keys[n]].toFixed(2))
		}
}