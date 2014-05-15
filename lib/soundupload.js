
module.exports  = function(){
    var util    = require('util'),
        path    = require('path'),
        os      = require('os'),
        fs      = require('fs'),
        express = require('express');

    var app     = express();
    var inspect = util.inspect;

        var user_sound_dir = "usersounds",
        user_config_dir    = "userconfig";


    // TODO :Move all the config file code to a different library file.
    // Pass a user config object to this file, so we have a cleaner
    // separation between sound file uploading and config processing.
    // Also, we don't have to open the damn config file for every transaction
    // BUG: if file is too big, it gets deleted, but is still added to config.
    function addSoundToConfig(user, mimetype, title, file_hash){
        user_config_file = path.join(user_config_dir, user+'.json');
        var user_config  = JSON.parse(fs.readFileSync(user_config_file));

        //user_setting.user   = user;
        user_config.sounds.push( {  'title' : title, 'file_hash' : file_hash,
                                    'mimetype' : mimetype } );

        fs.writeFileSync(user_config_file, JSON.stringify(user_config) );
    }

    function writeSound(file, mimetype, user, title){
        var date    = new Date();
        console.log('datetime: ['+ String(date.getTime())+']');
            var num = Math.floor(Math.random()*16768),
            hash    = String(num) + String(date.getTime()),
            dest    = path.join(user_sound_dir, user, hash);
            
        console.log("random filename = ["+hash+']');
        console.log('== User ['+user+']\n== Title ['+title+']\n== Dest ['+dest+']');

        addSoundToConfig(user, mimetype, title, hash);

        file.pipe(fs.createWriteStream(dest));

        return dest;
    }    

    app.post('/soundupload',    function(req, res){
        var Busboy  = require('busboy');
        var busboy  = new Busboy( { headers : req.headers 
                                    ,limits  : { fileSize  : 1*1024*1024}
                                }); 
        var title,
            user,
            sound_dest,
            error;


        busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
            
            console.log('mimeType: ['+mimetype+']');
            //saving the file
            if (!title) {   // use filename if no title is supplied
                console.log('title not found! ['+title+']. Setting title = '+filename);
                title   = path.basename(filename, path.extname(filename)); 
            }

            if (user) {     // Only write the sound file if we have a user
                sound_dest  = writeSound(file, mimetype, user, title);
            }
            
            // This could be deleted I guess.
            file.on('data', function(data){
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            
            // fires @EOF
            file.on('end', function(){

                if(file.truncated){
                    console.log('File ['+ fieldname +'] was truncated. Discarding');
                    fs.unlink(sound_dest, function(err){
                        console.log('error removing file ['+sound_dest+'].\n'+
                                     'got error ['+err+']');
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
                res.send('Server says: Upload Finished!');
            }
        });

        req.pipe(busboy);

    });

    return app;
}();

