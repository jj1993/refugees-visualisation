jQuery(document).ready(function($) {
	"use strict";

	$("#slider-scrub").draggable({axis: "x", containment: "parent"})

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


// // output the value
// TweenMax.to(this, 1, {alpha:1, onUpdate:update, repeat:-1});
// function update() {
//   $('#xpos').val( $('.slider-scrub').position().left + 'px' );
//   $('#percentage').val( Math.round( $('.slider-scrub').position().left*1000 / 2720 ) + '%' );
// }