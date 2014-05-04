console.log('loading some js');

$(document).ready(function() {
    var formEl  = $('#uploadform');
    console.log('formEl = ['+formEl+']');
    
    formEl.submit(function (e) {
        e.preventDefault();
        var data  = new FormData($(this)[0]);
        console.log('form data ['+data+']');
        $.ajax({
            url         : '/soundupload',
            data        : data,
            processData : false,
            contentType : false,
            //contentType : 'multipart/form-data', //false,
            mimeType    : 'multipart/form-data',
            type        : 'POST',
            success     : function(data){
                console.log(data);
            }
        });
    });
});
