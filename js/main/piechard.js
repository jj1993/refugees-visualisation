function drawPie(data, svg, dim) {


	var g = svg.append("g")
				.attr("id", "piegraph")

	g.append("g")
		.attr("class", "slices");
	g.append("g")
		.attr("class", "labels");
	g.append("g")
		.attr("class", "lines");

	var width = dim[0],
	    height = dim[1],
		radius = Math.min(width, height) / 2.2;

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});

	var arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.4);

	var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	g.attr("transform", "translate(" + width * 1.3 + "," + height / 2 + ")");

	var key = function(d){ return d.data.label; };

	var keys = []
	for (var i=0; i<data[dateKey][2].length; i++) {
		keys.push(data[dateKey][2][i][2])
	}

	var color = d3.scale.ordinal().range(["#7fc97f","#beaed4", "#fdc086", "#ffff99", "#386cb0"]);

	function pieData (){
		r = [];
		for (var i=0; i<data[dateKey][2].length; i++) {
			var label = data[dateKey][2][i][2];
			var b = true
			for (var n=0; n<r.length; n++) {
				if (r[n].label == label) {
					b = false;
					break;
				}
			}
			if (b) {
				r.push({
					label: data[dateKey][2][i][2],
					value: data[dateKey][2][i][1]
				})
			}
		}
		return r
	}

	change(pieData());

	// Update pie when sliding the slider
	var olddateKey = dateKey
	var clicking = false;
	$("#slider-scrub").mousedown(function(){clicking = true;});
	$(document).mouseup(function(){
	    clicking = false;
	    if (dateKey != olddateKey) {
	    	olddateKey = dateKey;
	    	change(pieData());
	    }
	});
	$('#slider-scrub').mousemove(function(){
    	if(clicking == false) return;
	    if (dateKey != olddateKey) {
	    	olddateKey = dateKey;
	    	change(pieData());
	    }
	});

	function change(data) {

		/* ------- PIE SLICES -------*/
		var slice = svg.select(".slices").selectAll("path.slice")
			.data(pie(data), key);

		slice.enter()
			.insert("path")
			.style("fill", function(d) {return color(d.data.label); })
			.attr("class", "slice");

		slice		
			.transition().duration(1000)
			.attrTween("d", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			})

		slice.exit()
			.remove();

		/* ------- TEXT LABELS -------*/

		var text = svg.select(".labels").selectAll("text")
			.data(pie(data), key);

		text.enter()
			.append("text")
			.attr("dy", ".35em")
			.text(function(d) {
				return d.data.label;
			});
		
		function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		}

		text.transition().duration(1000)
			.attrTween("transform", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
					return "translate("+ pos +")";
				};
			})
			.styleTween("text-anchor", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					return midAngle(d2) < Math.PI ? "start":"end";
				};
			});

		text.exit()
			.remove();

		/* ------- SLICE TO TEXT POLYLINES -------*/
		$(".slices text").remove()
		svg.select(".slices").append("text")
							.text(currentDate.getFullYear())

		var polyline = svg.select(".lines").selectAll("polyline")
			.data(pie(data), key);
		
		polyline.enter()
			.append("polyline");

		polyline.transition().duration(1000)
			.attrTween("points", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
					return [arc.centroid(d2), outerArc.centroid(d2), pos];
				};			
			});
		
		polyline.exit()
			.remove();
	};
}