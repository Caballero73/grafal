animateHeader(); // Animate the header!

/*******************************/
/** Popup contacto            **/
/*******************************/

var EditContact = function(index, onClose) {
    this.index = index;
    this.onClose = onClose;
    this.$this = $($('.popup.edit-contacto')[index]);
};
EditContact.prototype.close = function() {
    if (this.onClose) {
        this.onClose(this.index);
    }
    this.$this.unbind().fadeOut();
};
EditContact.prototype.open = function() {
    this.$this.fadeIn();
    this.$this.find('.mask').click($.proxy(this.close, this));
    onESCPressed($.proxy(this.close, this));
};

/*******************************/
/** Popup direccion           **/
/*******************************/

var EditDireccion = function(index, onClose) {
    this.index = index;
    this.onClose = onClose;
    this.$this = $($('.popup.edit-direccion')[index]);
};
EditDireccion.prototype.close = function() {
    if (this.onClose)
        this.onClose(this.index);
    this.$this.unbind().fadeOut();
};
EditDireccion.prototype.open = function() {
    this.$this.fadeIn();
    this.$this.find('.mask').click($.proxy(this.close, this));
    onESCPressed($.proxy(this.close, this));
};


/*******************************/
/** Contacto - Cliente        **/
/*******************************/

var addContact = function() {
    var index = $("#added-contacts .added-contact").length;
    $.ajax({
        url: BASE_URL + 'clients/addContact/' + index,
        method: 'get',
        success: $.proxy(function(html) {
            $('#added-contacts').append(html);
            eval('editContact' + index + '.open()');
        }, this),
        error: onAjaxError
    });
};

var removeContact = function(index) {
    $($('#added-contacts .added-contact')[index]).hide()
            .find('input[name$="[deleted]"]').val('1');
};

var onContactEditDone = function(index) {
    // write name on list of contacts
    var $popup = $('.popup.contact-'+index);
    var summary = $popup.find('input[name$="[nombre]"]').val() || '[No especificado]';
    summary += ' / ' + $popup.find('input[name$="[departamento]"]').val() || '';
    summary += ' / ' + $popup.find('input[name$="[cargo]"]').val() || '';
    $($("#added-contacts .added-contact")[index]).find('.name').html(summary);
};

/*******************************/
/** Direccion - Cliente       **/
/*******************************/

var addAddress = function() {
    var index = $("#added-addresses .added-address").length;
    $.ajax({
        url: BASE_URL + 'clients/addAddress/' + index,
        method: 'get',
        success: $.proxy(function(html) {
            $('#added-addresses').append(html);
            eval('editAddress' + index + '.open()');
        }, this),
        error: onAjaxError
    });
};

var removeAddress = function(index) {
    $($('#added-addresses .added-address')[index]).hide()
            .find('input[name$="[deleted]"]').val('1');
};

var onAddressEditDone = function(index) {
    // write name on list of contacts
    $($("#added-addresses .added-address")[index]).find('.direccion').html(
          $('.popup.address-'+index+' input[name$="[direccion]"]').val() || '[No especificada]');
};