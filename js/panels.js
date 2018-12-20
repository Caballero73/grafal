animateHeader(); // Animate the header!
var A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11,A12,A13,A14,A15,A16,A17,A18,A19,A20,A21,A22,A23,A24,A25,A26,A27,A28,A29,A30,A31,A32,A33,A34;
var B1,B2,B3,B4,B5,B6,B7,B8,B9,B10,B11,B12,B13,B14,B15,B16,B17,B18,B19,B20,B21,B22,B23,B24,B25,B26,B27,B28,B29,B30,B31,B32,B33,B34;
var TF, TD; // #Tinta Dorso, #Tinta Frente
var CF0,CF1,CF2,CF3,CF4,CF5,CF6,CF7;
var CD0,CD1,CD2,CD3,CD4,CD5,CD6,CD7;

var H; // cantidad de hojas por juego
var L; // cantidad de libretas

/*
- si 1 vía; x = 100
Si forma de (A20) = 2 y cant (A1) = 100; x = 50
Si A1 < 100; x = A1

- si 2 vías; x = 50
Si A20 = 2 y A1 = 50; x = 25
si A1 < 50; x = A1

- si 3 o 4 vías; x = 25
- si 5 vías; x = 20
- si 6 vías; x = 10
A3 = # VIA
 */
function hojasPorJuego() {
    H = 0;
    
    if(B15 != 0 && B15 != '') {
        H = B15;
        return H;
    }

    if(A2 != 'Vias') return H;

    if(A3 == 1) {
        if(A20 == 2 && A1 == 100) {
            H = 50;
        } else if(A1 < 100){
            H = A1;
        } else {
            H = 100;
        }
    } else if(A3 == 2 || A3 == 3) {
        if(A20 == 2 && A1 == 50) {
            H = 25;
        } else if(A1 < 50){
            H = A1;
        } else {
            H = 50;
        }
    } else if(A3 == 4) {
        H = 25;
    } else if(A3 == 5) {
        H = 25;
    } else if(A3 == 6) {
        H = 20;
    } else {
        H = 20;
    }

    return H;
}

//Cantidad de libretas (L)
//L= A1 / x (x= juegos, el resultado de arriba)
//si A20=2 y si es impar ; L+1, son L-1 libretas de “x” y 2 de
function cantidadLibretas() {
    L = 0;
    
    if(H == 0) return L;

    L = A1 / H;
    if(A20 == 2 && L % 2 != 0) {
        L = L + 1; // esta es parte irregular (se entregan)
    }

    return L;
}

function setMarcado(i) {
    var manual = 50 + 1.24 * A1;
    var troqueladora = 200 + Math.max(A31 * 0.75, 750);
    if(manual <= troqueladora) {
        $('#WorkDetail'+i+'TaskMarcado').val(1);
    } else {
        $('#WorkDetail'+i+'TaskMarcado').val(2);        
    }
}
$(document).ready(function() {
    /** Lógica para ocultar combos en función del tipo de trabajo*/
    $('#OrderWorkTypeId').change(hideNotDocumentsFields);
    $('#OrderWorkSubtypeId').change(hideNotRecibosVariosFields);
    hideNotDocumentsFields();
    hideNotRecibosVariosFields();
    onPanelCollapsed();

    /** Calculo de Sobrante */
    loadSobranteCalculation();

    //$(".panel.collapsable.opened .panel-title").click(openedPanelClick);
    //$(".panel.collapsable.closed .panel-title").click(closedPanelClick);
    $(".panel.collapsable.opened .ui-tabs-nav").click(closeTabs);
    $(".panel.collapsable.closed .ui-tabs-nav").click(openTabs);
    $("#OrderOrganizadoEn").change(switchOrganizadoEn);
    switchOrganizadoEn();
    $('#OrderMetodoEntrega').change(entregaEn);
    setupCalcs();
    updateResumenTareas();

    var disenioNumeration = function(){
        var desde = parseInt($('#OrderDesignNumeroDesde').val());
        if(!isNaN(desde) && desde >= 0){
            var cantidad = parseInt($('#OrderCantidadCopias').val().replace(/\./g,''));
            var hasta = cantidad + desde - 1;
            $('#OrderDesignNumeroHasta').val(hasta);
        }
    };

    $("#OrderCantidadCopias,#OrderDesignNumeroDesde").bind("keyup",disenioNumeration);
    $('#OrderFormatoFinalX').bind("keyup",
        function(){
            var formato = $(this).val();
            $('[id$=FormatoAncho]').each(
                function(){
                    $(this).val(formato);
            });
        });
    $('#OrderFormatoFinalY').bind("keyup",
        function(){
            var formato = $(this).val();
            $('[id$=FormatoAlto]').each(
                function(){
                    $(this).val(formato);
            });
        });
        
    initFormulas();
});
var _FORMULAS_TAREAS_ = null;
var _FORMULAS_PRINTERS_ = null;
function initFormulas(){
    $.ajax({
        url: BASE_URL + 'tareas/init',
        method: 'GET',
        type: 'json',
        success: function(result){
            var results = $.parseJSON(result);
            _FORMULAS_TAREAS_ = results.tareas;
            _FORMULAS_PRINTERS_ = results.printers;
        },
        error: function(err){
            //console.log(err);
        }
    });
}

var loadSobranteCalculation = function() {
    /*
     $('#OrderWorkTypeId').change(sobranteCalculations);
     $('.trabajo').each(function(index) {
     $('WorkDetail'+index+'Printer1Id').change(sobranteCalculations);
     $('WorkDetail'+index+'Printer2Id').change(sobranteCalculations);
     $('WorkDetail'+index+'Printer3Id').change(sobranteCalculations);
     });
     $('select[id$=InkId]').each(function(){
     $(this).change(sobranteCalculations)
     });
     */
    $('select[id$=InkId], #OrderWorkTypeId, .impresora > select').change(sobranteCalculations);
};

/*
Cantidad de impresiones = a X pliegos X lados
Consumo = "Tiempo de Impresión" X "Consumo E"
Amortización = "LI" X U$S X cantidad de impresiones / ("Días am" X "prom/diario")
Tiempo de impresión = "Puesta en máquina" + ("Cantidad de impresiones" / "Copia /min")


Costo de Impresión = (Costo Copia + Reserva Salarial + Consumo + Amortización + Alquiler) * Incertidumbre

Costo Copia = "Costo / copia" X "U$S" X "cantidad de impresiones"

Reserva Salarial = "Tiempo de impresión" X (Sueldo / "Mins mensuales")
*/
var printerCalculation = function(){
    $('.trabajo').each(
        function(index) {
            $('#WorkDetail'+index+'Calculation1Monto').val(0);

            var printerId1 = $('#WorkDetail' + index + 'Printer1Id :selected').val();
            var type = $('#WorkDetail' + index + 'Printer1Id :selected').parent('optgroup').attr('label');
            var CostoImpresion1 = getCostoByPrinterId(printerId1,index,type);

            var printerId2 = $('#WorkDetail' + index + 'Printer2Id :selected').val();
            type = $('#WorkDetail' + index + 'Printer2Id :selected').parent('optgroup').attr('label');
            var CostoImpresion2 = getCostoByPrinterId(printerId2,index,type);

            var printerId3 = $('#WorkDetail' + index + 'Printer3Id :selected').val();
            type = $('#WorkDetail' + index + 'Printer3Id :selected').parent('optgroup').attr('label');
            var CostoImpresion3 = getCostoByPrinterId(printerId3,index,type);

            $('#WorkDetail'+index+'Calculation1Monto').val(CostoImpresion1 + CostoImpresion2 + CostoImpresion3);
        }
    );
    //SelectorCalculos.calculateTotal();
};

var countLados = function(index){
    var frente = $('#color-selection-box-frente-' + index + ' .tinta select option[value!=""]:selected').length;
    var dorso = $('#color-selection-box-dorso-' + index + ' .tinta select option[value!=""]:selected').length;
    var tintaFrente = getCountPantoneFrente(index);
    var tintaDorso = getCountPantoneDorso(index);

    var ladoFrente = ((frente + tintaFrente) > 0) ? 1 : 0;

    var ladoDorso = ((dorso + tintaDorso) > 0) ? 1 : 0;  

    var Total = ladoFrente + ladoDorso;

    return Total;
};

var getCountPantoneFrente = function(index){
    var pantoneFrente = countPantoneMithIndex('PantoneFrente',index);

    return pantoneFrente;
};

var getCountPantoneDorso = function(index){
    var pantoneDorso = countPantoneMithIndex('PantoneDorso',index);

    return pantoneDorso;
};

var countPantoneMithIndex = function(pantone,index){
    var count = 0;
    
    $('[id^=WorkDetail'+index+''+pantone+']').each(
        function(){
            if($.trim($(this).val()) != ''){
                count++;
            }
        }
    );

    return count;
};

/*
a = 2 si;
impresora M.Color C6000, un lado mayor que 33,0 cms ID: 5
impresora M.Negra c6000, un lado mayor que 33,0 cms ID: 6
impresora M Negra 1050, un lado mayor que 33,0 cms ID: 8
Impresora K. Negra 8000, un lado mayor que 41,9 cmsID: 3
Impresora K. Negra 9530, un lado mayor que 35,0 cms ID: 4

sino a = 1
*/
var getTheAValue = function(printerId,index){
    var printerCosts = JSON.parse('{"5":33.0,"6":33.0,"8":33.0,"3":41.9,"4":35.0}');
    var lado = parseFloat(printerCosts[printerId]);
    var corteAncho = parseFloat($('#WorkDetail'+index+'CorteAncho').val());
    var corteAlto = parseFloat($('#WorkDetail'+index+'CorteAlto').val());
    var corte = ((corteAncho > lado) || ( corteAlto > lado)) ? 2 : 1;

    return corte;
};

var getCostoByPrinterId = function(printerId,index,type){
    //Porque si
    var a = getTheAValue(printerId,index);

    //pliegos en la orden
    var pliegos = parseFloat($('#WorkDetail' + index + 'Pliegos').val());

    // Preguntar
    var lados = countLados(index);

    var cantImpresiones = a * pliegos * lados;

    console.log('Cant Imp : '+cantImpresiones);

    if((type != 'digital') || (cantImpresiones <= 0)){
        return 0;
    }

    // Tiempo de impresión = "Puesta en máquina" + ("Cantidad de impresiones" / "Copia /min")
    pmaquina = getValue(printerId,'puestaenmáquina');
    copiamin = getValue(printerId,'copiamin');
    var div = (copiamin === 0) ? 1 : (cantImpresiones / copiamin);
    var tipempoImpresion = pmaquina / div;

    //Consumo = "Tiempo de Impresión" X "Consumo E"
    var consumoE = getValue(printerId,'consumoe');

    var Consumo = tipempoImpresion * consumoE;

    //Amortización = "LI" X U$S X cantidad de impresiones / ("Días am" X "prom/diario")
    var li = getValue(printerId,'li');
    var diasam = getValue(printerId,'díasam');
    var promdiario = getValue(printerId,'promdiario');
    div = ((diasam * promdiario) === 0) ? 1 : (diasam * promdiario);
    var Amortizacion = li * USD_DEL_DIA * cantImpresiones / div;

    //Reserva Salarial = "Tiempo de impresión" X (Sueldo / "Mins mensuales")
    div = getValue(printerId,'minsmensuales');
    div = (div === 0) ? 1 : div;

    var Sueldo = getValue(printerId,'sueldo');


    var ReservaSalarial = tipempoImpresion * Sueldo / div;

    //Costo Copia = "Costo / copia" X "U$S" X "cantidad de impresiones"
    var CostoCopia = getValue(printerId,'costocopia') * USD_DEL_DIA * cantImpresiones;

    //Alquiler
    var Alquiler = getValue(printerId,'alquiler');

    //Incertidumbre
    var Incertidumbre = getValue(printerId,'incertidumbre');

    //console.log(' '+CostoCopia +' '+ ReservaSalarial +' '+ Consumo +' '+ Amortizacion +' '+ Alquiler +' '+ Incertidumbre)

    //Costo de Impresión = (Costo Copia + Reserva Salarial + Consumo + Amortización + Alquiler) * Incertidumbre
    var CostoImpresion = (CostoCopia + ReservaSalarial + Consumo + Amortizacion + Alquiler) * Incertidumbre;

    CostoImpresion = decimalAdjust('round',CostoImpresion,-2);

    return CostoImpresion;
};

var getValue = function(id,arg) {
    if(id === ''){
        return 0;
    }
    var printerId = parseInt(id);

    var cost = parseFloat(printerCosts[printerId][arg]);

    return cost;
};

var sobranteCalculations = function() {
    $('.trabajo').each(function(index) {
        var sobrante = 0;
        var printer = $('#WorkDetail' + index + 'Printer1Id :selected').parent('optgroup').attr('label');
        if (printer === 'digital') {
            //var items = $('#OrderCantidadCopias').val();
            var workType = $('#OrderWorkTypeId :selected').text();
            if (workType === 'Documentos') {
                sobrante = 3;
            } else {
                sobrante = 2;
            }
            //          alert(sobrante);
        }
        if (printer === 'offset') {
            var tintas = inksCount(index);
            var value = 0;
            if (tintas === 1) {
                value = 50;
            } else {
                value = 50 * tintas;
            }

            var spects = new Spects(index);
            var count = spects.quantity();

            sobrante = count * value;
        }
        $('#WorkDetail' + index + 'Sobrante').val(sobrante);
    });
};

var inksCount = function(index) {
    var tintasFrente = this['colorSelectionBoxFrente' + index].selectedColors();
    var tintasDorso = this['colorSelectionBoxDorso' + index].selectedColors();
    var count = 0;
    $.each(tintasFrente, function(index, val) {
        var ponderación = 1;
        if (val === "#FF00FF") {ponderación = 4;}

        count += 1 * ponderación;
    });
    $.each(tintasDorso, function(index, val) {
        var ponderación = 1;
        if (val === "#FF00FF") {ponderación = 4;}
        
        count += 1 * ponderación;
    });

    $('#OrderInkCount').val(count);

    return count;
};

var hideNotDocumentsFields = function() {
    var selected = $('#OrderWorkTypeId :selected').text();
    if (selected === "Documentos") {
        $('.documents').show();
    } else {
        $('.documents').hide();
    }
};
var hideNotRecibosVariosFields = function() {
    var selected = $('#OrderWorkTypeId :selected').text();
    var selectedSubtype = $('#OrderWorkSubtypeId :selected').val();
    if (selected === "Documentos" && (selectedSubtype == '38' || selectedSubtype == '40' || selectedSubtype == '77' )) {
        $('.documents').hide();
    } else {
        $('.documents').show();        
    }
};
var entregaEn = function() {
    if ($('#OrderMetodoEntrega')[0].value === "Retira de") {
        $('#OrderEntregaEn').replaceOptions(retiraOptions);
    } else {
        $('#OrderEntregaEn').replaceOptions(entregaOptions);
    }
};
var switchOrganizadoEn = function() {
    var combo = $("#OrderOrganizadoEn")[0];
    var $switcheables = $('.panel .switchable');
    var $recomendado = $('.trabajo .recomendado');
    var $cantidad = $("#OrderCantidad");
    $switcheables.addClass('hidden');
    if (combo.value === "Vias") {
        $switcheables.filter('.vias').removeClass('hidden');
        $recomendado.attr('value', 'Vías');
        $cantidad.attr('readonly', 'readonly');
    } else if (combo.value === "Paginas") {
        $switcheables.filter('.paginas').removeClass('hidden');
        $recomendado.attr('value', 'Pliegos');
        $cantidad.removeAttr('readonly');
    } else {
        $recomendado.attr('value', 'Cambios');
        $cantidad.removeAttr('readonly');
    }
};
var closeTabs = function(event) {
    event.preventDefault();
    tooglePanel($(event.currentTarget).parents('panel')[0], true, onPanelCollapsed);
};
var openTabs = function(event) {
    event.preventDefault();
    tooglePanel($(event.currentTarget).parents('panel')[0], false, onPanelCollapsed);
};
var tooglePanel = function(htmlElem, isOpened, afterFn) {
    var $htmlElem = $(htmlElem);
    var $panel = $htmlElem.parent().parent();
    //$panel.toggleClass('closed opened', 300, "easeOutSine", afterFn);
    $panel.toggleClass('closed opened');
    if (afterFn)
        afterFn();
    if (isOpened) {
        $htmlElem.unbind('click').click(openTabs);
    } else {
        $htmlElem.unbind('click').click(closeTabs);
    }
};
// overflow fix // to enhance
var onPanelCollapsed = function() {
    var $centralPanel = $($('.panel-content')[1]);
    var otherPanelsHeight = 0;
    $('#mid-col .collapsable').each(function() {
        otherPanelsHeight += $(this).outerHeight();
    });
    var height = $('#mid-col').height() - otherPanelsHeight - 27;
    $centralPanel.css('height', height - 27);
};
/************************************/
/** Remitos (+, -)                 **/
/************************************/

var addRemito = function() {
    var index = $("#added-remitos .added-remito").length;
    $.ajax({
        url: BASE_URL + 'orders/addRemito/' + index,
        method: 'get',
        success: $.proxy(function(html) {
            $('#added-remitos').append(html);
        }, this),
        error: onAjaxError
    });
};
var removeRemito = function(index) {
    $($('#added-remitos .added-remito')[index]).hide()
            .find('input[name$="[deleted]"]').val('1');
    $($('#added-remitos .added-remito')[index])
            .find('input[type!=hidden]').val(0);
};
/************************************/
/** Trabajos (+, -)                **/
/************************************/

// Agrega un nuevo detalle de trabajo
var addNewWorkDetail = function(itemToDuplicate) {
    //var newIndex = $('.trabajo:visible').length;
    var newIndex = $('.trabajo').length;
    var url = BASE_URL + 'workDetails/ajaxDuplicate/' + newIndex + '/' + itemToDuplicate;
    // lock buttons
    lockWorkDetails();
    $.ajax({
        url: url,
        method: 'POST',
        data: $('form').serializeObject(),
        success: function(result) {
            $('.detalles-orden .panel-content').append(result);
            toggleDeleteButtons();
            setWorkDetailNumbers();
            unlockWorkDetails();
            updateResumenTareas();
            SelectorCalculos.addWorkDetailCalculation(newIndex, itemToDuplicate);
            observeEditable();
            /*bindForPrinterCalculations();
            setTimeout(function(){
                bindMaterialCalculations();                
            }, 800);*/
        },
        error: function(err) {
            alert('Ha ocurrido un error al duplicar el trabajo');
            console.log(err);
            unlockWorkDetails();
        }
    });
};
var lockWorkDetails = function() {
    $(".panel.detalles-orden .panel-content")
            .css({
                overflow: 'hidden',
                position: 'relative'
            })
            .find('.work-detail-loading').show();
};
var unlockWorkDetails = function() {
    $(".panel.detalles-orden .panel-content")
            .css({
                overflow: 'auto',
                position: 'static'
            })
            .find('.work-detail-loading').hide();
};
// Borra un detalle de trabajo
var deleteWorkDetail = function(itemToDelete) {
    var $panel = $('.detalles-orden .panel-content');
    $($panel.find('.separator')[itemToDelete]).css({
        display: 'none'
    });
    $($panel.find('.trabajo')[itemToDelete]).css({
        display: 'none'
    })
            .find('#WorkDetail' + itemToDelete + 'Deleted').attr('value', '1');
    setWorkDetailNumbers();
    toggleDeleteButtons();
    updateResumenTareas();
    SelectorCalculos.removeWorkDetailCalculation(itemToDelete);
};
/**
 * If there's only one work detail, remove button
 * is hidden.
 */
var toggleDeleteButtons = function() {
    if ($('.trabajo input[id$=Deleted][value="0"]').length > 1) {
        $('.trabajo button.remove').removeClass('hidden');
    } else {
        $('.trabajo button.remove').addClass('hidden');
    }
};
/**
 * Unsets and sets the work detail number for
 * all work details. If a work detail has been deleted,
 * following work detail numbers will decrease.
 */
var setWorkDetailNumbers = function() {
    return true;
    var numero = 1;
    $('.trabajo input[id$=Deleted][value="0"]').each(function() {
        $(this).parents('.trabajo').find('.work-detail-number label').html(numero);
        numero++;
    });
};
/**************************************/
/** Seleccion de vias actualiza cant **/
/**************************************/
var onSelectorViasClosed = function(cantVias) {
    $("#OrderCantidad").val(cantVias);
};
/**************************************/
/** Seleccion del cliente            **/
/**************************************/
var onClientSelected = function(client) {

    $('#OrderClientId').attr('value', client.id);
    $('#OrderRazonSocial').attr('value', client.name);
    $('#OrderDesignPasarMuestra').prop('checked', client.muestra);
    updateContacts(client.id);
    updatePaymentTypes(client.id);
    updateAddresses(client.id);
};
/**
 * Updates payment types available according to
 * the current client's payment type
 *
 * @param int clientPaymentTypeId
 */
var updatePaymentTypes = function(clientId) {
    //controller, action, params, selector
    $.ajax({
        url: BASE_URL + 'paymentTypes/listByClient/' + clientId,
        dataType: 'json',
        success: function(jsonData) {
            var opts;
            var orden = [6,3,2,5,4,1,7];
            
            for (var k = 0; k < orden.length; k++) {
                if(jsonData[orden[k]] !== undefined){
                    opts += '<option value="' + k + '">' + jsonData[orden[k]] + '</option>';
                }
             };

            $('#OrderPaymentTypeId').empty().html(opts);  
        },
        error: onAjaxError
    });
};

/**
 * Updates contacts list with the selected client's
 * contacts
 *
 * @param int clientId
 */
var updateContacts = function(clientId) {
    $.ajax({
        url: BASE_URL + 'contacts/listByClient/' + clientId,
        dataType: 'json',
        success: function(jsonData) {
            var opts = optionsFromObject(jsonData, 'Contacto ---');
            $("select#OrderContactId").html(opts);
            $("select#OrderNotifyContactId").html(opts);
            onConctactResponsableChanged();
            onConctactNotificarChanged();
        },
        error: onAjaxError
    });
};
/**
 * Updates addresses list with the selected client'
 * addresses
 *
 * @param int clientId
 */
var updateAddresses = function(clientId) {
    updateSelectFromController('addresses', 'listByClient', clientId, '#OrderEntregaEn');
};
/**
 * On contact changed, contact's address and phone
 * number are displayed on input fields.
 */
var onConctactResponsableChanged = function() {
    var contactId = $("select#OrderContactId")[0].value;
    if (contactId === "") {
        _setContactInformation("#OrderContactTelefono", "#OrderContactEmail", {
            Contact: {
                telefono: '',
                email: ''
            }
        });
        return;
    }
    $("#OrderNotifyContactId").val(contactId); // select the same contact on Notificar
    $.ajax({
        url: BASE_URL + 'contacts/contactData/' + contactId,
        dataType: 'json',
        success: function(jsonData) {
            _setContactInformation("#OrderContactTelefono", "#OrderContactEmail", jsonData);
            _setContactInformation("#OrderNotificarTelefono", "#OrderNotificarEmail", jsonData);
        },
        error: onAjaxError
    });
};
/**
 * On contact changed, contact's address and phone
 * number are displayed on input fields.
 */
var onConctactNotificarChanged = function() {
    var contactId = $("select#OrderNotifyContactId")[0].value;
    if (contactId === "") {
        _setContactInformation("#OrderNotificarTelefono", "#OrderNotificarEmail", {
            Contact: {
                telefono: '',
                email: ''
            }
        });
        return;
    }
    $.ajax({
        url: BASE_URL + 'contacts/contactData/' + contactId,
        dataType: 'json',
        success: function(jsonData) {
            _setContactInformation("#OrderNotificarTelefono", "#OrderNotificarEmail", jsonData);
        },
        error: onAjaxError
    });
};
/**
 * Utility function.
 * Sets the contact info (phone and email) in the given
 * form fields (selectors).
 *
 * @param string phoneSelector
 * @param string emailSelector
 * @param JSON object data
 */
var _setContactInformation = function(phoneSelector, emailSelector, data) {
    $(emailSelector)[0].value = data.Contact.email;
    $(phoneSelector)[0].value = data.Contact.telefono;
};
/**************************************/
/** Calculations                     **/
/**************************************/

var setupCalcs = function() {
    $("#OrderFechaEntrega").change(calcFechaTerminacion);
    setupInputs();
    calculoJuegos();
};
/*
var changeDableCorte = function(indexTrabajo) {

    var sx = parseInt(isNaN($("#WorkDetail" + indexTrabajo + "SangradoX").val()) || 0);
    var sy = parseInt(isNaN($("#WorkDetail" + indexTrabajo + "SangradoY").val()) || 0);
    var ca = parseInt(isNaN($("#WorkDetail" + indexTrabajo + "DobleCorteAncho").val()) || 0);
    var cal = parseInt(isNaN($("#WorkDetail" + indexTrabajo + "DobleCorteAlto").val()) || 0);

    console.log(sx+' '+sy+' '+ca+' '+cal);

    $("#WorkDetail" + indexTrabajo + "DobleCorteAncho").val(ca + sx);
    $("#WorkDetail" + indexTrabajo + "DobleCorteAlto").val(cal + sy);
}*/

var setUpWorkDetaiAtCero = function() {
    if (!isNaN($("#WorkDetail0SangradoX").val())) {
        $("#WorkDetail0SangradoX").val(2);
    }

    if (!isNaN($("#WorkDetail0SangradoY").val())) {
        $("#WorkDetail0SangradoY").val(2);
    }

    if (!isNaN($("#WorkDetail0Pinza").val())) {
        $("#WorkDetail0Pinza").val(15);
    }

    if (!isNaN($("WorkDetail0MaterialIdWrapper").val())) {
        $("WorkDetail0MaterialIdWrapper").val(10);
    }


}

/**
 * Setup: Sangrado, Pinza, Cola, Doble Corte
 *
 */
var setupInputs = function() {
    var largo = $('.trabajo input[id$=Deleted][value!=1]').length;
    for (var i = 0; i < largo; i++) {
        $("#WorkDetail" + i + "SangradoX").val($("#WorkDetail" + i + "SangradoX").val() || 2);
        $("#WorkDetail" + i + "SangradoY").val($("#WorkDetail" + i + "SangradoY").val() || 2);
        $("#WorkDetail" + i + "Pinza").val($("#WorkDetail" + i + "Pinza").val() || 15);
        $("#WorkDetail" + i + "Cola").val($("#WorkDetail" + i + "Cola").val() || 10);
        $("#WorkDetail" + i + "DobleCorteAncho").val($("#WorkDetail" + i + "DobleCorteAncho").val() || 4);
        $("#WorkDetail" + i + "DobleCorteAlto").val($("#WorkDetail" + i + "DobleCorteAlto").val() ||  4);
    }
}

/**
 * Fecha de terminacion = Fecha de entrega - 1 dia
 */
var calcFechaTerminacion = function() {
    try {
        var s_fechaEntrega = $("#OrderFechaEntrega").val().split("/");
        var fechaEntrega = new Date(s_fechaEntrega[2], s_fechaEntrega[1] - 1, s_fechaEntrega[0]);
        var today = new Date();
        
        var fechaTerminacion = new Date(fechaEntrega.getTime() - 24 * 60 * 60 * 1000); // day before
        
        if(fn_DateCompare(fechaEntrega,today) === 0){
            fechaTerminacion = new Date(fechaEntrega.getTime());
        }

        var s_fechaTerminacion = fechaTerminacion.toLocaleDateString().split("/");
        var finalDate = s_fechaTerminacion[0] + "/" + s_fechaTerminacion[1] + "/" + s_fechaTerminacion[2];

        $("#OrderFechaTerminacion").attr('value', finalDate);

    } catch (err) {
    }
};
/**
 * Cantidad de chapas =
 * - Si solo un lado tiene colores:
 *      = Cantidad de tintas
 * - Si dos lados tienen colores
 *      - Si F&D != NO:
 *          = Cantidad de tintas (union)
 *      - Sino:
 *          = Cantidad de tintas frente + dorso
 *              (se suman aunque sean el mismo color)
 *
 * Triggers:
 *  - Cambio en los colores del trabajo
 *  - Cambio en el combo F&D
 */
var calcChapas = function(indexTrabajo) {
    var printer = $('#WorkDetail' + indexTrabajo + 'Printer1Id :selected').parent('optgroup').attr('label');
    if (printer !== 'offset') return;
    var chapas = 0;
    var tintasFrente = this['colorSelectionBoxFrente' + indexTrabajo].selectedColors();
    var tintasDorso = this['colorSelectionBoxDorso' + indexTrabajo].selectedColors();
    var fyd = $("#WorkDetail" + indexTrabajo + "FrenteYDorso").val();
    var count = 0;
    $.each(tintasFrente, function(index, val) {
        if (val === "#FF00FF") {
            count = count + 3;
        }
    });
    $.each(tintasDorso, function(index, val) {
        if (val === "#FF00FF") {
            count = count + 3;
        }
    });
    if (fyd === 'NO') {
        // sumo la cantidad de tintas
        chapas = tintasFrente.length + tintasDorso.length + count;
    } else {
        // union de la cantidad de tintas
        var temp = _.union(tintasFrente, tintasDorso);
        count = 0;
        $.each(temp, function(index, val) {
            if (val === "#FF00FF") {
                count = count + 3;
            }
        });
        chapas = temp.length + count;
    }

    var count = 0;
    $('.pantone_frente').each(function(){
        if($.trim($(this).val()) != ''){
            count++;
        }
    });
    chapas = chapas + count;

    $("#WorkDetail" + indexTrabajo + "Chapas").attr('value', chapas);
};

var onColorSelectionClosed = function(colorSelection) {
    calcChapas(colorSelection.trabajo);
};
var salenCalculation = function(indexTrabajo) {
    var materialValue = $("#WorkDetail" + indexTrabajo + "MaterialId option:selected").text();
    var materials = materialValue.split("x");
    var valueX = $.trim(materials[0]);
    var valueY = $.trim(materials[1]).split(" ")[0];
    var corteAncho = $("#WorkDetail" + indexTrabajo + "CorteAncho").val();
    var corteAlto = $("#WorkDetail" + indexTrabajo + "CorteAlto").val();
    if (corteAlto === "") {
        corteAlto = 0;
    }
    if (corteAncho === "") {
        corteAncho = 0;
    }

    var w = parseFloat(valueX);
    var h = parseFloat(valueY);
    // CHUGAS - ERROR, deberia castearlo a FLOAT
    var a = parseFloat(corteAncho);
    var b = parseFloat(corteAlto);
    var max = 0;
    var i = 0;
    var temp;
    var aux;
    if (w === 0 || h === 0 || a === 0 || b === 0) {
        max = 0;
    } else {
        if (h - w > 0) {
            temp = h;
            h = w;
            w = temp;
        }
        if (b - a < 0) {
            temp = a;
            a = b;
            b = temp;
        }
        max = 0;
        for (i = 0; i < Math.floor(h / b); i++) {
            aux = (Math.floor(h / b) - i) * Math.floor(w / a) + Math.floor((h - (Math.floor(h / b) - i) * b) / a) * Math.floor(w / b);
            if (aux > max) {
                max = aux;
            }
        }
        for (i = 0; i < Math.floor(w / b); i++) {
            aux = (Math.floor(w / b) - i) * Math.floor(h / a) + Math.floor((w - (Math.floor(w / b) - i) * b) / a) * Math.floor(h / b);
            if (aux > max) {
                max = aux;
            }
        }
    }
    $("#WorkDetail" + indexTrabajo + "Salen").val(max);

    sonCalculation(indexTrabajo);

    //Llama a buscar calculo de material
    //materalCalculation(indexTrabajo);
};

/**
Calculo de materiales
**/
var materalCalculation = function(indexTrabajo){
    var materialId = $('#WorkDetail' + indexTrabajo + 'MaterialId option:selected').val()
    
    $('#btn-calcular').text('Calculando...');
    $('#btn-calcular').attr('disabled');
    
    $.ajax({
        url: BASE_URL + 'materials/materialcosto/' + materialId,
        method: 'GET',
        success: function(result){
            material = $.parseJSON(result);

            if(!jQuery.isEmptyObject(material)){
                var precioMaterial = material.Material.precio;

                var son = getContentToInt('#WorkDetail'+indexTrabajo+'Hojas');
                var resultado = precioMaterial * son * USD_DEL_DIA;
                $('#WorkDetail' + indexTrabajo + 'Calculation0Monto').val(resultado.toFixed(2));

                SelectorCalculos.calculateTareas(indexTrabajo);
                SelectorCalculos.calculateImpresion(indexTrabajo);
                SelectorCalculos.calculateTotal();
                
                $('#btn-calcular').removeAttr('disabled');
                $('#btn-calcular').text('Calcular');
            }
        },
        error: function(err){
            console.log(err);
        }
    });
};

/***
 * Función que calcula la cantidad de hojas para un detalle de trabajo.
 * @param {int} indexTrabajo
 * @returns {void}
 */
var sonCalculation = function(indexTrabajo) {

    var spects = new Spects(indexTrabajo);
    if (spects.exists()) {
        var son = 0;
        var cantidad = getContentToInt("#OrderCantidadCopias");
        var formaDe = getContentToInt("#WorkDetail" + indexTrabajo + "FormaDe");
        var detalle = spects.quantity();
        var salen = getContentToInt("#WorkDetail" + indexTrabajo + "Salen");
        var sobrante = getContentToInt("#WorkDetail" + indexTrabajo + "Sobrante");

        // To avoid division by zero
        if (formaDe === 0 || salen === 0) {
            son = 0;
        } else {
            son = ((cantidad * detalle / formaDe) + sobrante) / salen;
        }

        /*console.log('Vias: ' + detalle +
                ' Cant: ' + cantidad +
                ' formaDe: ' + formaDe +
                ' Salen: ' + salen +
                ' Sobrante: ' + sobrante +
                ' Son: ' + son +
                ' Son to UP: '+ Math.ceil(son));*/

        son = Math.ceil(son);
        $("#WorkDetail" + indexTrabajo + "Hojas").val(son);
        $("#WorkDetail" + indexTrabajo + "Hojas").keyup();
        pliegosCalculation(indexTrabajo);
    }
};

function pliegosCalculation(indexTrabajo){

    var Hojas = parseInt($('[id$='+indexTrabajo+'Hojas]').val().replace(/\./g,''));
    var Son = parseInt($('[id$='+indexTrabajo+'Salen]').val());

    //console.log('Pliegos!!!! Hojas:'+Hojas+' son:'+Son);

    $('#WorkDetail'+indexTrabajo+'Pliegos').val(Hojas*Son);
    $('#WorkDetail'+indexTrabajo+'Pliegos').keyup();
};

/**
 * Get the contenc of a input if is empty return 0
 * 
 * @param {string} selector
 * @returns {getContentToInt.value|Number}
 */
var getContentToInt = function(selector) {
    var value = parseInt($(selector).val().replace(/\./g,''));
    return isNaN(value) ? 0 : value;
};

/**
 * 
 * @param {int} workDetailIndex
 * @returns {int} value of Especificacion input
 */
var Spects = function(workDetailIndex) {
    this.workDetailIndex = workDetailIndex;
    this.literal = $.trim($("#WorkDetail" + this.workDetailIndex + "Especificacion").val());
};
Spects.prototype.exists = function() {
    return this.literal !== '';
};
Spects.prototype.quantity = function() {
    if($('#WorkDetail'+this.workDetailIndex+'Recomendado').val() === 'Cambios'){
        return 1;
    }

    var element = '';
    var elementosInternos = 0;
    var all = this.literal.split(",");

    var elementosSeparados = all.length;

    for (var i = 0; i < all.length; i++) {
        element = ($.trim(all[i])).split("-");

        if (element.length > 1) {
            elementosSeparados = elementosSeparados - 1;
            var temp = parseInt(element[0]) - 1;
            elementosInternos = elementosInternos + (parseInt(element[1]) - temp);
        }
    }

    return elementosSeparados + elementosInternos;
};

var cantPliego = function() {
    if (!$("#OrderPagsPorPliego").hasClass("hidden")) {
        var resultado = 0;
        var cantidad = parseInt($("#OrderCantidad").val());
        var pagPPliego = parseInt($("#OrderPagsPorPliego").val());
        if (pagPPliego !== 0) {
            resultado = cantidad / pagPPliego;
        } else {
            resultado = 0;
        }
        $("#OrderCantPliego").val(resultado);
    }
};

var calculoJuegos = function() {
    /*
    var formaDe = parseInt($("#WorkDetail0FormaDe").val()) ||  0;
    var vias = SelectorVias.countVias();
    var cantidad = parseInt($("#OrderCantidadCopias").val()) || 0;
    var constant = 25;
    var x = 0;
    $("#mensajeJuegos").show();
    $("#OrderJuegos").val("");
    if ((formaDe >= 0) & (vias > 0) & (cantidad > 0)) {
        if (vias > 3) {
            x = cantidad / (25 * formaDe);
            if (x === Math.round(x)) {
                $("#OrderJuegos").val(x);
                $("#mensajeJuegos").hide();
            }
        }
        while (vias <= 3) {
            constant = 100 - (25 * (vias - 1));
            x = cantidad / (constant * formaDe);
            if (x === Math.round(x)) {
                $("#OrderJuegos").val(x);
                $("#mensajeJuegos").hide()
                break;
            }
            vias = vias + 1;
        }
    }
*/
};
var dobleCorteCalculation = function(indexTrabajo) {
    var sX = $("#WorkDetail" + indexTrabajo + "SangradoX").val() || 0;
    var sY = $("#WorkDetail" + indexTrabajo + "SangradoY").val() || 0;

    dCx = parseInt(sX) + 2;
    dCy = parseInt(sY) + 2;

    $("#WorkDetail" + indexTrabajo + "DobleCorteAncho").val(dCx);
    $("#WorkDetail" + indexTrabajo + "DobleCorteAlto").val(dCy);
};
/*************************************/
/** Seleccion de Tareas de la Orden **/
/*************************************/

var SeleccionTareas = function(index) {
    this.index = index;
    this.$this = $($('#seleccion-tareas-' + index)[0]);
};
SeleccionTareas.prototype.open = function() {
    this.$this.fadeIn({
        speed: 'fast'
    });
    this.$this.find('.mask').click($.proxy(this.close, this));
    onESCPressed($.proxy(this.close, this), 'taskSelection');
};
SeleccionTareas.prototype.close = function() {
    updateResumenTareas();
    this.$this.find('.task').hide();
    this.$this.find('.task-mask-layer').hide();
    this.$this.find('.mask').unbind();
    this.$this.fadeOut({
        speed: 'fast'
    });
};
SeleccionTareas.prototype.show = function(element, taskName, taskSelectId) {
    $(document).unbind("keydown.taskSelection");
    this.$this.find('.task-mask-layer').fadeIn({
        speed: 'fast'
    });
    var $task = this.$this.find('.task.' + element);
    $task.fadeIn({
        speed: 'fast'
    });
    var $input = $task.find('input:first')[0];
    if ($input) {
        $input.focus();
    }

    var taskId = "#WorkDetail" + this.index + "Task" + taskSelectId;
    $(taskId).val(1);

    NotificationCenter.notify(element, {workDetail: this.index, taskName: taskName, eventName: 'create'});
    onESCPressed($.proxy(function(e) {
        this.closeTask(element);
    }, this));
    return false;
};
SeleccionTareas.prototype.closeTask = function(element) {
    // hide elements
    this.$this.find('.task.' + element).fadeOut({
        speed: 'fast'
    });
    this.$this.find('.task-mask-layer').fadeOut({
        speed: 'fast'
    });
    // add ESC listener to tasks main panel
    onESCPressed($.proxy(this.close, this), 'taskSelection');
};
SeleccionTareas.prototype.resetTask = function(element, taskName, taskSelectId) {
    var $task = this.$this.find('.task.' + element);
    $task.find('input[type!=checkbox][type!=hidden]').val('');
    $task.find('input[type=checkbox]').removeAttr('checked');
    $task.find('select').val(null);
    this.$this.find('span[task=' + element + ']').removeClass('selected').find('span.del').remove();

    var taskId = "#WorkDetail" + this.index + "Task" + taskSelectId;
    $(taskId).val(0);
    NotificationCenter.notify(element, {workDetail: this.index, taskName: taskName, eventName: 'reset'});
};
/*********************/
/** Tareas          **/
/*********************/

// Actualiza el resumen de las tareas en el panel de tareas.
// Para cada tarea de cada trabajo, colecciona los valores
// de los inputs y selects, y genera un resumen de texto para
// escribir en el panel
//
var updateResumenTareas = function() {
    var taskValues = _collectTaskValues();
    taskValues = _reverseTaskValues(taskValues);
    _printResumenTareas(taskValues);
};
var _printResumenTareas = function(taskValues) {
    var resumen = '<ul>';
    for (var task in taskValues) {
        var taskli = '<li><span class="name">' + task + '</span>: ';
        var count = 0;
        for (var value in taskValues[task]) {
            // filter empty values
            if (value !== undefined && value !== false && value !== '' && value !== "0" && value !== 0) {
                taskli += count > 0 ? ' | ' : '';
                var workDetails = taskValues[task][value].map(function(wd) {
                    return 'T' + wd;
                }).join(',');
                taskli += sprintf('%s: %s', workDetails, _friendlyFormat(value));
                count++;
            }
        }

        taskli += '</li>';
        if (count !== 0) {
            resumen += taskli;
        }
    }
    resumen += '</ul>';

    $('.panel.tareas-orden #tabs-tareas .panel-content').html('<div>' + resumen + '</div>');
};
var _collectTaskValues = function() {
    var taskValues = {};
    //
    // Solo se toman en cuenta los trabajos que no han
    // sido borrados
    //
    $('.trabajo input[id$=Deleted][value="0"]').parents('.trabajo')
            .find('.popup.tareas').each(function(workIndex) {
        SelectorCalculos.fillVars(workIndex);
        workIndex = parseInt(workIndex) + 1;
        var $popup = $(this);
        $popup.find('.task').each(function() {
            var element = $(this).find(".inputIsOn");
            if(element.val() !== 0 && element.val() !== "0" && element.val() !== ""){
                var $this = $(this);
                var taskName = $this.attr('taskName');
                if(taskName === 'Marcado') {
                    setMarcado(workIndex-1);
                }
                if (!taskValues[taskName]) {
                    taskValues[taskName] = {};
                }
                var _values = [];
                $this.find('input:not([id$=Id]),select,textarea').each(function() {
                    var $elem = $(this);
                    if (_isCheckbox($elem)) {
                        if (this.checked === true) {
                            var st = 'true';
                            if(taskName == 'Emblocado') {
                                st = 'Son ' + cantidadLibretas() + ' blocks de ' + hojasPorJuego() + ' juegos';
                            }
                            if(taskName == 'Grapado') {
                                st = 'Son ' + cantidadLibretas() + ' libretas de ' + hojasPorJuego() + ' juegos';                    
                            }
                            if(taskName == 'Falso cosido') {
                                st = 'Son ' + cantidadLibretas() + ' encuadernaciones de ' + hojasPorJuego() + ' juegos';                    
                            }
                            _values.push(st);
                        }
                    } else if (_isSelect($elem)) {
                        if (this.value)
                            _values.push($elem.find('option[value=' + this.value + ']')[0].innerHTML);
                    } else if (this.value) {

                        var newValue = ($(this).attr('class') === 'inputIsOn') ? ' ' : this.value;
                        _values.push(newValue);
                    }
                });
                var taskValuesStr = _values.join(' ');
                taskValues[taskName][workIndex] = taskValuesStr;
            }
     
        });
    });
    return taskValues;
};
// Cada tarea tiene un valor por id de trabajo.
// Ejemplo:
//      Numerado:  0: 12, 1: 24, 2:12
//
// Esta funcion asocia los valores a la inversa: 
// hay una clave por cada valor distinto, y el valor
// es una lista con los ids de trabajo que tienen 
// ese valor. 
// Ejemplo:
//      Numerado:  12: [0, 2], 24: [1]
// 
// De esta forma asociamos los trabajos que tienen
// el mismo valor para mostrarlos en el resumen
//
var _reverseTaskValues = function(taskValues) {
    var reversed = {};
    for (var task in taskValues) {
        reversed[task] = {};
        for (var wd in taskValues[task]) {
            var value = taskValues[task][wd];
            if (!reversed[task][value]) {
                reversed[task][value] = [wd];
            } else {
                reversed[task][value].push(wd);
            }
        }
    }
    return reversed;
};
var _friendlyFormat = function(val) {
    if (val === true || val === 'true')
        return 'Si';
    if (val === false || val === 'false' || val === undefined || val === 'undefined')
        return 'No';
    return val;
};
var _isCheckbox = function($elem) {
    return $elem[0].tagName === 'INPUT' && $elem.attr('type') === 'checkbox';
};
var _isSelect = function($elem) {
    return $elem[0].tagName === 'SELECT';
};
/***
 * 
 * Código de selector de calculos
 * Gestiona los calculos en la barra de calculosﬁ
 * 
 */
var SelectorCalculos = {
    initVars: function(){
        $('.trabajo input[id$=Deleted][value="0"]').each(function(){
            index = parseInt($(this).parents('.trabajo').find('.work-detail-number label').data('index'));
            SelectorCalculos.fillVars(index);
        });        
    },
    
    recalcular: function(obj) {
        //printerCalculation();
        $('.trabajo input[id$=Deleted][value="0"]').each(function(){
            index = parseInt($(this).parents('.trabajo').find('.work-detail-number label').data('index'));
            materalCalculation(index);
        });
    },
    
    getTareas: function(index) {
        var trs = $('#calculation_table_'+index).find('tbody > tr');
        var tareas = [];
        for(var i = 0; i < trs.length; i++) {
            var id = $(trs[i]).attr('id');
            var tarea = id.split('.').pop();
            tareas.push(tarea);            
        }
        return tareas;
    },
    
    fillVars: function(indexTrabajo) {
        // Cargamos valores de variables
        A1 = $('#OrderCantidadCopias').val();
        A2 = $('#OrderOrganizadoEn').val();
        A3 = $('#OrderCantidad').val();
        A4 = $('#OrderFormatoFinalX').val();
        A5 = $('#OrderFormatoFinalY').val();
        A6 = $('#OrderFormatoFinalZ').val();
        A7 = $('#OrderPresentationTypeId').val();
        A8 = $('#WorkDetail'+indexTrabajo+'NoField0').val();
        A9 = $('#WorkDetail'+indexTrabajo+'NoField1').val();
        A10 = $('#WorkDetail'+indexTrabajo+'MaterialId').val();
        A11 = $('#WorkDetail'+indexTrabajo+'Recomendado').val();
        A12 = $('#WorkDetail'+indexTrabajo+'Especificacion').val();
        A13 = $('#WorkDetail'+indexTrabajo+'FormatoAncho').val();
        A14 = $('#WorkDetail'+indexTrabajo+'FormatoAlto').val();
        A15 = $('#WorkDetail'+indexTrabajo+'SangradoX').val();
        A16 = $('#WorkDetail'+indexTrabajo+'SangradoY').val();
        A17 = $('#WorkDetail'+indexTrabajo+'Chapas').val();
        A18 = $('#WorkDetail'+indexTrabajo+'Sobrante').val();
        A19 = $('#WorkDetail'+indexTrabajo+'FrenteYDorso').val();
        A20 = $('#WorkDetail'+indexTrabajo+'FormaDe').val();
        A21 = $('#WorkDetail'+indexTrabajo+'FormaDeAncho').val();
        A22 = $('#WorkDetail'+indexTrabajo+'FormaDeAlto').val();
        A23 = $('#WorkDetail'+indexTrabajo+'DobleCorteAncho').val();
        A24 = $('#WorkDetail'+indexTrabajo+'DobleCorteAlto').val();
        A25 = $('#WorkDetail'+indexTrabajo+'Pinza').val();
        A26 = $('#WorkDetail'+indexTrabajo+'Cola').val();
        A27 = $('#WorkDetail'+indexTrabajo+'CorteAncho').val();
        A28 = $('#WorkDetail'+indexTrabajo+'CorteAlto').val();
        A29 = $('#WorkDetail'+indexTrabajo+'Salen').val();
        A30 = $('#WorkDetail'+indexTrabajo+'Hojas').val();
        A31 = $('#WorkDetail'+indexTrabajo+'Pliegos').val();
        A32 = $('#WorkDetail'+indexTrabajo+'Printer1Id').val();
        A33 = $('#WorkDetail'+indexTrabajo+'Printer2Id').val();
        A34 = $('#WorkDetail'+indexTrabajo+'Printer3Id').val(); 
        // Segundo nivel
        B1 = $('#WorkDetail'+indexTrabajo+'TaskGrapado').val();
        B2 = $('#WorkDetail'+indexTrabajo+'TaskPerforadoTipo').val();
        B3 = $('#WorkDetail'+indexTrabajo+'TaskPerforadoCantidad').val();
        B4 = $('#WorkDetail'+indexTrabajo+'TaskPerforadost').val();
        B5 = $('#WorkDetail'+indexTrabajo+'TaskPerforados').val();
        B6 = $('#WorkDetail'+indexTrabajo+'TaskBarnizuv').val();
        B7 = $('#WorkDetail'+indexTrabajo+'TaskDobladoTipo').val();
        B8 = $('#WorkDetail'+indexTrabajo+'TaskPlastificado').val();
        B9 = $('#WorkDetail'+indexTrabajo+'TaskTroqueladon').val();
        B10 = $('#Troquel'+indexTrabajo+'Bocas').val();
        B11 = $('#WorkDetail'+indexTrabajo+'TaskCalculoGrapado').prop('checked');
        B12 = $('#WorkDetail'+indexTrabajo+'TaskCalculoEmblocado').prop('checked');
        B13 = $('#WorkDetail'+indexTrabajo+'TaskFalsocosido').val();
        B14 = $('#WorkDetail'+indexTrabajo+'TaskCalculoFalsocosido').prop('checked');
        B15 = $('#OrderJuegos').val();
        B16 = $('#WorkDetail'+indexTrabajo+'TaskTroquelados').val();
        // Otros
        TF = $('#color-selection-box-frente-' + indexTrabajo + ' .tinta select option[value!=""]:selected').length;
        TD = $('#color-selection-box-dorso-' + indexTrabajo + ' .tinta select option[value!=""]:selected').length;
        // Colores Frente
        CF0 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail0InkId').val();
        CF1 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail1InkId').val();
        CF2 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail2InkId').val();
        CF3 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail3InkId').val();
        CF4 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail4InkId').val();
        CF5 = $('#WorkDetail'+indexTrabajo+'PantoneFrente1').val();
        CF6 = $('#WorkDetail'+indexTrabajo+'PantoneFrente2').val();
        CF7 = $('#WorkDetail'+indexTrabajo+'PantoneFrente3').val();
        // Colores Dorso
        CD0 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail8InkId').val();
        CD1 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail9InkId').val();
        CD2 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail10InkId').val();
        CD3 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail11InkId').val();
        CD4 = $('#WorkDetail'+indexTrabajo+'InksWorkDetail12InkId').val();
        CD5 = $('#WorkDetail'+indexTrabajo+'PantoneDorso1').val();
        CD6 = $('#WorkDetail'+indexTrabajo+'PantoneDorso2').val();
        CD7 = $('#WorkDetail'+indexTrabajo+'PantoneDorso3').val();
        
        hojasPorJuego();
        cantidadLibretas();
    },
    
    calculateTareas: function(indexTrabajo) {
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function

        SelectorCalculos.fillVars(indexTrabajo);

        // Obtenemos las tareas del workDetail indexTrabajo
        var tareas = SelectorCalculos.getTareas(indexTrabajo);

        // Para cada tarea
        for(var i = 0; i < tareas.length; i++) {
            if(tareas[i] == 'material') continue;
            // Obtenemos formula
            var formula = SelectorCalculos.getFormula(tareas[i]);
            if(!formula) continue;

            var code = 'function formula() { try{ ' + formula + '} catch(e) { alert(e); return 0; } }';
            if(SelectorCalculos.checkSintax(code, tareas[i])) {
                eval('var fn = ' + code);
                // Calculamos resultado
                var result = fn.apply();
                // Seteamos valor en el INPUT
                $('#WorkDetail'+indexTrabajo+'Calculation'+i+'Monto').val(parseFloat(result).toFixed(2));
            }
        }
    },
    
    checkSintax: function(formula, tarea){
        try {
            eval(formula); 
            return true;
        } catch (e) {
            alert('Hay un error de sintaxis en la formula [' + tarea + ']');
            return false;
        }        
    },
    
    calculateImpresion: function(indexTrabajo) {
        // Cargamos valores de variables
        SelectorCalculos.fillVars(indexTrabajo);
        
        // Obtenemos las impresoras
        var p1 = $('#WorkDetail'+indexTrabajo+'Printer1Id').val();
        var p2 = $('#WorkDetail'+indexTrabajo+'Printer2Id').val();
        var p3 = $('#WorkDetail'+indexTrabajo+'Printer3Id').val();
        
        var printers = [p1,p2,p3];
        var total = 0;
        
        // Para cada impresora
        for(var i = 0; i < printers.length; i++) {
            var printer = printers[i];
            if(!printer) continue;
            
            var formula = SelectorCalculos.getFormulaPrinter(printer);
            if(!formula) continue;
            eval('var code = function formula() { try{ ' + formula + '} catch(e) { alert(e); return 0; } }');
            
            if(SelectorCalculos.checkSintax(code, printers[i])) {
                eval('var fn = ' + code);
                // Calculamos resultado
                var result = fn.apply();
                total+= parseFloat(result);
            }
        }

        var item = $('#calculation_table_'+indexTrabajo+' input[value="Impresión"]').closest('tr');
        var index = $('#calculation_table_'+indexTrabajo + ' tr').index(item);

        // Seteamos valor en el INPUT 
        $('#WorkDetail'+indexTrabajo+'Calculation'+index+'Monto').val(total.toFixed(2));
    },

    getFormula: function(tarea){
        if(_FORMULAS_TAREAS_.hasOwnProperty(tarea)){
            return _FORMULAS_TAREAS_[tarea];
        }
        return false;
    },
    
    getFormulaPrinter: function(id) {
        if(_FORMULAS_PRINTERS_.hasOwnProperty(id)){
            return _FORMULAS_PRINTERS_[id];
        }
        return false;
    },
    
    getIvaForWorkType: function(){
        var workTypeId = $('#OrderWorkTypeId').val();
        $.ajax({
            url: BASE_URL + 'workTypes/getiva/' + workTypeId,
            method: 'POST',
            success: function(result){
                var subtotal = $('#Calculation1Monto').val();
                var iva = $.parseJSON(result);
                subtotal = parseFloat(subtotal).toFixed(2);
                IVA = parseFloat(iva).toFixed(2);
                
                if(IVA === 0){
                    $('#OrderExonerado').val(1);
                }else{
                    $('#OrderExonerado').val(0);
                }

                var iva_calculo = subtotal * ( IVA / 100 );

                iva_calculo = iva_calculo.toFixed(2);

                $('#Calculation3Monto').val(iva_calculo);
                SelectorCalculos.calculateTotal();
            },
            error: onAjaxError
        });
    },

    addCalculo: function(onSuccessCb) {
        var index = this.getCalculationIndex();
        var name = $('#calculationName').val();
        if (name !== "") {
            //var newNumber = $("#seleccion-vias input[id$=Deleted][value!=true]").length;
            $.ajax({
                url: BASE_URL + 'orders/addCalculo/' + index + '/' + name + '/true',
                method: 'POST',
                success: function(html) {
                    $('#calculation_table').append(html);
                    if (onSuccessCb)
                        onSuccessCb();
                    $('#calculationName').val('');
                },
                error: onAjaxError
            });
        } else {
            alert('El campo de cálculo debe contener una descripción');
        }
    },
    
    addWorkDetailCalculation: function(newIndex, itemToDuplicate) {
        $.ajax({
            url: BASE_URL + 'calculations/addWorkDetailCalculation/' + newIndex + '/' + itemToDuplicate,
            method: 'POST',
            data: $('form').serializeObject(),
            success: function(html) {
                $('#work_detail_calculation').empty();
                $('#work_detail_calculation').append(html);
                SelectorCalculos.setCalculationsNumbers();
            },
            error: function(err) {
                alert('Ha ocurrido un error al duplicar calculos de Detalle de Trabajo');
                console.log(err);
                unlockWorkDetails();
            }

        });
    },

    removeCalculo: function(index) {
        var $row = $($('#calculation_table tr')[index]);
        $row.addClass('hidden');
        $row.find('input[id$=Deleted]').val(1);
        SelectorCalculos.calculateTotal();
    },

    removeWorkDetailCalculation: function(index) {
        var objectClass = ".calculation_table_" + index;
        $(objectClass).hide();
        $(objectClass + ' input[id$=Deleted]').each(function() {
            $(this).val(1)
        });
        SelectorCalculos.setCalculationsNumbers();
    },

    getCalculationIndex: function() {
        return $("#calculation_table tr").length + 8;
    },

    setCalculationsNumbers: function() {
        /*var newCalculationIndex = 1;
        $('.calculation_title').each(
                function() {
                    if ($(this).parent().is(':visible')) {
                        $(this).html(newCalculationIndex);
                        newCalculationIndex++;
                    }
                }
        )
        linkPliegoFunctionality();*/
        SelectorCalculos.calculateTotal();
    },

    /*
        Calculo de costos de la orden
    */
    calculateTotal: function() {
        var costo = 0;

        $('.sum_cost').parents('tr:visible').find('.sum_cost').each(function(){
            costo += parseFloat($(this).val());
        });

        var divisor = 1;
        var moneda = $('#moneda').val();
        if(moneda == 2){
            divisor = USD_DEL_DIA;
        }

        $('#Calculation0Monto').val(costo.toFixed(2));

        var ganancia = 1 + (parseFloat($('#Calculation2Monto').val()) / 100);

        subtotal = (costo * ganancia) / divisor;
        $('#Calculation1Monto').val(subtotal.toFixed(2));

        IVA_OTRO = subtotal * (IVA / 100);
        $('#Calculation3Monto').val(IVA_OTRO.toFixed(2));

        var costoTotal = subtotal + IVA_OTRO;

        $('#Calculation4Monto').val(costoTotal.toFixed(2));
    },

    countWdCalculations: function(workDetailIndex) {
        return $('#calculation_table_' + workDetailIndex + ' tr').length;
    },


    /***
     * @param {Json} jSon
     * @param {string} eventName
     * @param {string} taskName
     * @param {string} workDetail
     * 
     * @returns {void}
     */
    manageEvent: function(jSon) {
        if (jSon.eventName === 'create') {
            var selector = '#WorkDetail\\.' + jSon.workDetail + '\\.' + jSon.taskName.toLowerCase().replace(' ', '');
            if (!objectExist(selector)) {
                var model = 'WorkDetail.' + jSon.workDetail + '.';
                var calculationObject = '#calculation_table_' + jSon.workDetail;
                //console.log(calculationObject);
                $.ajax({
                    url: BASE_URL + 'orders/addCalculo/' +
                            this.countWdCalculations(jSon.workDetail) +
                            '/' + jSon.taskName + '/false/' + model,
                    method: 'POST',
                    success: function(html) {
                        //console.log(html);
                        $(calculationObject).append(html);
                        /*if (onSuccessCb)
                            onSuccessCb();*/
                    },
                    error: onAjaxError
                });
            } else {
                var calculation = $(selector).removeClass('hidden');
                calculation.find('input[id$=Deleted]').val(0);
            }
        }
        if (jSon.eventName === 'reset') {

            var a = jSon.taskName.toLowerCase();
            var selector = a.replace(/ /g,'');

            var finder = '#WorkDetail\\.' + jSon.workDetail + '\\.' + selector;

            var wDrow = $(finder).addClass('hidden');
            wDrow.find('input[id$=Deleted]').val(1);
        }
    }
};
var objectExist = function(selector) {
    return ($(selector).length === 0) ? false : true;
};
var Order = {
    print_order: function() {
        var object = $('#OrderMainForm').serializeObject();
        //object['data\[duty\]'] = $('#tabs-tareas .panel-content').html();
        object['data\[duty\]'] = JSON.stringify(Order.get_tareas());

        $.ajax({
            url: BASE_URL + 'orders/print_order',
            method: 'POST',
            data: object,
            success: function(data){
/*
                var url = BASE_URL + 'orders/temp';
                var openWindow = open(
                                        url, 
                                        'callScriptPopup', 
                                        'width = 500, height = 500,scrollbars=yes');
                openWindow.document.write(data);
*/
                toPrint(data);
            },
            error: function(){
                alert('error');
            }
        });
    },

    get_tareas: function(){
        var comun = [];
        var detalles = [];
        var works = $('.trabajo').length;
        for (var i = 0; i < works; i++) {
            detalles.push([]);
        };
        $($('#tabs-tareas .panel-content li')).each(function(){
            var a = $(this).contents().eq(1).text();
            if(a.split(',').length >= 2){
                comun.push($(this).html());
            }else{
                for (var i = 0; i < works; i++) {
                    var contador = i + 1;
                    var selector = 'T'+contador;
                    if(a.includes(selector)){
                        detalles[i].push($(this).html());
                    }
                }
            }
        });
        var lista = {'tareas-comunes':comun,'tareas-trabajo':detalles};

        return lista;
    }
};



function fn_DateCompare(DateA, DateB) {     // this function is good for dates > 01/01/1970

    var a = new Date(DateA);
    var b = new Date(DateB);

    var msDateA = Date.UTC(a.getFullYear(), a.getMonth()+1, a.getDate());
    var msDateB = Date.UTC(b.getFullYear(), b.getMonth()+1, b.getDate());

    if (parseFloat(msDateA) < parseFloat(msDateB))
      return -1;  // lt
    else if (parseFloat(msDateA) == parseFloat(msDateB))
      return 0;  // eq
    else if (parseFloat(msDateA) > parseFloat(msDateB))
      return 1;  // gt
    else
      return null;  // error
};


function observeEditable(){
    $('.edit').editable({
        type: 'text',
        title: 'Ingresa el nombre del trabajo',
        success: function(response, newValue) {
            $('#WorkDetail'+$(this).data('index')+'Nombre').val(newValue);
            $('#calculation_label_'+$(this).data('index')).html(newValue);
            if(response.status == 'error') 
                return 'Ha ocurrido un error al intentar guardar el nombre del trabajo';
        },
        error: function(error){
            return 'Ha ocurrido un error al intentar guardar el nombre del trabajo';
        }
    });
}