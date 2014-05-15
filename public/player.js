//$(function()) == document.onload: function()
// makes buttons from audio elements
function updateButton(id){
	$('#'+id).removeAttr("controls");
}

function PlayerboardInterface(){
    this.config  = new ClientConfig().config;
    this.socket  = io.connect(this.config.host);
    this.player  = null;
    this.soundlist = [];



    var _this = this;
    $('#input-playername').change(function() { _this.inputPlayer()}); //this.usernameInputEl) });

    this.socket.on('blah', function(data){
        console.log('blah ['+data.blah+']');
    });

    this.socket.on('play', function(data){
        console.log('have to play ['+data.sound+']');
        $('#'+data.sound)[0].play();
    });

    this.socket.on('load sounds', function(data){

        _this.loadSounds(data.config, _this);
    });
}


//might want the option to delete sounds on client disconnect. Maybe later =p
PlayerboardInterface.prototype.loadSounds = function(config, _this){
    var user   = config.user;
    var sounds = config.sounds;

    console.log('loaded user ['+user+'] with sounds ['+sounds+']');
    
    sounds.forEach(function(sound){
        var button_id = user+'-'+sound.file_hash;
        if(! document.getElementById(button_id)){
            var audioElString = '<audio id='+button_id+' controls><source src="sound/'+user+
                '/'+sound.file_hash+'" type="'+sound.mimetype+'"></audio>';
            $('#sounds').append(audioElString);        
        }

    });
};


PlayerboardInterface.prototype.validatePlayer = function(name){
    return name.match(/^[a-z][a-z-_]+$/i);
}


PlayerboardInterface.prototype.inputPlayer = function(){
    var playerEl = $('#input-playername');

    var playername = playerEl.val().toLowerCase();
    //console.log('validating playername ['+playername+']');
    if(this.validatePlayer(playername)){
        this.player = playername;
        //console.log('saving the player name ['+this.player+']');
        $('#player-select').css('display', 'none');
        $('#playername h1').html(this.player+'-Player');
        this.socket.emit('player logon', {player : this.player});
    }
}



$(document).ready(function() {
    playerboard   = new PlayerboardInterface();
        

});
