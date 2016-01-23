// global variables
YEARS = {"2010":"2010-01-01", "2011":"2011-01-01", "2012":"2012-01-01","2013":"2013-01-01","2014":"2014-01-01","2015":"2015-01-01", "2016":"2015-06-30"};
TYPES = ["inhibitans", "gdp", "km2"];
STARTDATE = YEARS["2010"];


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
  })
})

window.onload = function() {
	// build queue to load in data
 	var q = queue(1);
 	q.defer(d3.json, "../data/refugees.json");
 	q.defer(d3.json, "../data/total.json");
 	q.defer(d3.json, "../data/colorvalues.json");
 	q.awaitAll(initiate);
}

// Draws a map with the crators in the dataset
function initiate(error, data){
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
	refugees = data[0];
	total = data[1];
	colorValues = data[2];

	var startDate = new Date(day.parse(STARTDATE));
	year = startDate.getFullYear();
	type = TYPES[0];

	drawSortedBargraph(colorValues)
}

function drawSortedBargraph(colorValues) {
	// bargraph template from http://jsfiddle.net/enigmarm/3HL4a/13/

	var dataset = []
	for (var i=0; i<colorValues.length; i++) {
		var key = colorValues[i].origin
		var value = colorValues[i][type+year]
		if (isNaN(value)) {continue}
		dataset.push({
			key: key,
			value: value
		})
	}

	w = document.getElementById('map').offsetWidth;
	h = 0.5*screen.height;
	range = 15;

	var xScale = d3.scale.ordinal()
					.domain(d3.range(range))
					.rangeRoundBands([0, w], 0.05); 

	var yScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) {return d.value;})])
					.range([0, h]);

	scaleToColor = d3.scale.linear().domain([0, 1]).range(["#f7fcfd","#084594"]);

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
	        // .attr("y", function (d) {
	        // return h - yScale(d.value) + 14;
	    // });
	};

	// Add the onclick callback to the button
	sortBars()
	d3.select("#sort").on("click", sortBars);
}

function updateBarChard(colorValues) {
	// update to new datatype without losing the order

	var dataset = []
	for (var i=0; i<colorValues.length; i++) {
		var key = colorValues[i].origin;
		var value = colorValues[i][type+year];
		if (isNaN(value)) {continue;}
		dataset.push({
			key: key,
			value: value
		})
	}

	d3.selectAll(".barrect").each(function(d) {
		for (var i=0; i<dataset.length; i++) {
			if (dataset[i]["key"] == d.key) {
				d.value = dataset[i]["value"];
				return;
			}
		}
		d.value = 0;
	})

	d3.selectAll(".bartext").each(function(d) {
		for (var i=0; i<dataset.length; i++) {
			if (dataset[i]["key"] == d.key) {
				d.value = dataset[i]["value"];
				return;
			}
		}
		d.value = 0;		
	})

	var max = 0;
	d3.selectAll(".barrect").each(function(d) {
		if (d.value > max) {max = d.value}
	});

	var yScale = d3.scale.linear()
				.domain([0, max])
				.range([0, h]);

	updateBarScale();
	d3.selectAll(".barrect").each(function(d) {
		d3.select(this).transition()
			.attr("y", function(d) {
				return h - yScale(d.value);
			})
			.attr("height", function(d) {
				return yScale(d.value);
			})
			.attr("fill", function() {
				return scaleToColor(Math.random());
			});
	});

	d3.selectAll(".bartext").each(function(d) {
		d3.select(this).transition()
			.attr("y", function (d) {
		   		var y = h - yScale(d.value) + 14;
		   		if (y > h - 5) {return h-5}
				return y;
	    	});
	})
	        
}

function updateBarScale() {
	// If the type is changes, the color of the bars will be updated
	if (type == "inhibitans") {
		var colorrange = ["#f7fcfd","#084594"];
	}
	if (type == "gdp") {
		var colorrange = ["#fee8c8", "#e34a33"];
	}
	if (type == "km2") {
		var colorrange = ["#f7fcb9", "#31a354"];
	}
	scaleToColor = d3.scale.linear().range(colorrange);
}