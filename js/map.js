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
	var range = [day.parse("2010-01-01"), day.parse("2015-06-30")];
	scaleToDate = d3.scale.linear().domain(domain).range(range);
	monthNameFormat = d3.time.format("%B");

	mapData = data[0];
	refugees = data[1];
	colorValues = data[2];
	total = data[3];

	
	// build svg element to hold map
	var width = document.getElementById('map').offsetWidth
	var height = 0.7*screen.height
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

	// draw all landmaps one by one
 	countries = svg.selectAll(".country")
 			.data(topojson.feature(mapData, mapData.objects.countries).features).enter()
 		.append("path")
 			.attr("class", "country")
 			.attr("id", function(d){return d.id})
 			.attr("d", path)[0];

	var date = new Date(scaleToDate(35));
	var year = date.getFullYear();
	d3.select("#monthyear").text(monthNameFormat(date) + " " + year);
	var countryData = getCountryData(countries, year);
	drawMap(year, countryData);
}

function drawMap(year, countryData) {
	// build scale for colors
	var domain = d3.extent(countryData, function(d){return d[2]})
	var scaleToColor = d3.scale.linear().domain([domain[0],15]).range(["#deebf7","#3182bd"]);

 	var asylumText = svg.selectAll(".totalAsylum")
				 			.data(countryData).enter()
				 		.append("text")
				 			.attr("class","totalAsylum")
				 			.attr("text-anchor", "middle")
				 			.attr("x", function(d) {return d[0][0]})
				 			.attr("y", function(d) {return d[0][1]})
							.text(function(d) {return d[1]});

	svg.selectAll(".country").each(function(d, i) {
		d3.select(this).attr("style", "fill: "+scaleToColor(countryData[i][2]));
	})
}

function update(n) {
	var date = new Date(scaleToDate(n));
	d3.select("#monthyear").text(monthNameFormat(date) + " " + date.getFullYear());
	var year = date.getFullYear();
	var countryData = getCountryData(countries, year);
	svg.selectAll(".totalAsylum").remove();
	drawMap(year, countryData);
}

function getCentre(country) {
	var bbox = country.getBBox();
	return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

function getTotal(c, y) {
	for (n = 0; n < total.length; n++) {
			e = total[n];
		if (c == e.codeAsylum && e[y] != undefined) {
			return e[y];
		}
	}
	return undefined;
}

function getColor(c, y, t) {
	for (n = 0; n < colorValues.length; n++) {
		e = colorValues[n]
		if (c == e.codeOrigin && e[t+y] != undefined) {
			return e[t+y];
		}
	}
	return undefined;
}

function getCountryData(countries, year) {
	var l = [];
	colorType = 'inhibitans';

	for (i = 0; i < countries.length; i++) {
		country = countries[i];
		code = country.id;
		centre = getCentre(country);
		totalAsylum = getTotal(code, year);
		colorValue = getColor(code, year, colorType);
		l.push([centre, totalAsylum, colorValue]);
	}
	return l
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