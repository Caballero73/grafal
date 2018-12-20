function initUploader(medias) {
    var urls = medias.map(function (media) {
        return media.downloadUrl;
    });

    // Buttons inside zoom modal
    var previewZoomButtonClasses = {
        toggleheader: 'btn btn-light btn-icon btn-header-toggle btn-sm',
        fullscreen: 'btn btn-light btn-icon btn-sm',
        borderless: 'btn btn-light btn-icon btn-sm',
        close: 'btn btn-light btn-icon btn-sm'
    };

    // Icons inside zoom modal classes
    var previewZoomButtonIcons = {
        prev: '<i class="icon-arrow-left32"></i>',
        next: '<i class="icon-arrow-right32"></i>',
        toggleheader: '<i class="icon-menu-open"></i>',
        fullscreen: '<i class="icon-screen-full"></i>',
        borderless: '<i class="icon-alignment-unalign"></i>',
        close: '<i class="icon-cross2 font-size-base"></i>'
    };

    // File actions
    var fileActionSettings = {
        zoomClass: '',
        zoomIcon: '<i class="icon-zoomin3"></i>',
        dragClass: 'p-2',
        dragIcon: '<i class="icon-three-bars"></i>',
        removeClass: '',
        removeErrorClass: 'text-danger',
        removeIcon: '<i class="icon-bin"></i>',
        indicatorNew: '<i class="icon-file-plus text-success"></i>',
        indicatorSuccess: '<i class="icon-checkmark3 file-icon-large text-success"></i>',
        indicatorError: '<i class="icon-cross2 text-danger"></i>',
        indicatorLoading: '<i class="icon-spinner2 spinner text-muted"></i>',
        showRemove: true,
        showUpload: false,
        showZoom: true,
        showDrag: false,
        downloadIcon: '<i class="icon-upload"></i>',
        downloadClass: 'btn btn-default btn-prolesa'
    };
    /*******************************/

    $("#documents").fileinput({
        previewFileType: 'image',
        browseLabel: 'Examinar',
        browseIcon: '<i class="icon-file-plus mr-2"></i>',
        removeLabel: 'Eliminar',
        removeClass: 'btn btn-danger',
        removeIcon: '<i class="icon-cancel-square mr-2"></i>',
        uploadClass: 'btn btn-success',
        uploadIcon: '<i class="icon-file-upload mr-2"></i>',
        /*layoutTemplates: {
         icon: '<i class="icon-file-check"></i>',
         modal: modalTemplate
         },*/
        mainClass: 'input-group',
        previewZoomButtonClasses: previewZoomButtonClasses,
        previewZoomButtonIcons: previewZoomButtonIcons,
        fileActionSettings: fileActionSettings,

        browseClass: 'btn bg-primary',
        language: "es",
        uploadUrl: $("#documentsForm").attr('action'),
        uploadExtraData: function () {
            var out = {
                /*mediableType: vm.mediableType,
                 mediableId: vm.mediableId,
                 mediableAlbum: vm.mediableAlbum*/
            };
            return out;
        },
        deleteUrl: BASE_URL + 'archivos/delete',
        deleteExtraData: function () {
            var out = {
                /*mediableType: vm.mediableType,
                 mediableId: vm.mediableId,
                 mediableAlbum: vm.mediableAlbum*/
            };
            return out;
        },
        initialPreview: urls,
        initialPreviewAsData: true,
        initialPreviewConfig: medias,
        overwriteInitial: false,
        maxFileSize: 10240,
        initialCaption: "Selecciona un archivo",
        minFileCount: 0,
        maxFileCount: 15,
        validateInitialCount: true,
        //allowedFileExtensions: vm.allowedFileExtensions,
        removeFromPreviewOnError: true,
        showRemove: false,
        showUpload: true,
        /*actionDelete: {
            dataUrl: BASE_URL + 'archivos/delete'
        }*/
        //allowedFileExtensions: ["jpg", "png", "gif"]
    }).on('filebeforedelete', function () {

    }).on('filedeleted', function (event, key, jqXHR, data) {

    }).on('fileuploaded', function(event, data, previewId, index) {
        var archivoId = data.response.id;
        $.ajax({
          type: "POST",
          url: BASE_URL + 'orders/addArchivo/' + $('#orderId').val() + '/'+ archivoId + '/' + $('#esMuestra').val(),
          success: function(res){
          },
          dataType: 'json'
        });
    });
}

$(document).ready(function () {

    $.getJSON( BASE_URL + 'archivos/listArchivos/' + $('#orderId').val() + '/' + $('#esMuestra').val(), function( data ) {
        initUploader(data);
        $('#documentContainer').show();
    });

});
    