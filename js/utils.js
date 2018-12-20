/* 
 * This JS file contains utility functions
 */


/**
 * Updates a select form item with options retrieved
 * from a controller action.
 * 
 * Internally, this function executes an ajax call
 * invoking the given controller action (and passing
 * *params* in the URL). Result must be in the format
 *  
 *  {value: text, value: text, ...}
 *  
 * It then load the <option> elements inside the 
 * select form element that matches the given *selector*
 * 
 * @param string controller
 * @param string action
 * @param string select item selector
 * @returns {String}
 */
var updateSelectFromController = function(controller, action, params, selector) {
    $.ajax({
        url: BASE_URL + controller + '/' + action + (params ? '/' + params : ''),
        dataType: 'json',
        success: function(jsonData) {
            $(selector).empty().html(optionsFromObject(jsonData));  
        },
        error: onAjaxError
    });
};

/**
 * Generates <options> to use in a <select>
 * HTML item from a given object.
 * 
 * @param object An object containing key and
 *      values to generate select options.
 *      
 * @param string An empty option name. Null will
 *      be used as value.
 *      
 * @returns A string of HTML options to use in a
 *      select item.
 */
var optionsFromObject = function(object, emptyOption) {
    var opts;

    if (emptyOption !== undefined) {
        opts = '<option value="">' + emptyOption + '</option>';
    }

    for (var k in object) {
        opts += '<option value="' + k + '">' + object[k] + '</option>';
    }
    return opts;
};

/**
 * Replaces options for a select HTML element with
 * the given options. Options must be formatted as 
 * 
 *  {value : <the value>, text: <the text to be shown>}
 * 
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function($, window) {
    $.fn.replaceOptions = function(options) {
        var self, $option;

        this.empty();
        self = this;

        $.each(options, function(index, option) {
            $option = $("<option></option>")
                    .attr("value", option.value)
                    .text(option.text);
            self.append($option);
        });
    };
})(jQuery, window);

/**
 * Serializes an object
 * Plugin for jQuery.
 * 
 * @returns {String|Array|$.fn.serializeObject@pro;value}
 */
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

/**
 * Executes the given function when ESC is pressed.
 * This fires only once.
 * 
 * @param {type} fn
 * @returns {undefined}
 */
function onESCPressed(fn, customEventID) {
    var eventID = customEventID || Math.floor((Math.random() * 200) + 1);
    $(document).bind("keydown." + eventID, function(e) {
        if (e.keyCode == 27) {
            fn(e);
            $(document).unbind("keydown." + eventID);
        }
    });
};

/**
 * Removes an event from all elements that respond
 * to the given selector.
 * 
 * @param {type} selector
 * @param {type} event
 * @returns {undefined}
 */
function removeEventFromElement(selector, event) {

}
;

/*
    if Array is empty
*/
function isEmpty(str) {
    return (!str || 0 === str.length);
}

/**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  };


function toPrint(content) {
    var strFrameName = ("printer-" + (new Date()).getTime());
    var jFrame = $("<iframe name='" + strFrameName + "'>");
    jFrame.css("width", "1px")
            .css("height", "1px")
            .css("position", "absolute")
            .css("left", "-9999px")
            .appendTo($("body:first"))
            ;
    var objFrame = window.frames[ strFrameName ];
    var objDoc = objFrame.document;
    /*
     var jStyleDiv = $("<div>").
     append("<style type=\"text/css\" media=\"print\">\n\
     @page{size: auto;margin: 5mm;}" + style + "</style>");*/
    var jStyleDiv = $("<div>").append(
            $("style").clone()
            );

    objDoc.open();
    objDoc.write("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"\n\
                \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
    objDoc.write("<html>");
    objDoc.write("<body>");
    objDoc.write("<head>");
    objDoc.write("<title>");
    objDoc.write("");
    objDoc.write("</title>");
    objDoc.write(jStyleDiv.html());
    objDoc.write("</head>");
    objDoc.write(content);
    objDoc.write("</body>");
    objDoc.write("</html>");
    objDoc.close();

    objFrame.focus();
    objFrame.print();
    
    setTimeout(function() {
        jFrame.remove();
    }, (60 * 1000));
};

jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ? 
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^s+|s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
};

var thousandSeparator = function() {
    var nStr = $(this).val();
    nStr += '';
    nStr = nStr.replace(/\./g,'');
    var rgx = /(\d+)(\d{3})/;
    nStr = nStr.replace(rgx,'$1' + '.' + '$2');
    var array = nStr.split('.');

    while(rgx.test(array[0])){
        var tmp = array[0].replace(rgx,'$1' + '.' + '$2');
        tmparr = tmp.split('.');
        array.splice(0,1);
        array = $.merge(tmparr,array);
    }

    nStr = '';
    nStr = array[0];
    for (var i = 1; i < array.length; i++) {
        nStr += '.'+array[i];
    };
    
    $(this).val(nStr);
};

$(document).ready(function() {
    $('.numeric').on('keyup','.numeric',thousandSeparator);
    $('.numeric').bind('keyup',thousandSeparator);
    $('.numeric').each(thousandSeparator);
});
