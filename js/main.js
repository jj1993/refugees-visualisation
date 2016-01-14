YEARS = {"2010":"2010-01-01", "2011":"2011-01-01", "2012":"2012-01-01","2013":"2013-01-01","2014":"2014-01-01","2015":"2015-01-01", "2016":"2015-06-30"};
TYPES = ["inhibitans", "gdp", "km2"];
STARTDATE = YEARS["2010"];

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

window.onload = function() {
	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.json, "../data/world-50m.json");
 	q.defer(d3.json, "../data/refugees.json");
 	q.defer(d3.json, "../data/total.json");
 	q.defer(d3.json, "../data/colorvalues.json");
 	q.defer(d3.json, "../data/centres.json")
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
	scaleToLine = d3.scale.linear().domain([0, Math.sqrt(50000)]).range([0, 6]);
	monthNameFormat = d3.time.format("%B");

	// starting variables are defined
	mapData = data[0];
	refugees = data[1];
	colorValues = data[3];
	total = data[2];
	countryCentres = data[4];

	var startDate = new Date(day.parse(STARTDATE));
	year = startDate.getFullYear();
	type = TYPES[2];

	// build svg element to hold map
	var width = document.getElementById('map').offsetWidth
	var height = 0.6*screen.height
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
 	svg.selectAll(".country").data(countryData).each(function(d) {countryDict[this.id] = d});

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
 	svg.selectAll(".country").on("click", function(d) {
 		var pos = d3.mouse(this); 
 		$(".graph").remove();
 		drawLines(d, pos);
 		drawInfo(d, pos);
 	});
 	svg.selectAll(".country").on("mouseout", function() {
 		console.log("BAM")
 	});

 	// the date in the top of the visualisation is initiated
	d3.select("#monthyear").text(monthNameFormat(startDate) + " " + year);

	// the mapinfo is drawn
	drawMap(year);
}

function drawMap(year) {
	// build scale for colors
	var domain = d3.extent(countryData, function(d){
		try {return d[year][1][type]}
		catch (err) {return};
		});
	var middle = domain[0]+domain[1]/4.0;
	var scaleToColor = d3.scale.linear().domain(domain).range(["#f7fcfd","#084594"]);//[domain[0], middle, domain[1]]).range(["#67a9cf","#f7f7f7","#ef8a62"]);

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

function update(n) {
	svg.selectAll(".line").remove()
	var date = new Date(scaleToDate(n));
	year = date.getFullYear();
	d3.select("#monthyear").text(monthNameFormat(date) + " " + year);
	drawMap(year);
}

function getTotal(c, y) {
	for (var m = 0; m < total.length; m++) {
		var e = total[m];
		if (c == e.codeAsylum && e[y] != undefined) {
			return e[y];
		}
	}
	return undefined;
}

function getColor(c, y) {
	for (var m = 0; m < colorValues.length; m++) {
		var e = colorValues[m]
		if (c == e.codeOrigin) {
			var t = {}
			for (var l = 0; l < TYPES.length; l++) {
				var thistype = TYPES[l]
				// console.log(e[thistype+y])
				// if (e[thistype+y] == "NaN") {
				// 	console.log(e[thistype+y])
				// }
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
	return
}

function getCentre(c) {
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
			d[year] = [totalAsylum, colorValues, refugeeFlows, name, centre];
		}
		a.push(d);
	}
	return a
}

function drawLines(d, pos) {
	svg.selectAll(".line").remove()
	var data = d[year][2];
	var sMax = 0;
	var to = pos;

	for (var n=0; n<data.length; n++) {
		var d = data[n]
		var thisd = countryDict[d[0]];
		var from = thisd[year][4];
		var q = d[1];
		var s = scaleToLine(Math.sqrt(q))
		if (s > sMax) {sMax = s}
		svg.append("line")
			.attr("class", "line")
			.attr("x1", from[0])
			.attr("y1", from[1])
			.attr("x2", to[0])
			.attr("y2", to[1])
			.attr("stroke-width", s);
		svg.append("circle")
			.attr("class", "line")
			.attr("cx", from[0])
			.attr("cy", from[1])
			.attr("r", s/2);
	}
	svg.append("circle")
		.attr("class", "line")
		.attr("cx", to[0])
		.attr("cy", to[1])
		.attr("r", sMax/2);
}

function drawInfo(d, pos) {
	var xOffset = -300;
	var yOffset = -150;
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

	console.log(pos)

	var graphSVG = d3.select(".graph").append("svg")
						.attr("width", 250)
						.attr("height", 100);

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
	var width = parseInt(svg.style("width"));
	var height = parseInt(svg.style("height"));
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);
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
        .call(yAxis);

}



 	// // add crators on svg
 	// svg.selectAll(".crater")
 	// 	.data(fireballs)
 	// 	.enter().append("circle")
 	// 		.attr("class", "crater")
 	// 		.attr("r", function(d){return scale_impact(+d.Impact);})
 	// 		.attr("cx", function(d){return projection([d.Long, d.Lat])[0];})
 	// 		.attr("cy", function(d){return projection([d.Long, d.Lat])[1];});
 	
 	
//  	// get legenda data
//  	var legendaData = getLegendaData(domain);
 
//  	// build legenda and place legenda 
//  	var legenda  = svg.append("g")
//  					  .attr("transform", "translate(850, 50)")	
// 	legenda.append("rect")
// 		   .attr("height", 220)
// 		   .attr("width", 170)
// 		   .attr("class", "legrect");
// 	legenda.append("text")
// 		   .text("Total energy impact (kt)")
// 		   .attr("x", 10)
// 		   .attr("y" , 15);

// 	// add data points to legenda
// 	legenda.selectAll(".circle")
// 		.data(legendaData)
// 		.enter().append("circle")
// 		.attr("class", "circle crater")
// 		.attr("r", function(d){return scale_impact(+d);})
// 		.attr("cx", 50)
// 		.attr("cy", function(d, i){return 40 + i * 40;});

// 	legenda.selectAll(".text")
// 		.data(legendaData)
// 		.enter().append("text")
// 			.attr("class", "text")
// 			.text(function(d){return (+d).toFixed(2)})
// 			.attr("x", 70)
// 			.attr("y", function(d, i){return 44 + i * 40;});