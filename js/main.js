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
  $('#inhibitans').bind("click", function () { 
  	type = TYPES[0];
  	update($('#slider-scrub').position().left); 
  	});
  $('#gdp').bind("click", function () { 
  	type = TYPES[1];
  	update($('#slider-scrub').position().left); 
  });
  $('#km2').bind("click", function () { 
  	type = TYPES[2];
  	update($('#slider-scrub').position().left);
  });
  $('#worldgraph').bind("click", function() {
  	window.location = "barchard.html";
  	return false;	
  })
})

$('#check').on('change', 'input[type=checkbox]', function(e) {   
	// keeping track on the checkboxes
    if (this.name == "flow") {
    	if (this.checked) {svg.selectAll(".line").remove(); showFlows = false;}
    	else {showFlows = true}
    }
    if (this.name == "graph") {
    	if (this.checked) {d3.select(".graph").remove(); showGraph = false;}
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
	type = TYPES[0];

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
	 		$(this).css("stroke", "red");
	 		$(this).css("stroke-width", "3px");//.style("stroke", "red");
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
	if (type == "inhibitans") {
		var colorrange = ["#f7fcfd","#084594"];
	}
	if (type == "gdp") {
		var colorrange = ["#fee8c8", "#e34a33"];
	}
	if (type == "km2") {
		var colorrange = ["#f7fcb9", "#31a354"]
	}
	scaleToColor = d3.scale.linear().domain(domain).range(colorrange);

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
			catch (err) {return "Unknown"};
		})
	})
}