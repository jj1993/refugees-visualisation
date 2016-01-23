function getCountryData(idArr) {
	// All data per country is combined to a list of dicts
	var a = [];

	var yearL = Object.keys(YEARS);
	for (var n = 0; n < idArr.length; n++) {
		var d = {};
		var code = idArr[n];
		var name = getName(code);
		var centre = getCentre(code);
		for (var i = 0; i < yearL.length; i++) {
			var year = yearL[i];
			var totalAsylum = getTotal(code, year);
			var colorValues = getColor(code, year);
			var refugeeFlows = getRefugeeFlows(code, year);
			d[year] = [totalAsylum, colorValues, refugeeFlows, name, centre, code];
		}
		a.push(d);
	}
	return a
}

function getTotal(c, y) {
	// The total number of refugees per country is returned
	for (var m = 0; m < total.length; m++) {
		var e = total[m];
		if (c == e.codeAsylum && e[y] != undefined) {
			return e[y];
		}
	}
	return undefined;
}

function getColor(c, y) {
	// The relative values that will be scaled to the colors
	// on the map are returned
	for (var m = 0; m < colorValues.length; m++) {
		var e = colorValues[m]
		if (c == e.codeOrigin) {
			var t = {}
			for (var l = 0; l < TYPES.length; l++) {
				var thistype = TYPES[l]
				if (typeof e[thistype+y] == "number") {
					t[thistype] = Math.log(e[thistype+y]+1);
					t[thistype+"rank"] = e[thistype+"rank"+y];
				}
				else {
					t[thistype] = undefined;
					t[thistype+"rank"] = undefined
				}
			}
			return t
		}
	}
}

function getRefugeeFlows(c, y) {
	// The major flows to every country are returned
	var t = []
	for (var m = 0; m < refugees.length; m++) {
		var e = refugees[m];
		if (c == e.codeAsylum) {
			var q = e[y]
			if (q == undefined) {break}
			try {
				var rep = e["rep"];
			}
			catch (err) {
				var rep = 0;
			}
		t.push([e.codeOrigin, q, e.origin])
		}
	}
	return t
}

function getName(c) {
	// The name of every country is returned
	for (var m = 0; m < iso.length; m++) {
		var e = iso[m];
		if (e[0] == c) {
			return e[1]
		}
	}
	return "Onbekend"
}

function getCentre(c) {
	// The bbox centre of every country is returned
	var thispath = countryDict[c]
	var bbox = thispath.getBBox();
	return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
	// for (var m = 0; m < countryCentres.length; m++) {
	// 	var d = countryCentres[m];
	// 	if (d.callingCodes[0] == c.toString()) {
	// 		return projection(d.latlng)
	// 	}
	// }
	// return projection([-2,30])
}

function reformatData(d) {
	// reformats data for use in the linegraph

	var keys = Object.keys(d)
	var rawData = []
	for (var i=0; i<keys.length; i++) {
		var l = {}
		var datum = new Date(day.parse(YEARS[keys[i]]))
		var fdata = d[keys[i]][2]
		for (var m=0; m<fdata.length; m++) {
			var origin = fdata[m][2]
			l[origin] = fdata[m][1]
		}
		l.date = datum
		l.Total = d[keys[i]][0]
		rawData.push(l)
	}

	var data = []
	for (var i=0; i<rawData.length; i++) {
		var keys = Object.keys(rawData[i])
		for (var k=0; k<keys.length; k++) {
			var key = keys[k]
			var q = rawData[i][key]
			if (key != "date") {
				data = parseData(rawData[i], data, key, q)
			}
		}
	}
	return data
}

function parseData(raw, d, k, q) {
	// Subfunction of sortData
	for (var n=0; n<d.length; n++) {
		if (d[n].name == k) {
			d[n].values.push([raw.date, q])
			return d
		}
	}
	d.push({
		name: k,
		values: [[raw.date, q]]
	})
	return d
}