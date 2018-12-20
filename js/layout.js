//(function(){

// Config
var animate = false;

// Hidden options
//var hidden = false;

// Globals
var animatingHeader = false;

$(document).ready(function() {
    if (animate) {
        $(document).mousemove(function(event) {
            if (event.pageY < 15 && !animatingHeader) {
                animatingHeader = true;
                showHeader();
            }else if(event.pageY > 100 && !animatingHeader){
                animatingHeader = false;
                hideHeader();
            }
        });
        $("#header").mouseleave(function(event) {
            hideHeader();
        });

        setTimeout(function() {
            hideHeader();
        }, 1500);
    }

    setTimeout(function() {
        $("#flashMessage").animate({top: -40});
    }, 3500);

    //$("#header").show();

});

/**
 * If this function is called, header will be
 * animated. Otherwise, header will be static.
 */
var animateHeader = function() {
    animate = true; // override config. Animate this page!
    $(function(){
        $('#header').addClass('animated');
    });
};

function hideHeader() {
    $("#header").stop(true).animate({top: -$('#header').height()-20}, 180, function() {
        animatingHeader = false;
    });
}

function showHeader() {
    $("#header").stop(true).animate({top: 0}, 180, function() {
        animatingHeader = false;
    });
}

function showFlashMessage(message) {
    $("#flashMessageWrapper").html(message);
    $("#flashMessage").animate({top: -6});
    setTimeout(function() {
        $("#flashMessage").animate({top: -$('#flashMessage').height()-15});
    }, 3500);
}

/**************************************/
/** Generic Ajax error              ***/
/**************************************/
var onAjaxError = function(err) {
    console.log('Ha ocurrido un error inesperado ##');
    console.log(err);
};

/**************************************/
/** Ajax Save                        **/
/**************************************/

/**
 * Callback on successful attempt to save.
 * If any validation errors were found, they
 * will be listed in r[validation].
 * 
 * If saving was successful and this order is
 * brand new, r[redirect] will be set to this
 * new order's URL, and redirection must be 
 * made.
 * 
 * @param result data
 */
var onSubmitSuccess = function(r) {
    var flash = r.flash;
    $('input.invalid, select.invalid, textarea.invalid, .dropdown.invalid').removeClass('invalid');
    if (!r.success) {
        flash = r.flash + processValidationErrors(r.validation);
    } else {
        if (r.redirect !== undefined) {
            // this line will redirect to the new order's main page
            var url = (BASE_URL + r.redirect).replace("//", "/");
            window.location.href = url;
        }
    }
    showFlashMessage(flash);
};

/**
 * Processes validation errors in flat format
 * (using Set::flatten() en CakePHP).
 * 
 * Error format is:
 *  { fieldName.index : [error1, error2], 
 *      model.index.fieldname.index : [err1, err2], ... }
 *  
 * This function shows error messages in the flash
 * div & also highlights the invalid field(s).
 * 
 * @param {type} validation
 * @returns {String}
 */
var processValidationErrors = function(validation) {
    var messages = validation.flat;
    var errorFlash = "<br/>";
    for (var errorField in messages) {
        errorFlash += messages[errorField] + '<br/>';
        highlightInvalidField(errorField);
    }
    return errorFlash;
};

/**
 * Highlight a given invalid field in the format:
 * 
 *  fieldName.index , or
 *  model.index.fieldname.index
 * 
 * @param {type} flatFieldName
 * @returns {undefined}
 */
var highlightInvalidField = function(flatFieldName) {
    var parts = flatFieldName.split('.');
    parts.pop(); // remove last
    var name = '';
    for (var i in parts) {
        name += '['+ parts[i] +']';
    }
    highlightFieldEndingWith(name);
};

/**
 * Highlights an input, select or textarea field
 * that ends in with the given name.
 * 
 * @param {type} nameEnd
 * @returns {undefined}
 */
var highlightFieldEndingWith = function(nameEnd) {
    $('input[name$="' + nameEnd + '"], select[name$="' + nameEnd + '"], \n\
         textarea[name$="' + nameEnd + '"]')
            .addClass('invalid')
            .parent('.dropdown')
            .addClass('invalid');
};

//}());