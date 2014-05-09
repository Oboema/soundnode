
module.exports  = function(){
    var util    = require('util'),
        path    = require('path'),
        os      = require('os'),
        fs      = require('fs'),
        express = require('express');

    var app     = express();
    var inspect = util.inspect;

    var download_dir    = "usersounds";


    app.post('/soundupload',    function(req, res){
        var Busboy  = require('busboy');
        var busboy  = new Busboy( { headers : req.headers,
                                    limits  : { fileSize  : 1*1024*1024}
                                }); 
        var title,
            user,
            dest,
            error;

        // testing file write


        busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
            //saving the file
            if (!title) {   // use filename if no title is supplied
                console.log('title not found! ['+title+']');
                title   = filename; 
            }
            if (user) {     //
                user    = user.substring(0,30);
                dest    = path.join('.',download_dir, user, title);

                console.log('user ['+user+']\ntitle ['+title+']\ndest ['+dest+']');
                
                // Create user dir if it's not there
                fs.exists( path.dirname(dest), function(exists){
                    if(!exists){    //user dir does not exist
                        console.log('creating user dir ['+path.dirname(dest)+']');
                        fs.mkdir(path.dirname(dest));   
                    }
                });
                
                // Check if same file already exists.
                // Maybe just random-hash the files, as button names should be a
                // changable attribute in the end. Then file names do not matter
                // and checking for same name files is only needed to guarantee a
                // unique filename
                // TODO
                fs.exists(dest, function(exists){
                    if(!exists){
                        console.log('Writing to file ['+ dest +']');
                        file.pipe(fs.createWriteStream(title));
                    } else {
                        console.log('file already exists! Not saving.');
                        file.resume();  // throw away the file
                    }
                });

                console.log('filename: ' + filename + ', encoding: ' + encoding + ', mimeType: ' + mimetype);
            } else {
                //error!
                error   = "Error processing, No user found!";
                console.log("error, throwing away file");
                file.resume();  // discard the bytes as per busboy instructions
            }

            
            file.on('data', function(data){
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function(){
                if(file.truncated){
                    console.log('File ['+ fieldname +'] was truncated. Discarding');
                    fs.unlink(dest, function(err){
                        console.log('error removing file ['+dest+']');
                    });
                }
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
            if(error){
                console.log('Got error ['+error+']');
                res.send('Error! ['+error+']');
            } else {
                res.send('done uploading sent from server');
            }
        });

        req.pipe(busboy);

    });

    return app;
}();

