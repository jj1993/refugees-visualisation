// =====================================================
// The play/stop button is used to make the slider move.
// When de slider moves the update function from the
// world map or the barchard is executed
// =====================================================

var buttonState = 'stop';

function buttonPlayPress() {
    // The play button is initiated
    if (buttonState=='stop') {
        // starting time
        buttonState = 'play';
        SHOWFLOWS = false;
        var button = d3.select("#button_play").classed('btn-success', false);
        button.select("i").attr('class', "fa fa-stop");
        return
    }
    // stopping time
    buttonState = 'stop';
    SHOWFLOWS = true;
    var button = d3.select("#button_play").classed('btn-success', true); 
    button.select("i").attr('class', "fa fa-play");
}

setInterval(function() {
    // this function checks 10 times per second if the slider should move
    if (buttonState=='play') {
        var xpos = $('#slider-scrub').position().left
        var newpos = xpos + 10
        if (newpos > $("#slider").width()) {
            newpos = 2*$("#slider-scrub").width()
        }
        $('#slider-scrub').css("left", newpos)
        update($('#slider-scrub').position().left)
    }
}, 100);