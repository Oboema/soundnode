function UserboardInterface(){
    this.config  = new ClientConfig().config;
    this.host    = this.config.host;
    // this.hash    = window.location.hash;
    this.player  = null;
    this.user    = null;
    this.socket  = io.connect(this.host);


    this.usernameInputEl    = $('#input-username');
    this.playernameInputEl  = $('#input-playername');
    // this.usernameInputContainerEl =$('#input-username-container');

    // fire our user check function when a username is put in the box
    var self    = this;
    this.usernameInputEl.change(function() { 
        self.inputUser(self)
    });
    
    this.playernameInputEl.change(function() {
        self.selectPlayer(self)
    });

    $('#upload_popup').click(function(){
        console.log('clicked upload dialog');
        if( self.user){
            $('#upload_form_container').css('display', 'block');
        }
    });

    $('#close_upload_form_container').click(function(){
        $('#upload_form_container').css('display', 'none');
    });



    this.updateState();
    this.formHandler();
    this.socketListeners();
}

UserboardInterface.prototype.updateSounds = function(userconf, _this){
    $('#sounds').html('');
    // userconf.sounds.forEach( function(sound){`
    for(var i = 0; i < userconf.sounds.length; i++){
        sound = userconf.sounds[i];    
        console.log('adding sound ['+sound.title+']');
        var button_id = _this.user+'-'+sound.file_hash;
        var button_html =   '<div id="'+button_id+'"class="pure-u"> '+
                                '<span id="sound-button-'+i+'" class="pure-button sound-button sound-button-with-icon sound-button-with-text" >'+
                                    '<span>'+
                                        '<i class="sound-button-icon fa fa-fw fa-bell fa-lg"></i>'+
                                        '<span class="sound-button-text">'+sound.title+'</span>'+
                                        '<span class="playing_button ">&#xf04b</span>'+
                                    '</span>'+
                                '</span>'+
                            '</div>'; 
       $('#sounds').append(button_html);
        _this.setButtonListener( $('#'+button_id), _this.socket);
    };
}


UserboardInterface.prototype.setButtonListener = function(button, socket){
    var data = {    'button_id' : button.attr('id'),
                    'socket'    : socket};

    button.click(data, function(info){
        console.log('sending play id = ['+info.data.button_id+']');
        //console.log('in button listener, id: ['+$(this).find("span.playing_button").attr('class')+']');
        $(this).find(".playing_button").addClass('playing'); // show the play thing
        
        info.data.socket.emit('play', {'sound' : info.data.button_id});

    });
}

UserboardInterface.prototype.socketListeners = function(){
    var _this = this;

    this.socket.on('lulz', function(msg){
        console.log('got lulz ['+msg.lulz+']');
    });

    this.socket.on('bootstrap', function(msg){
        console.log('got bootstrap: '+ msg.username); 
        _this.socket.emit('bootstrap', {user: _this.user});
    });

    this.socket.on('update config', function(config){
        _this.updateSounds(config, _this);
    });

    this.socket.on('sound stopped', function(msg){
        console.log('server said sound ['+msg.sound+'] has stopped playing');
        $('#'+msg.sound).find(".playing_button").removeClass('playing'); // hide the play thing
        // console.log('brah ['+brah.attr('class')+']' );
    });

    this.socket.on('user to player signup', function(data){
        //_this.player = data.player;
        //_this.updateState();
    });
}


UserboardInterface.prototype.updateState = function(){
    if(jade_data.player){   this.player = jade_data.player;}
    if(jade_data.user){     this.user   = jade_data.user;}
    
    if(this.player){
        console.log('player ['+this.player+']');
        $('#input-playername-container').css('display', 'none');
    }else{
        console.log('no player');
        $('#input-playername-container').css('display', 'block');
    }
    if (this.user){
        console.log('user ['+this.user+']');
        $('#hidden_username').attr('value', this.user);
        this.socket.emit('bootstrap', {user: this.user});
        $('#input-username-container').css( 'display',  'none');  // hide user input box 
    }else{
        console.log('no user');
        $('#input-username-container').css( 'display',  'block');  // show user input box 
        $('#input-playername-container').css('display', 'none');
    }

    if(this.user && this.player){
        this.socket.emit('user to player signup', 
            {player : this.player, user : this.user}
        );

    }
    
}

// DRY this shit by passing a variable or smt
UserboardInterface.prototype.inputUser = function(self){
    window.location = window.location.origin+'/userboard/'+
                        self.usernameInputEl.val().toLowerCase()+'/';
}

UserboardInterface.prototype.selectPlayer  = function(self){
    window.location =   window.location.origin+'/userboard/'+
                        self.user+'/'+self.playernameInputEl.val().toLowerCase()+'/';
}


UserboardInterface.prototype.formHandler = function(){
    this.formEl  = $('#uploadform');
    console.log('formEl = ['+this.formEl+']');

    var _this = this; //seriously this is getting on my nerves
    this.formEl.submit(function (e) {       
        e.preventDefault();
        console.log('uploading file ['+e.target.elements[3].value+'] from user ['+_this.user+']');
        if(e.target.elements[3].value){ // if there's a file in the upload box
            var data  = new FormData($(this)[0]);
            $.ajax({
                url         : '/soundupload',
                data        : data,
                user        : _this.user,
                processData : false,
                contentType : false,
                //contentType : 'multipart/form-data', //false,
                mimeType    : 'multipart/form-data',
                type        : 'POST',
                success     : function(data){
                    if(data === 'Server says: Upload Finished!'){
                        _this.socket.emit('update config','placeholder');
                    }
                }
            });
        }

    });

}

$(document).ready(function() {
    userboard   = new UserboardInterface();
        

});
