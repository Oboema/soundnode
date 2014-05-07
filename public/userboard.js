var server  = "http://mcmuffin.student.utwente.nl:8080";
var user;

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
/*
// The logic below doesn't deserve the name. Restructure that shit!

    if( this.user ){        // if we have a user
        console.log('user: '+this.user);
        if (this.hash !== '#'+this.user){           // user and hash are not identical
            if(! this.hash){                             // if hash is empty (expected)

                this.hash   = '#'+this.user;        // update the hash  
                document.location.hash  = this.hash;    // and the page URL
                this.hideUserInput();

            }else{  // hash != user, throw error

                console.log('Got user ['+this.user+'] and non-empty hash ['+this.hash+']. '+
                            'I don\'t expect this to happen');
                alert('something broke, kick the developer');
            }
        }else{  //user and hash are identical, updateState() was called but nothing to do
            // I guess I'll see what to put here later when things start breaking
            console.log('UpdateState() called but everything is fine. '+
                        'Maybe some divs are hidden/unhidden while they shouldn\'t?');
        }


    }else{      //no user! 
        if(this.hash){
            var tmp_user    = this.hash.substring(1);    //get user from hash
            if( this.validateUser(tmp_user) ){
                this.user   = tmp_user;
                // something goes wrong here
                // Put the hide/unhide stuff in a function, copied it from ~10 lines above
                this.usernameInputEl.css( 'display',  'none');   //hide/unhide shit
                $('#username').html(this.user);
                $('#username').css( 'display', 'block');
            }

        }
        this.usernameInputEl.css('display','block');    // Display the input box
        $('#username').css('display', 'none');          // Hide the Username div
    }
}
*/


UserboardInterface.prototype.validateUser = function(username){
    return username.match(/^[a-z][a-z-_]+$/i);
}

UserboardInterface.prototype.inputUser = function(){

    // defining this in the 'constructor', if it's here I get undefined errors
    //this.usernameInputEl  = $('#input-username');
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
