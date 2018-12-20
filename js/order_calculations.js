
var _OrderCalculationsManager = function() {
    this.calculations = {};
    this.init();
};
_OrderCalculationsManager.prototype.init = function() {
    var _this = this;
    $.each(['numerado', 'intercalado', 'grapado', 'perforado', 'emblocado', 'troquelado',
        'barniz-al-agua', 'barniz-uv', 'barniz-sectorizado', 'laminado', 'marcado',
        'doblado', 'falso-cosido', 'espriral', 'pegado', 'plastificado', 'solapa-de-stock',
        'hot-stamping', 'envarillado', 'polipropileno', 'tratamiento-laminado'], function() {
        NotificationCenter.addObserver(this, _this._fnForCalcCreation(name));
    });
};
_OrderCalculationsManager.prototype._fnForCalcCreation = function(calcName) {
    return function(infoObject) {
        // TODO: crear calculo con el nombre calcName
        // en el workdetail indicado en infoObject

        //console.log('Crear/actualizar calculo para tarea ' + infoObject.taskName + ' del WD ' + infoObject.workDetail)
        //alert('evento: '+infoObject.eventName+' Tarea: '+infoObject.taskName+' WorkDetail: '+infoObject.workDetail);
        SelectorCalculos.manageEvent(infoObject);
    };
};

/** Global instance **/

(function() {
    window.OrderCalculationsManager = new _OrderCalculationsManager();
})();