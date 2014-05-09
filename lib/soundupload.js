
module.exports  = function(){
    var util    = require('util'),
        path    = require('path'),
        os      = require('os'),
        fs      = require('fs'),
        express = require('express'),
        date    = new Date();

    var app     = express();
    var inspect = util.inspect;

    var download_dir    = "usersounds";

        // testing file write
    function checkUserDir(dir_path){
        // Create user dir if it's not there
        fs.stat( dir_path, function(err, stats){
            if(!err && stats.isDirectory()){    //user dir exists
                console.log('user dir already exists, nothing to do.');
            }else{
                console.log('creating user dir ['+dir_path+']');
                fs.mkdir(dir_path);   
            }
        });
    }

    function addFileToConfig(user, title, file_hash){
        console.log('add file to config');
        // write to some json config file

    }

    function writeFile(file, user, title){
        console.log('datetime: ['+ toString(date.getTime())+']');
        var dest_dir    = path.join(download_dir, user),
            num         = Math.floor(Math.random()*16768),
            hash        = String(num) + String(date.getTime()),
            dest        = path.join(dest_dir, hash);

        user        = user.substring(0,30);     //don't want long usernames

        checkUserDir(dest_dir);
        console.log("random filename = ["+hash+']');

        addFileToConfig(user, title, num);

        file.pipe(fs.createWriteStream(dest));
    }    

    app.post('/soundupload',    function(req, res){
        var Busboy  = require('busboy');
        var busboy  = new Busboy( { headers : req.headers });
/*                                    ,limits  : { fileSize  : 1*1024*1024}
                                }); 
*/      var title,
            user,
            dest,
            error;


        busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
            
            //saving the file
            if (!title) {   // use filename if no title is supplied
                console.log('title not found! ['+title+']. Setting title = '+filename);
                title   = filename; 
            }

            if (user) {     //
                console.log('filename: ' + filename + ', encoding: ' + encoding + ', mimeType: ' + mimetype);
                console.log('== User ['+user+']\n== Title ['+title+']\n== Dest ['+dest+']');
 
               // writing file
                console.log('Writing to file ['+ dest +']');
                writeFile(file, user, title);
                
            }
            
            file.on('data', function(data){
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            
            // fires @EOF
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

