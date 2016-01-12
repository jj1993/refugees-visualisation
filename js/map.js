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

	var startDate = new Date(day.parse(STARTDATE));
	var year = startDate.getFullYear();
	type = TYPES[1];

 	// data is sorted in the sequence of the countries
	var geometries = mapData.objects.countries.geometries;
	var idArr = [];
	for (var i=0; i<geometries.length; i++) {
		idArr.push(geometries[i].id);
	}
	countryData = getCountryData(idArr);

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
	countryDict = {}
 	svg.selectAll(".country")
 			.data(topojson.feature(mapData, mapData.objects.countries).features).enter()
 		.append("path")
 			.attr("class", "country")
 			.attr("id", function(d){countryDict[d.id] = this; return d.id})
 			.attr("d", path);

 	// the data-to-visualise is bound to the countries
 	svg.selectAll(".country").data(countryData).on("click", function(d) {var pos = d3.mouse(this); drawLines(d, pos)});

	// textblocks on the location of countries are initiated
	// and bound to data-to-visualise
 	var centres = [];
 	svg.selectAll(".country").each(function(d) {
 		centres.push(getCentre(this));
 	});
 	svg.selectAll(".totalAsylum")
 			.data(countryData).enter()
 		.append("text")
 			.attr("class","totalAsylum")
 			.attr("text-anchor", "middle")
 			.attr("x", function(d, i) {return centres[i][0]})
 			.attr("y", function(d, i) {return centres[i][1]});

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
	var scaleToColor = d3.scale.linear().domain([domain[0], middle, domain[1]]).range(["#91bfdb","#ffffbf","#fc8d59"]);

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

function getCentre(country) {
	var bbox = country.getBBox();
	return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
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
				var type = TYPES[l]
				t[type] = Math.cbrt(e[type+y]);
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

function getCountryData(idArr) {
	var a = [];

	var yearL = Object.keys(YEARS);
	for (var n = 0; n < idArr.length; n++) {
		var d = {};
		var code = idArr[n];
		for (var i = 0; i < yearL.length; i++) {
			var year = yearL[i];
			var totalAsylum = getTotal(code, year);
			var colorValues = getColor(code, year);
			var refugeeFlows = getRefugeeFlows(code, year);
			d[year] = [totalAsylum, colorValues, refugeeFlows];
		}
		a.push(d)
	}
	return a
}

function drawLines(d, pos) {
	var data = d[year][2];
	for (var n=0; n<data.length; n++) {
		var line = data[n]
		var from = getCentre(countryDict[line[0]]);
		var to = pos;
		var q = line[1];
		console.log(from, to, q);
	}
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