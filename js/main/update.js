jQuery(document).ready(function($) {
	"use strict";

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
	    clicking = false;
	    update($('#slider-scrub').position().left);
	});

	$('#slider-scrub').mousemove(function(){
    	if(clicking == false) return;
	    update($('#slider-scrub').position().left);
	});
});

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

function updateLegenda() {
	// legenda values are collected
	typeText = {
		"inhibitans": "Refugees per 1000 inhibitans",
		"gdp": "Refugees per GDP",
		"km2": "Refugees per 1000 km²"
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