/* use this to test out your function */
window.onload = function() {

	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.csv, "data.csv");
 	q.defer(d3.json, "data/world-50m.json");
 	q.awaitAll(drawMap);
}
// Draws a map with the crators in the dataset
function drawMap(error, data){
	var fireballs = data[0];
	var mapData = data[1];
	
	// build svg element to hold map
	var width = 0.7*screen.width
	var height = 0.6*screen.height
	var svg = d3.select("body").append("svg")
 			.attr("width", width)
 			.attr("height", height)

	// initialise projection of the map
	var projection = d3.geo.mercator()
					.scale(500)
					.translate([width / 3, height*1.5]);
	
	// initialise path builder
	var path = d3.geo.path()
				.projection(projection);

	// draw all landmaps one by one
 	svg.selectAll(".land")
 		.data(topojson.feature(mapData, mapData.objects.countries).features)
 		.enter().append("path")
 			.attr("class", function(d){ return "land " + d.id;})
 			.attr("d", path)
 	
 	// // build scale for crators
 	// var domain = d3.extent(fireballs, function(d){return +d.Impact})
 	// var scale_impact = d3.scale.log()
 	// 					.range([1,7])
 	// 					.domain(domain);
 	
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
}

// // returns the data used for the legenda
// function getLegendaData(domain){
// 	return [0.1, 1, 10, 100, domain[1]]
// }