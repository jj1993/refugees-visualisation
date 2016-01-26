// =====================================================
// All slider events will change the 'currentDate'
// The visualisations and data is updated respectively
// in this file
// =====================================================


function selectDate(date) {
	// The correct date for data-to-visualise is selected
	var keys = Object.keys(YEARS)
	for (var k=0; k<keys.length; k++) {
		var d = dateFormat.parse(YEARS[keys[k]]);
		if (d < date) {
			var prevDate = d;
			continue
		}
		var ave = (prevDate.getTime() + d.getTime()) / 2
		if (date.getTime() < ave) return prevDate;
		return d
	}
}

function update(n) {
	// The visualisations are updated to current date
	svg.selectAll(".line").remove()

	var date = new Date(scaleToDate(n));
	currentDate = selectDate(date)

	var monthNameFormat = d3.time.format("%B");
	dateKey = currentDate.getFullYear().toString()
			+ currentDate.getMonth().toString();
	d3.select("#monthyear").text(
		monthNameFormat(currentDate) + " " + currentDate.getFullYear()
		);
	
	try{
		d3.select("#graphTimeLine")
			.attr("x1", x(new Date(dateFormat.parse(YEARS[dateKey]))))
			.attr("x2", x(new Date(dateFormat.parse(YEARS[dateKey]))))
	}
	catch (err) {}

	drawMap();
	updateLegenda();
	drawRanks();
}

function updateLegenda() {
	// legenda values are collected and updated
	typeText = {
		"inhibitans": "Refugees per 1000 inhibitans",
		"gdp": "Refugees per GDP",
		"km2": "Refugees per 1000 km²",
		"inhibitansrank": "Worldrank",
		"gdprank": "Worldrank",
		"km2rank": "Worldrank"
	}
	var values = d3.extent(countryData, function(d){
		try{return d[dateKey][1][type]}
		catch (err) {return};
		});
	values.splice(1, 0, values[0]+values[1]/2.0);

	// legenda is updated
	$("#type").empty().append("<p>"+typeText[type]+"</p>")
	for (var i=0; i<3; i++) {
		$("#legvalue"+i).empty().append(
			"<p>"+parseFloat(values[i]).toFixed(2)+"</p>"
			);
		d3.select("#legrect"+i).attr("style","fill:"+scaleToColor(values[i]))
	}	
}
