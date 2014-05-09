
module.exports  = function(){
    var util    = require('util'),
        path    = require('path'),
        os      = require('os'),
        fs      = require('fs'),
        express = require('express');

    var app     = express();
    var inspect = util.inspect;


    app.post('/soundupload',    function(req, res){
        var Busboy  = require('busboy');
        var busboy  = new Busboy( {headers: req.headers}); 
        var title,
            user;

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
            //saving the file
            if (!title) {
                console.log('title not found! ['+title+']');
                title   = path.basename(filename);

            }
            title               = path.join(os.tmpDir(), title);

            // replacing this with static name to see if I can write in dirs
            //file.pipe(fs.createWriteStream(title));
            file.pipe(fs.createWriteStream('usersounds/bla/staticfile.wav'));


            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding);
            file.on('data', function(data){
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function(){
                console.log('File [' + fieldname + '] Finished');
            });


        });

        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated){
            console.log('Field ['+fieldname+']: value: '+inspect(val));
            if (fieldname == 'title'){
                console.log('setting title = '+val);
                title = val;
            }
            if ( fieldname == 'username'){
                console.log('setting user = '+val);
                user    = val;
            }
        });

        busboy.on('finish', function(){
            console.log('Done parsing form!');
            res.send('done uploading sent from server');
            //res.writeHead(303, {Connection: 'close', Location : '/'});
            //res.end();
        });

        req.pipe(busboy);

    });

    return app;
}();

