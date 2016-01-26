// ====================================================================
//
// Author: Jonathan Jeroen Beekman
// Student nr: 10345019
// Description: javascript file for the bar chard-visualisation
// 
// =====================================================================

// Important global variables are defined
YEARS = {
	"2010":"2010-01-01", "2011":"2011-01-01", "2012":"2012-01-01",
	"2013":"2013-01-01","2014":"2014-01-01","2015":"2015-01-01", 
	"2016":"2015-06-30"
};
TYPES = ["inhibitans", "gdp", "km2"];
STARTKEY = "2010";

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
  $('#inhibitants').bind("click", function () { 
  	type = TYPES[0];
  	update($('#slider-scrub').position().left);
  	updateBarChard(colorValues);
  	});
  $('#gdp').bind("click", function () { 
  	type = TYPES[1];
  	update($('#slider-scrub').position().left);
  	updateBarChard(colorValues);
  });
  $('#km2').bind("click", function () { 
  	type = TYPES[2];
  	update($('#slider-scrub').position().left);
  	updateBarChard(colorValues);
  });
  $('#index').bind("click", function() {
  	window.location = "index.html";
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
	    clicking = false;
	    update($('#slider-scrub').position().left);
	});

	$('#slider-scrub').mousemove(function(){
    	if(clicking == false) return;
	    update($('#slider-scrub').position().left);
	});
});

// ========================================
// 			JSON files are loaded
// 			Barchard is initiated
// ========================================

window.onload = function() {
	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.json, "../data/colorvalues.json");
 	q.awaitAll(initiate);
}

function initiate(error, data){
	// Build scale for slider
	var sliderDot = d3.select("#slider-scrub").node().getBoundingClientRect();
	var sliderBar = d3.select("#slider").node().getBoundingClientRect();
	var sliderDomain = [sliderDot.width, sliderBar.width+sliderDot.width];
	dateFormat = d3.time.format("%Y-%m-%d");
	var dateRange = [dateFormat.parse(YEARS["2010"]), 
					 dateFormat.parse(YEARS["2016"])];
	scaleToDate = d3.scale.linear().domain(sliderDomain).range(dateRange);

	// the starting date and datatype are defined
	dateKey = STARTKEY;
	type = TYPES[0];
	oldType = type;

	colorValues = data[0];
	drawSortedBarchard(colorValues);

	// display current date
	var date = new Date(dateFormat.parse(YEARS[dateKey]));
	var monthNameFormat = d3.time.format("%B");
	d3.select("#monthyear").text(
		monthNameFormat(date) + " " + date.getFullYear()
	);
}

function drawSortedBarchard(colorValues) {
	// bargraph template from http://jsfiddle.net/enigmarm/3HL4a/13/

	// data is put into format of template
	var dataset = []
	for (var i=0; i<colorValues.length; i++) {
		var key = colorValues[i].origin
		var value = colorValues[i][type+dateKey]
		if (isNaN(value)) {continue}
		dataset.push({
			key: key,
			value: value
		})
	}

	// starting variables are declared
	w = document.getElementById('map').offsetWidth;
	h = 0.5*screen.height;
	range = 15;

	var xScale = d3.scale.ordinal()
					.domain(d3.range(range))
					.rangeRoundBands([0, w], 0.05); 
	var yScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) {return d.value;})])
					.range([0, h]);
	var scaleToColor = defineColorScale();

	var key = function(d) {
		return d.key;
	};

	//Create SVG element
	svg = d3.select("#map")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	//Create bars
	svg.selectAll("rect")
	   .data(dataset, key)
	   .enter()
	   .append("rect")
	   .attr("class", "barrect")
	   .attr("x", function(d, i) {
	   		var x = xScale(i);
	   		if (isNaN(x)) {
	   			return w
	   		}
			return x;
	   		})
	   .attr("y", function(d) {
			return h - yScale(d.value);
	   })
	   .attr("width", xScale.rangeBand())
	   .attr("height", function(d) {
			return yScale(d.value);
	   })
	   .attr("fill", function() {
	   		// the fill is a random color, in exactly the same range as
	   		// the viewer used for the data types in the worldmap.
			return scaleToColor(Math.random());
	   })

	//Create labels
	svg.selectAll("text")
	   .data(dataset, key)
	   .enter()
	   .append("text")
	   .text(function(d) {
			return d.key;
	   })
	   .attr("class", "bartext")
	   .attr("text-anchor", "middle")
	   .attr("x", function(i) {	   		
	   		var x = xScale(i) + xScale.rangeBand() / 2;
	   		if (isNaN(x)) {
	   			return w*2
	   		}
			return x;
	   })
	   .attr("y", function(d) {
	   		var y = h - yScale(d.value) + 14;
	   		if (y > h - 5) {return h-5}
			return y;
	   })
	   .attr("font-family", "sans-serif") 
	   .attr("font-size", "11px")
	   .attr("fill", "white");
	   
	sortBars = function () {
	    
	    sortItems = function (a, b) {
	        return b.value - a.value;
	    };

	    svg.selectAll("rect")
	        .sort(sortItems)
	        .transition()
	        .delay(function (d, i) {
	        return i * 25;
	    })
	        .duration(400)
	        .style("visibility", "visible")
	        .attr("x", function (d, i) {
	        	var x = xScale(i);
	        	if (isNaN(x)) {
		   			d3.select(this)
		   				.style("visibility", "hidden");
		   			return w
		   		}
		        return xScale(i);
		    });

	    svg.selectAll('text')
	        .sort(sortItems)
	        .transition()
	        .delay(function (d, i) {
		        return i * 50;
		    })
	        .duration(1000)
	        .text(function (d) {
		        return d.key;
		    })
	        .style("visibility", "visible")
	        .attr("text-anchor", "middle")
	        .attr("x", function (d, i) {	   		
		   		var x = xScale(i) + xScale.rangeBand() / 2;
		   		if (isNaN(x)) {
		   			d3.select(this).attr("style", "visibility: hidden");
		   			return w*2
		   		}
				return x;
		    })
	};

	// Add the onclick callback to the button
	sortBars();
	d3.select("#sort").on("click", sortBars);
}

function updateBarChard(colorValues) {
	// update to new datatype without losing the order. This function is not 
	// part of the used template

	// new data is put in correct format
	var max = 0
	var dataset = []
	for (var i=0; i<colorValues.length; i++) {
		var key = colorValues[i].origin;
		var value = colorValues[i][type+dateKey];
		if (value > max) {max = value}
		if (isNaN(value)) {continue;}
		dataset.push({
			key: key,
			value: value
		})
	}
	// the scales are defined
	var yScale = d3.scale.linear()
				.domain([0, max])
				.range([0, h]);

	// since different countries have data available each year, it is nessisary
	// to manually bind each data object to the correct country.
	function getValue(key) {
		for (var i=0; i<dataset.length; i++) {
			if (dataset[i]["key"] == key) {
				return dataset[i]["value"];
			}
		}
		return 0;
	}
	d3.selectAll(".barrect").each(function(d) {
		d.value = getValue(d.key)
		d3.select(this).transition()
			.attr("y", function(d) {
				return h - yScale(d.value);
			})
			.attr("height", function(d) {
				return yScale(d.value);
			});
		});

	// update colors
	if (type != oldType) {
		var scaleToColor = defineColorScale();
		oldType = type;
		d3.selectAll(".barrect").each(function() {
			d3.select(this).transition()
				.attr("fill", function() {
					return scaleToColor(Math.random());	
				});
		});
	}

	d3.selectAll(".bartext").each(function(d) {
		d.value = getValue(d.key)	
		d3.select(this).transition()
			.attr("y", function (d) {
		   		var y = h - yScale(d.value) + 14;
		   		if (y > h - 5) {return h-5}
				return y;
	    	})
	});
}

function defineColorScale() {
	// If the type is changes, the color of the bars will be updated
	// For continuity the colors are exactly the same for the data types
	// as for the worldmap.

	if (type == "inhibitans") {
		var colorrange = ["#f7fcfd","#084594"];
	}
	if (type == "gdp") {
		var colorrange = ["#fee8c8", "#e34a33"];
	}
	if (type == "km2") {
		var colorrange = ["#f7fcb9", "#31a354"];
	}
	return d3.scale.linear().range(colorrange);
}

function update(n) {
	var oldKey = dateKey
	var monthNameFormat = d3.time.format("%B");
	var date = new Date(scaleToDate(n));
	dateKey = selectDateKey(date);

	d3.select("#monthyear").text(
		monthNameFormat(date) + " " + date.getFullYear()
		);
	if (oldKey != dateKey) {
		oldKey = dateKey;
		updateBarChard(colorValues);
	}
}

function selectDateKey(date) {
	// The correct date for data-to-visualise is selected
	var keys = Object.keys(YEARS)
	for (var k=0; k<keys.length; k++) {
		var d = dateFormat.parse(YEARS[keys[k]]);
		if (d < date) {
			var prevDate = d;
			continue
		}
		var ave = (prevDate.getTime() + d.getTime()) / 2
		if (date.getTime() < ave) {
			return keys[k-1];
		}
		return keys[k];
	}
}