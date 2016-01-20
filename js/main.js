// global variables
YEARS = {"2010":"2010-01-01", "2011":"2011-01-01", "2012":"2012-01-01","2013":"2013-01-01","2014":"2014-01-01","2015":"2015-01-01", "2016":"2015-06-30"};
TYPES = ["inhibitans", "gdp", "km2"];
STARTDATE = YEARS["2010"];
showGraph = true;
showFlows = true;


// main jQuery inplementations
jQuery(window).bind('scroll', function (){
  if (jQuery(window).scrollTop() > 700){
    jQuery('#main-nav').addClass('navbar-fixed-top');
  } else {
    jQuery('#main-nav').removeClass('navbar-fixed-top');
  }
});

jQuery(document).ready(function($) {
  "use strict";
  $('#main-nav').onePageNav({
    currentClass: 'active',
    scrollOffset: 69,
  });  
});

$(document).ready(function(){
  //inertia - speed to move relative to vertical scroll. Example: 0.1 is one tenth the speed of scrolling, 2 is twice the speed of scrolling
  $('#top').parallax("50%", 0.1);
  $('#inhibitants').bind("click", function () { 
  	type = TYPES[0];
  	});
  $('#gdp').bind("click", function () { 
  	type = TYPES[1];
  	update($('#slider-scrub').position().left); 
  });
  $('#km2').bind("click", function () { 
  	type = TYPES[2];
  	update($('#slider-scrub').position().left);
  });
})

$('#check').on('change', 'input[type=checkbox]', function(e) {   
	// keeping track on the checkboxes
    if (this.name == "flow") {
    	if (this.checked) {svg.selectAll(".line").remove(); showFlows = false;}
    	else {showFlows = true}
    }
    if (this.name == "graph") {
    	if (this.checked) {$(".graph").remove(); showGraph = false;}
    	else {showGraph = true}
    }
    else {console.log(this.name+' '+this.value+' '+this.checked);}
});

window.onload = function() {
	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.json, "../data/world-50m.json");
 	q.defer(d3.json, "../data/refugees.json");
 	q.defer(d3.json, "../data/total.json");
 	q.defer(d3.json, "../data/colorvalues.json");
 	q.defer(d3.json, "../data/centres.json");
 	q.defer(d3.json, "../data/iso.json")
 	q.awaitAll(initiateMap);
}

// Draws a map with the crators in the dataset
function initiateMap(error, data){
	// Build scale for slider
	var slider = d3.select("#slider-scrub").node().getBoundingClientRect();
	var bar = d3.select("#slider").node().getBoundingClientRect();
	var domain = [slider.width, bar.width];
	day = d3.time.format("%Y-%m-%d");
	var range = [day.parse(YEARS["2010"]), day.parse(YEARS["2016"])];
	scaleToDate = d3.scale.linear().domain(domain).range(range);
	scaleToLine = d3.scale.linear().domain([0, Math.sqrt(200000)]).range([0, 10]);
	monthNameFormat = d3.time.format("%B");

	// starting variables are defined
	mapData = data[0];
	refugees = data[1];
	colorValues = data[3];
	total = data[2];
	countryCentres = data[4];
	iso = data[5];

	var startDate = new Date(day.parse(STARTDATE));
	year = startDate.getFullYear();
	type = TYPES[2];

	// build svg element to hold map
	var width = document.getElementById('map').offsetWidth
	var height = 0.5*screen.height
	svg = d3.select("#map").append("svg")
 			.attr("width", width)
 			.attr("height", height);

	// initialise projection of the map
	var projection = d3.geo.mercator()
					.scale(400)
					.translate([width / 3, height*1.2]);

	// initialise path builder
	var path = d3.geo.path()
				.projection(projection);

	// // Zoomfunction from https://gist.github.com/mbostock/2206340
	// var zoom = d3.behavior.zoom()
	//     .translate(projection.translate())
	//     .scale(projection.scale())
	//     .scaleExtent([height, 8 * height])
	//     .on("zoom", zoomed);

	// draw all landmaps one by one, id's are added
 	svg.selectAll(".country")
 			.data(topojson.feature(mapData, mapData.objects.countries).features).enter()
 		.append("path")
 			.attr("class", "country")
 			.attr("id", function(d){return d.id})
 			.attr("d", path)
      		// .on("click", clicked);

 	// data is sorted in the sequence of the countries
	countryDict = {}
	var geometries = mapData.objects.countries.geometries;
	var idArr = [];
 	svg.selectAll(".country").each(function(d) {countryDict[this.id] = this});
	for (var i=0; i<geometries.length; i++) {
		idArr.push(geometries[i].id);
	}
	countryData = getCountryData(idArr);

 	// the data-to-visualise is bound to the countries and
 	// countryDict is overwritten
 	svg.selectAll(".country").data(countryData)
 		.each(function(d) {countryDict[this.id] = d});

 	// the implementation of the migration-flow-lines
 	svg.selectAll(".country")
 		.on("click", function(d) {
	 		var pos = d3.mouse(this); 
	 		$(".graph").remove();
	 		if (showFlows) {drawLines(d, pos);}
	 		if (showGraph) {drawInfo(d, pos);}
 		})
 		.on("mouseenter", function(d) {
 			var pos = d3.mouse(this);
			svg.append("text")
 				.text(d[year][3])
 				.attr("x", pos[0])
 				.attr("y", pos[1])
 				.attr("id", "countryName");
 			var code = d[year][5]
 			if (showFlows) {highLight(code)}
 		})
 		.on("mousemove", function() {
 			var pos = d3.mouse(this);
 			try {d3.select("#countryName").attr("x",pos[0]).attr("y",pos[1]);}
 			catch (err) {
 				console.log("Mousemove error catched");
 			}
 		})
 		.on("mouseleave", function(d) {
 			d3.select("#countryName").remove();
 			var code = d[year][5]
 			if (showFlows) {lowLight(code)}
 		});

 	// the date in the top of the visualisation is initiated
	d3.select("#monthyear").text(monthNameFormat(startDate) + " " + year);

	// the mapinfo is drawn
	drawMap(year);

	// the legenda is initiated
	legenda();

	// function clicked(d) {
	//   var centroid = path.centroid(d),
	//       translate = projection.translate();
	//   projection.translate([
	//     translate[0] - centroid[0] + width / 2,
	//     translate[1] - centroid[1] + height / 2
	//   ]);
	//   zoom.translate(projection.translate());
	//   g.selectAll("path").transition()
	//       .duration(700)
	//       .attr("d", path);
	// }
	// function zoomed() {
	//   projection.translate(d3.event.translate).scale(d3.event.scale);
	//   g.selectAll("path").attr("d", path);
	// }
}

function drawMap(year) {
	// build scale for colors
	var domain = d3.extent(countryData, function(d){
		try {return d[year][1][type]}
		catch (err) {return};
		});
	scaleToColor = d3.scale.linear().domain(domain).range(["#f7fcfd","#084594"]);

	svg.selectAll(".country").each(function(d, i) {
		try {var fill = scaleToColor(d[year][1][type])}
		catch (err) {fill = undefined};
		d3.select(this).attr("style", "fill: " + fill);
	});

	svg.selectAll(".totalAsylum").each(function(d) {
		d3.select(this).text(function() {
			try {
				return d[year][0];
			}
			catch (err) {return "Onbekend"};
		})
	})
}

function updateLegenda() {
	// legenda values are collected
	typeText = {
		"inhibitans": "Vluchtelingen per 1000 inwoners",
		"gdp": "Vluchtelingen per GDP",
		"km2": "Vluchtelingen per 1000 km²"
	}
	var values = d3.extent(countryData, function(d){
		try {return d[year][1][type]}
		catch (err) {return};
		});
	values.splice(1, 0, values[0]+values[1]/2.0);

	// legenda is updated
	$("#type").empty().append("<p>"+typeText[type]+"</p>")
	for (var i=0; i<3; i++) {
		$("#legvalue"+i).empty().append("<p>"+parseFloat(values[i]).toFixed(2)+"</p>")
		d3.select("#legrect"+i).attr("style","fill:"+scaleToColor(values[i]))
	}	
}

function legenda() {
	// The legenda is drawn
	values = [50000, 250000, 800000];
	updateLegenda();
	for (var i=0; i<3; i++) {
		$("#legvalue"+(i+3)).empty().append("<p>"+values[i]+"</p>");
		var q = scaleToLine(Math.sqrt(values[i]));
		d3.select("#legrect"+(i+3)).append("rect")
			.attr("height", q)
			.attr("width", "70")
			.attr("class", "line")
			.attr("style","border-style: hidden")
			.attr("rx", q/2)
			.attr("ry", q/2)
			.attr("style", "fill: #9e4848")
	}
}

function update(n) {
	svg.selectAll(".line").remove()

	var date = new Date(scaleToDate(n));
	year = date.getFullYear();
	d3.select("#monthyear").text(monthNameFormat(date) + " " + year);
	try {
		d3.select("#graphTimeLine")
			.attr("x1", x(new Date(day.parse(YEARS[year]))))
			.attr("x2", x(new Date(day.parse(YEARS[year]))))
		}
	catch (err) {}
	drawMap(year);
	updateLegenda();
}

function giveName() {
	console.log("Piet paulesma")
}

function getTotal(c, y) {
	// The total number of refugees per country is returned
	for (var m = 0; m < total.length; m++) {
		var e = total[m];
		if (c == e.codeAsylum && e[y] != undefined) {
			return e[y];
		}
	}
	return undefined;
}

function getColor(c, y) {
	// The relative values that will be scaled to the colors
	// on the map are returned
	for (var m = 0; m < colorValues.length; m++) {
		var e = colorValues[m]
		if (c == e.codeOrigin) {
			var t = {}
			for (var l = 0; l < TYPES.length; l++) {
				var thistype = TYPES[l]
				if (typeof e[thistype+y] == "number") {
					t[thistype] = Math.log(e[thistype+y]+1);
				}
				else {t[thistype] = undefined}
			}
			return t
		}
	}
}

function getRefugeeFlows(c, y) {
	// The major flows to every country are returned
	var t = []
	for (var m = 0; m < refugees.length; m++) {
		var e = refugees[m];
		if (c == e.codeAsylum) {
			var q = e[y]
			if (q == undefined) {break}
			try {
				var rep = e["rep"];
			}
			catch (err) {
				var rep = 0;
			}
		t.push([e.codeOrigin, q, e.origin])
		}
	}
	return t
}

function getName(c) {
	// The name of every country is returned
	for (var m = 0; m < iso.length; m++) {
		var e = iso[m];
		if (e[0] == c) {
			return e[1]
		}
	}
	return "Onbekend"
}

function getCentre(c) {
	// The bbox centre of every country is returned
	var thispath = countryDict[c]
	var bbox = thispath.getBBox();
	return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
	// for (var m = 0; m < countryCentres.length; m++) {
	// 	var d = countryCentres[m];
	// 	if (d.callingCodes[0] == c.toString()) {
	// 		return projection(d.latlng)
	// 	}
	// }
	// return projection([-2,30])
}

function getCountryData(idArr) {
	// All data per country is combined to a list of dicts
	var a = [];

	var yearL = Object.keys(YEARS);
	for (var n = 0; n < idArr.length; n++) {
		var d = {};
		var code = idArr[n];
		var name = getName(code);
		var centre = getCentre(code);
		for (var i = 0; i < yearL.length; i++) {
			var year = yearL[i];
			var totalAsylum = getTotal(code, year);
			var colorValues = getColor(code, year);
			var refugeeFlows = getRefugeeFlows(code, year);
			d[year] = [totalAsylum, colorValues, refugeeFlows, name, centre, code];
		}
		a.push(d);
	}
	return a
}

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

	d3.select(".graph").append("text")
		.text("Total number of refugees in "+d[year][3])
		.attr("id", "graphName");

	var graphSVG = d3.select(".graph").append("svg")
						// .attr("width", 0)
						// .attr("height", 0)
						// .transition()
						.attr("width", 300)
						.attr("height", 125)
						.attr("id", "graphSVG");

	// this function makes sure that the title will fit in the div
	$(function() {
	    while( $('#graphName').height() > 30) {
	        $('#graphName').css('font-size', (parseInt($('#graphName').css('font-size')) - 1) + "px" );
	    }
	});

	var data = sortData(d)	
	var dim = [parseInt(graphSVG.style("width")), parseInt(graphSVG.style("height"))]
	drawGraph(data, graphSVG, dim, false);

	d3.select(".graph").append("button")
		.attr("type", "button")
		.attr("class", "btn btn-info")
		.attr("id", "extgraph")
		.text("Meer informatie")
		.on("click", function() {extend(d)});

}



function sortData(d) {
	var keys = Object.keys(d)
	var rawData = []
	for (var i=0; i<keys.length; i++) {
		var l = {}
		var datum = new Date(day.parse(YEARS[keys[i]]))
		var fdata = d[keys[i]][2]
		for (var m=0; m<fdata.length; m++) {
			var origin = fdata[m][2]
			l[origin] = fdata[m][1]
		}
		l.date = datum
		l.Total = d[keys[i]][0]
		rawData.push(l)
	}

	var data = []
	for (var i=0; i<rawData.length; i++) {
		var keys = Object.keys(rawData[i])
		for (var k=0; k<keys.length; k++) {
			var key = keys[k]
			var q = rawData[i][key]
			if (key != "date") {
				data = updateData(rawData[i], data, key, q)
			}
		}
	}
	return data
}

function updateData(raw, d, k, q) {
	for (var n=0; n<d.length; n++) {
		if (d[n].name == k) {
			d[n].data.push([raw.date, q])
			return d
		}
	}
	d.push({
		name: k,
		data: [[raw.date, q]]
	})
	return d
}

function extend(d) {
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

	var data = sortData(d)

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

	drawRank(d)
}

function drawRank(data) {
	var l = data[year][1]
	var keys = Object.keys(l)
	console.log(l, keys)
	for (var n=0; n<keys.length; n++) {
		d3.select(".graph").append("p")
			.attr("class", "extrank")
			.style("left", 50 + 300*n + 'px')
			.text(typeText[keys[n]]+": "+l[keys[n]].toFixed(2))
		}
}

function drawGraph(data, svg, dim, e) {
	// Code of simple graph from http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5

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
    x.domain([new Date(day.parse(YEARS["2010"])), new Date(day.parse(YEARS["2016"]))]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.data, function(c) { return c[1]; });})]);

    for (var i=0; i<data.length; i++) {
    	var c = data[i]
    	if (c.name == "Total" || e) {

			// Define the line
			var valueline = d3.svg.line()
			    .x(function(d) { return x(d[0]); })
			    .y(function(d) { return y(d[1]); });

			// Add the valueline path.
			var color = "hsl(" + i/data.length * 360 + ",100%,50%)"
			svg.append("path").datum(c)
			        .attr("class", "graphline")
			        .attr("d", function(c) {return valueline(c.data)})
			        .attr('stroke', color)
			        .on('mouseover', function(c) {
			        	$(".legend").remove()
			        	svg.append("text")
					    	.attr("x", '50px')
					    	.attr("y", '15px')
					    	.attr("class", "legend")
					    	.text(c.name);
					    svg.append("path")
					    	.attr("class", "legend")
					    	.attr("d", valueline(c.data))
					    	.attr('stroke', 'yellow')
			        });
		}
    }
    if(e) {svg.append("line")
    		.attr("id", "graphTimeLine")
			.attr("x1", x(new Date(day.parse(YEARS[year]))))
			.attr("y1", 40)
			.attr("x2", x(new Date(day.parse(YEARS[year]))))
			.attr("y2", height)
			// .attr("stroke-width", 2)
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



function drawPie(data, svg, dim) {


	var g = svg.append("g")
				.attr("id", "piegraph")

	g.append("g")
		.attr("class", "slices");
	g.append("g")
		.attr("class", "labels");
	g.append("g")
		.attr("class", "lines");

	var width = dim[0],
	    height = dim[1],
		radius = Math.min(width, height) / 2.2;

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});

	var arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.4);

	var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	g.attr("transform", "translate(" + width * 1.3 + "," + height / 2 + ")");

	var key = function(d){ return d.data.label; };

	var keys = []
	for (var i=0; i<data[year][2].length; i++) {
		keys.push(data[year][2][i][2])
	}

	var color = d3.scale.ordinal()
		.domain(keys)
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

	function randomData (){
		r = [];
		for (var i=0; i<data[year][2].length; i++) {
			r.push({
				label: data[year][2][i][2],
				value: data[year][2][i][1]
			})
		}
		return r
	}

	change(randomData());

	d3.select("#slider-scrub")
		.on("mouseup", function(){
			change(randomData());
		})
		.on("mouseout", function(){
			change(randomData());
		});

	$(document).mouseup(function() {
		change(randomData());
	});


	function change(data) {

		/* ------- PIE SLICES -------*/
		var slice = svg.select(".slices").selectAll("path.slice")
			.data(pie(data), key);

		slice.enter()
			.insert("path")
			.style("fill", function(d) { return color(d.data.label); })
			.attr("class", "slice");

		slice		
			.transition().duration(1000)
			.attrTween("d", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			})

		slice.exit()
			.remove();

		/* ------- TEXT LABELS -------*/

		var text = svg.select(".labels").selectAll("text")
			.data(pie(data), key);

		text.enter()
			.append("text")
			.attr("dy", ".35em")
			.text(function(d) {
				return d.data.label;
			});
		
		function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		}

		text.transition().duration(1000)
			.attrTween("transform", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
					return "translate("+ pos +")";
				};
			})
			.styleTween("text-anchor", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					return midAngle(d2) < Math.PI ? "start":"end";
				};
			});

		text.exit()
			.remove();

		/* ------- SLICE TO TEXT POLYLINES -------*/

		var polyline = svg.select(".lines").selectAll("polyline")
			.data(pie(data), key);
		
		polyline.enter()
			.append("polyline");

		polyline.transition().duration(1000)
			.attrTween("points", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
					return [arc.centroid(d2), outerArc.centroid(d2), pos];
				};			
			});
		
		polyline.exit()
			.remove();
	};
}