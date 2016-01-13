YEARS = {"2010":"2010-01-01", "2011":"2011-01-01", "2012":"2012-01-01","2013":"2013-01-01","2014":"2014-01-01","2015":"2015-01-01", "2016":"2015-06-30"};
TYPES = ["inhibitans", "gdp", "km2"];
STARTDATE = YEARS["2010"];

window.onload = function() {
	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.json, "./data/world-50m.json");
 	q.defer(d3.json, "./data/refugees.json");
 	q.defer(d3.json, "./data/colorvalues.json");
 	q.defer(d3.json, "./data/total.json");
 	q.defer(d3.json, "./data/centres.json")
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
	monthNameFormat = d3.time.format("%B");

	mapData = data[0];
	refugees = data[1];
	colorValues = data[2];
	total = data[3];
	countryCentres = data[4];

	var startDate = new Date(day.parse(STARTDATE));
	var year = startDate.getFullYear();
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

 	// data is sorted in the sequence of the countries
	var geometries = mapData.objects.countries.geometries;
	var idArr = [];
	for (var i=0; i<geometries.length; i++) {
		idArr.push(geometries[i].id);
	}
	countryData = getCountryData(idArr);
	console.log(countryData)
	// draw all landmaps one by one, id's are added
 	svg.selectAll(".country")
 			.data(topojson.feature(mapData, mapData.objects.countries).features).enter()
 		.append("path")
 			.attr("class", "country")
 			.attr("id", function(d){return d.id})
 			.attr("d", path);

 	// the data-to-visualise is bound to the countries
 	svg.selectAll(".country").data(countryData)
 	svg.selectAll(".country").on("click", function(d) {var pos = d3.mouse(this); drawLines(d, pos)});
	countryDict = {}
 	svg.selectAll(".country").each(function(d) {countryDict[this.id] = d});

 	console.log(countryDict)

	// textblocks on the location of countries are initiated
	// and bound to data-to-visualise
 	svg.selectAll(".totalAsylum")
 			.data(countryData).enter()
 		.append("text")
 			.attr("class","totalAsylum")
 			.attr("text-anchor", "middle")
 			.attr("x", function(d, i) {return d[year][4][0]})
 			.attr("y", function(d, i) {return d[year][4][1]});

	d3.select("#monthyear").text(monthNameFormat(startDate) + " " + year);
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
	// for (var m = 0; m < countryCentres.length; m++) {
	// 	var d = countryCentres[m];
	// 	if (d.callingCodes[0] == c.toString()) {
	// 		return path(d.latlng)
	// 	}
	// }
	// return path([-2,30])
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

	for (var n=0; n<data.length; n++) {
		var d = data[n]
		var thisd = countryDict[d[0]];
		var from = thisd[year][4];
		var to = pos;
		var q = d[1];
		svg.append("line")
			.attr("class", "line")
			.attr("x1", from[0])
			.attr("y1", from[1])
			.attr("x2", to[0])
			.attr("y2", to[1])
			.attr("stroke-width", 2)
			.attr("stroke", "black");
	}
}

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