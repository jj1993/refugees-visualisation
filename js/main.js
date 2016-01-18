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

	// draw all landmaps one by one, id's are added
 	svg.selectAll(".country")
 			.data(topojson.feature(mapData, mapData.objects.countries).features).enter()
 		.append("path")
 			.attr("class", "country")
 			.attr("id", function(d){return d.id})
 			.attr("d", path);

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

	// // textblocks on the location of countries are initiated
	// // and bound to data-to-visualise
 // 	svg.selectAll(".totalAsylum")
 // 			.data(countryData).enter()
 // 		.append("text")
 // 			.attr("class","totalAsylum")
 // 			.attr("text-anchor", "middle")
 // 			.attr("x", function(d) {return d[year][4][0]})
 // 			.attr("y", function(d) {return d[year][4][1]});

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
	var typeText = {
		"inhibitans": "Vluchtelingen per 1000 inwoners",
		"gdp": "Vluchtelingen per GDP",
		"km2": "Vluchtelingen per 1000km<sup>2</sup>"
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

	}
}

function update(n) {
	svg.selectAll(".line").remove()

	var date = new Date(scaleToDate(n));
	year = date.getFullYear();
	d3.select("#monthyear").text(monthNameFormat(date) + " " + year);
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
		t.push([e.codeOrigin, q, rep])
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
			console.log($("#cirle"+n))
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
	graph.style.padding = "15px";
	graph.setAttribute("class", "graph");

	d3.select(".graph").append("text")
		.text("Total number of refugees in "+d[year][3])
		.attr("id", "graphName");
	var graphSVG = d3.select(".graph").append("svg")
						.attr("width", 300)
						.attr("height", 130)
						.attr("id", "graphSVG");
	$(function() {
	    while( $('#graphName').height() > 30) {
	        $('#graphName').css('font-size', (parseInt($('#graphName').css('font-size')) - 1) + "px" );
	    }
	});

	console.log($("#graphName").width())
	console.log($("#graphSVG").width())

	var keys = Object.keys(d)
	var data = []
	for (var i=0; i<keys.length; i++) {
		var l = {}
		var datum = new Date(day.parse(YEARS[keys[i]]))
		l.date = datum
		l.amount = d[keys[i]][0]
		data.push(l)
	}
	
	drawGraph(data, graphSVG);
}

function drawGraph(data, svg) {
	// Code of simple graph from http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5

	// Set the ranges
	var margin = {top: 0, right: 0, bottom: 20, left: 15};
    var width = parseInt(svg.style("width")) - margin.left - margin.right;
    var height = parseInt(svg.style("height")) - margin.top - margin.bottom;
	var x = d3.time.scale().range([margin.left, width]);
	var y = d3.scale.linear().range([height, margin.bottom]);
	var t = Object.keys(data).length;

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(t);

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(t);

	// Define the line
	var valueline = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.amount); });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.amount; })]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "graphline")
        .attr("d", valueline(data));

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