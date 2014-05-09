var server  = "http://mcmuffin.student.utwente.nl:8080";
var user;

config  = new ClientConfig();
console.log('host from clientconfig = [' + config.host + ']');

function UserboardInterface(){
    this.hash    = document.location.hash,
    this.user    = null;
    this.usernameInputEl  = $('#input-username');

    this.updateState();

    // fire our user check function when a username is put in the box
    var self    = this;
    this.usernameInputEl.change(function() { self.inputUser()}); //this.usernameInputEl) });

    // shit will break here probably due to 'this' namespace happiness
    this.formHandler();

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
            this.user   = username;
            this.updateState();
    }else {
        alert('[ '+username +' ] is not a valid username.');
    }

}

UserboardInterface.prototype.formHandler = function(){
    this.formEl  = $('#uploadform');
    console.log('formEl = ['+this.formEl+']');

    // Shit might hit the fan here with 'this' being changed from namespace etc. 
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
                console.log(data);
            }
        });
    });

}

$(document).ready(function() {
    userboard   = new UserboardInterface();
        

});
