//alert("brah!");

//var server  = "dev:8080";
//var server  = "http://localhost:8080";
var server  = "http://mcmuffin.student.utwente.nl:8080";

function msgReceived(msg){

    console.log("msg received on client: "+ msg+ " :");
    $clientCounter.html(msg.clients);
}

function clickReceived(msg){
    console.log("button clicked on client: "+ msg.button +" :");
    $('.button').removeClass('clicked');
    $("#"+msg.button).addClass('clicked');

}


function buttonClicked(socket){
    /*
    buttons = document.getElementByClass("button");
    buttons.forEach(function(button){
        console.log(button);
    });
    $(document).click(function(e){
        console.log(e);
        console.log(e.target);
        console.log($(e.target));
        console.log($(e.target).text());
    });
    */
    $("div").click(function(){
        var my_button   = $(this).attr("id");
        
        console.log(my_button);
        socket.emit("click event", my_button);


        /*
        my_button.forEach(function(but){
            console.log(but);
        });
        */

    });
}
    

$(document).ready(function () {
    $clientCounter  = $("#client_count");
    $clientCounter.html("jemoeder"); //this arrives!
    
    //var socket  = new io.Socket("http://mcmuffin.student.utwente.nl", {port:8080});
    //var socket  = new io.Socket(null, {port:8080});
    var socket  = io.connect(server);
    socket.on('message', function(msg){msgReceived(msg)});
    socket.on('click event', function(button){clickReceived(button)});

    buttonClicked(socket);
    /*
     * socket.on('message', function(msg){
        console.log(msg);
        $clientCounter.html(msg)});
        */
});
