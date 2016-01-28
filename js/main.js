// ====================================================================
//
// Author: Jonathan Jeroen Beekman
// Student nr: 10345019
// Description: 
// 		Main javascript file for the worldmap-
// 		visualisation. For readability the file
// 		refers to functions in the files (found in /main folder):
// 		- data.js (handles the jsons)
// 		- migration-flows.js (handes the lines drawn when clicking on countries)
// 		- update.js (handes the events on clicking and sliding the slider)
// 		- popup-graph.js (handes the popup windows when clicking on countries)
// 		- linechard.js (handles the line chard in the popup-window)
// 		- piechard.js (handes the pie chard in the extended popup-window)
// 
// =====================================================================


// Important global variables are defined
YEARS = {
	"20100":"2010-01-01", "20110":"2011-01-01", "20120":"2012-01-01",
	"20130":"2013-01-01","20140":"2014-01-01","20150":"2015-01-01", 
	"20155":"2015-06-30"
};
TYPES = ["inhibitans", "gdp", "km2"];
STARTDATE = YEARS["20100"];
SHOWGRAPH = true;
SHOWFLOWS = true;

// ==========================================
//		   Custom jQuery functions
// ==========================================

jQuery(document).ready(function($) {
  "use strict";
  $('#main-nav').onePageNav({
    currentClass: 'active',
    scrollOffset: 69,
  });  
});

jQuery(window).bind('scroll', function (){
  if (jQuery(window).scrollTop() > 700){
    jQuery('#main-nav').addClass('navbar-fixed-top');
  } else {
    jQuery('#main-nav').removeClass('navbar-fixed-top');
  }
});

$(document).ready(function(){
  // The menu-bar events are defined
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
  $('#barchard').bind("click", function() {
  	window.location = "barchard.html";
  	return false;	
  });
  $('#bartab').bind("click", function() {
  	window.location = "barchard.html";
  	return false;	
  });
  $('#UNHCR').bind("click", function() {
  	window.location = "http://www.unhcr.org/statistics/";
  	return false;	
  });
})

jQuery(document).ready(function($) {
	// The date-slider bar is initiated and events are bound
	$("#slider-scrub").draggable({
		axis: "x", 
		containment: "parent",
		width: 0.7*screen.width
	});

	var clicking = false;
	$("#slider-scrub").mousedown(function(){
	    clicking = true;
	});

	$(document).mouseup(function(){
		if(clicking == false) return;
	    clicking = false;
	    update($('#slider-scrub').position().left);
	});

	$('#slider-scrub').mousemove(function(){
    	if(clicking == false) return;
	    update($('#slider-scrub').position().left);
	});
});

$('#check').on('change', 'input[type=checkbox]', function(e) {   
	// keeping track on the checkboxes
    if (this.name == "flow") {
    	if (this.checked) {svg.selectAll(".line").remove(); SHOWFLOWS = false;}
    	else {SHOWFLOWS = true}
    }
    if (this.name == "graph") {
    	if (this.checked) {d3.select(".graph").remove(); SHOWGRAPH = false;}
    	else {SHOWGRAPH = true}
    }
    else {console.log(this.name+' '+this.value+' '+this.checked);}
});

// ========================================
// 			JSON files are loaded
// 			Worldmap is initiated
// ========================================

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

// draws a worldmap with the data
function initiateMap(error, data){
	$("#map").empty()

	// Build scale for slider
	var sliderDot = d3.select("#slider-scrub").node().getBoundingClientRect();
	var sliderBar = d3.select("#slider").node().getBoundingClientRect();
	var sliderDomain = [sliderDot.width, sliderBar.width+sliderDot.width];
	dateFormat = d3.time.format("%Y-%m-%d");
	var dateRange = [dateFormat.parse(YEARS["20100"]), 
					 dateFormat.parse(YEARS["20155"])];
	scaleToDate = d3.scale.linear().domain(sliderDomain).range(dateRange);

	// starting variables are defined
	mapData = data[0];
	refugees = data[1];
	total = data[2];
	colorValues = data[3];
	countryCentres = data[4];
	iso = data[5];

	// the starting date and datatype are defined
	currentDate = new Date(dateFormat.parse(STARTDATE));
	dateKey = currentDate.getFullYear().toString() 
			+ currentDate.getMonth().toString();
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

	// draw all landmaps one by one, id's are added
 	svg.selectAll(".country")
 			.data(topojson.feature(mapData, mapData.objects.countries).features)
 			.enter()
 		.append("path")
 			.attr("class", "country")
 			.attr("id", function(d){return d.id})
 			.attr("d", path)

 	// data is sorted in the sequence of the countries, this way all data can
 	// easily be bound to the countries. the path-objects of the countries
 	// can be found by id (countryDict)
	countryDict = {}
	var geometries = mapData.objects.countries.geometries;
	idArr = [];
 	svg.selectAll(".country").each(function(d) {countryDict[this.id] = this});
	for (var i=0; i<geometries.length; i++) {
		idArr.push(geometries[i].id);
	}
	countryData = getCountryData(idArr);

 	// the data-to-visualise is bound to the countries 
 	// !!! Attention: Countrydict is overwritten, now contains data !!!
 	svg.selectAll(".country").data(countryData)
 		.each(function(d) {countryDict[this.id] = d});

 	// the implementation of the migration-flow-lines and floating country
 	// names is bound to the countries
 	svg.selectAll(".country")
 		.on("click", function(d) {
	 		var pos = d3.mouse(this); 
	 		$(".graph").remove();
	 		$(".country").css("stroke-width", "1px")
	 		$(".country").css("stroke","black");
	 		$(this).css("stroke-width","3px");
	 		$(this).css("stroke","red");
	 		if (SHOWFLOWS) {drawLines(d, pos);}
	 		if (SHOWGRAPH) {drawInfo(d, pos);}
 		})
 		.on("mouseenter", function(d) {
 			var pos = d3.mouse(this);
			svg.append("text")
 				.text(d[dateKey][3])
 				.attr("x", pos[0])
 				.attr("y", pos[1])
 				.attr("id", "countryName");
 			var code = d[dateKey][5]
 			if (SHOWFLOWS) {highLight(code)}
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
 			var code = d[dateKey][5]
 			if (SHOWFLOWS) {lowLight(code)}
 		});

 	// the date in the top of the visualisation is initiated
 	var monthNameFormat = d3.time.format("%B");
	d3.select("#monthyear").text(
		monthNameFormat(currentDate) + " " + currentDate.getFullYear()
		);

	// the mapinfo is drawn and the legend is initiated
	drawMap();
	legenda();
}

function drawMap() {
	// fill all countries with color dependent on data
	var domain = d3.extent(countryData, function(d){
		try {return Math.log(d[dateKey][1][type])}
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
		try {var fill = scaleToColor(Math.log(d[dateKey][1][type]))}
		catch (err) {fill = undefined};
		d3.select(this).attr("style", "fill: " + fill);
	});
}


function legenda() {
	// The legenda is drawn
	scaleToFlow = d3.scale.linear().domain(
		[0, Math.sqrt(200000)]).range([0, 10]
		);
	var values = [50000, 250000, 800000];
	updateLegenda();
	for (var i=0; i<3; i++) {
		$("#legvalue"+(i+3)).empty().append("<p>"+values[i]+"</p>");
		var q = scaleToFlow(Math.sqrt(values[i]));
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