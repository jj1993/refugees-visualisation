window.onload = function() {

	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.json, "./data/world-50m.json");
 	q.defer(d3.json, "./data/refugees.json");
 	q.defer(d3.json, "./data/colorvalues.json");
 	q.defer(d3.json, "./data/total.json")
 	q.awaitAll(drawMap);
}
// Draws a map with the crators in the dataset
function drawMap(error, data){
	var mapData = data[0];
	var refugees = data[1];
	var colorValues = data[2];
	var total = data[3];
	
	// build svg element to hold map
	var width = document.getElementById('map').offsetWidth
	var height = 0.7*screen.height
	var svg = d3.select("#map").append("svg")
 			.attr("width", width)
 			.attr("height", height);

	// initialise projection of the map
	var projection = d3.geo.mercator()
					.scale(300)
					.translate([width / 3, height*15]);

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

 	function getCountryData(countries) {
 		var l = [];
 		var year = '2015';
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

 	var countryData = getCountryData(countries)

	// build scale for colors
	var domain = d3.extent(countryData, function(d){return d[2]})
	var scaleToColor = d3.scale.linear().domain([domain[0],15]).range(["green","red"]);

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

function getFlows(c, y) {
	return
}

function drawFlow(asylum, origin, amount) {
	return
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



// // returns the data used for the legenda
// function getLegendaData(domain){
// 	return [0.1, 1, 10, 100, domain[1]]
// }