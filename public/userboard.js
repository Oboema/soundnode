function UserboardInterface(){
    this.config  = new ClientConfig().config;
    this.host    = this.config.host;
    this.hash    = document.location.hash,
    this.user    = null;
    this.socket  = io.connect(this.host);

    this.usernameInputEl  = $('#input-username');
    // fire our user check function when a username is put in the box
    var self    = this;
    this.usernameInputEl.change(function() { self.inputUser()}); //this.usernameInputEl) });

    this.updateState();
    this.formHandler();
    this.socketListeners();
}

UserboardInterface.prototype.updateConfig = function(userconf){
    this.userconf = userconf;

    var _this = this;
    $('#sounds').html('');
    this.userconf.sounds.forEach( function(sound){
        console.log("this.config.sound["+sound.title+'] @ ['+sound.file_hash+']');
            $('#sounds').append('<audio controls><source src="sound/'+_this.user+'/'+sound.file_hash+'" type="audio/wav"></audio>');
        });
    // this.userconf   = 
}

UserboardInterface.prototype.socketListeners = function(){
    var _this = this;

    //this.socket.on('config', function(msg){_this.updateConfig(msg)});

    this.socket.on('bootstrap', function(msg){
        console.log('got bootstrap: '+ msg.username); 
        _this.socket.emit('bootstrap', {user: _this.user});
    });

    this.socket.on('update config', function(config){
        _this.updateConfig(config);
    });


}

UserboardInterface.prototype.jsonReq = function(url){
    console.log('this.host ['+this.host+']');
    console.log('requesting ['+url+']');
    var json = (function(){
        var json = null;
        $.ajax({
            'async' : false,
            'global': false,
            'url'   : url, //host+'/config/'+user,
            'dataType' : "json",
            'success' : function(data){ 
                console.log('Got a JSON response: ['+data+']');
                json = data; },
        });
        return json;
    })();
    console.log('json: '+ json);
    return json;
}

UserboardInterface.prototype.getUserSounds  = function(){

}
// maybe the next two function could be merged as toggleGuiVisibility or smt
UserboardInterface.prototype.showUserInput  = function(){
    this.usernameInputEl.css( 'display',  'block');  // show input box 
    $('#username').css( 'display', 'none'); // hide name div
    $('#upload').css(   'display', 'none'); // hide upload form
}

UserboardInterface.prototype.showUserBoardGui = function(){
    this.usernameInputEl.css( 'display',  'none');  // hide input box 

    $('#username').html(this.user);          // update name div

    $("#hidden_username").attr("value", this.user); // dirty hack to pass the username to the form handler

    $('#username').css( 'display', 'block'); // show name div
    $('#upload').css(   'display', 'block'); // show upload form
    
    // this function gets called from updateState if a username was obtained from either
    // this.user or this.hash. I'm not sure if avoiding code duplication
    // by putting code in unrelated functions is too much of an "ends justify the means"
    // kind of thing though. I guess you can justify it as config updates (will) trigger
    // sound button updates (in the future), which are part of the GUI
    this.socket.emit('bootstrap', {user: this.user});

}

UserboardInterface.prototype.updateState = function(){

    if( this.hash ){
        console.log('got hash: ['+this.hash+']');
        var tmp_user    = this.hash.substring(1);    //get user from hash
        if( this.validateUser(tmp_user) ){
            this.user   = tmp_user;
            this.showUserBoardGui();
        }
    } else if( this.user ){
        console.log('got user: ['+this.user+']');
        this.hash   = '#' + this.user;
        document.location.hash  = this.hash;    // and the page URL
        this.showUserBoardGui();
    } else {
        this.showUserInput();
    }
}

UserboardInterface.prototype.validateUser = function(username){
    return username.match(/^[a-z][a-z-_]+$/i);
}

UserboardInterface.prototype.inputUser = function(){

    username    = this.usernameInputEl.val();

    if( this.user ){    //if we already have a user 
        console.log('We already have user ['+this.user+']. Should not be in inputUser()');

    }else if( this.validateUser(username) ){
            this.user = username;
            this.updateState();
    }else {
        alert('[ '+username +' ] is not a valid username.');
    }

}

UserboardInterface.prototype.formHandler = function(){
    this.formEl  = $('#uploadform');
    console.log('formEl = ['+this.formEl+']');

    var _this = this; //seriously this is getting on my nerves
    this.formEl.submit(function (e) {       
        e.preventDefault();
        var data  = new FormData($(this)[0]);
        console.log('form data ['+data+']');
        $.ajax({
            url         : '/soundupload',
            data        : data,
            user        : this.user,
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
    });

}

$(document).ready(function() {
    userboard   = new UserboardInterface();
        

});
