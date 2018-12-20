
var ColorSelectionBox = function(trabajo, cara, onClose) {
    this.trabajo = trabajo;
    this.cara = cara;
    this.onClose = onClose;
    this.$box = $("#color-selection-box-" + cara + "-" + trabajo);
    this.$box.find('.mask').click($.proxy(this, 'close'));
};

ColorSelectionBox.prototype.close = function() {
    this._generateThumbs();
    if (this.onClose !== undefined) {
        this.onClose(this);
    }
    this.$box.fadeOut({speed: 'fast'});
};

ColorSelectionBox.prototype.show = function() {
    this.$box.fadeIn({speed: 'fast'});
    onESCPressed($.proxy(function(){this.close();}, this));
};

ColorSelectionBox.prototype._comboValue = function(index) {
    return this.$box.find('.tinta select')[index].value;
};

ColorSelectionBox.prototype._generateThumbs = function() {
    var $trabajo = $($('.trabajo')[this.trabajo]);
    var div = $trabajo.find('.resumen-colores.' + this.cara)[0];
    var $noColorsMesage = $trabajo.find('.no-colors-message.' + this.cara);
    div.innerHTML = '';
    var colors = this.selectedColors();
    var pantone = false;

    $('input.pantone_'+this.cara).each(function(){if($(this).val() !== ''){pantone = true;}})

    if (colors.length === 0 & !pantone) {
        $noColorsMesage.show();
    } else {
        $noColorsMesage.hide();
        colors.forEach(function(elem) {
            div.innerHTML += '<div class="color-thumb" style="background-color:' + elem + ';"></div>';
        });
        if(pantone){
           div.innerHTML += '<div class="color-thumb" style="font-family: arial; font-size: 15px;">P</div>'; 
        }
    }
};

ColorSelectionBox.prototype.selectedColors = function() {
    var colors = [];
    $('#color-selection-box-' + this.cara + '-' + this.trabajo + ' .tinta select option[value!=""]:selected')
            .each(function() {
                colors.push($(this).attr('hex'));
            });
    return colors;
};