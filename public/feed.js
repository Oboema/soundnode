//alert("brah!");

function msgReceived(msg){

    console.log("msg received on client: "+ msg+ " :");
    $clientCounter.html(msg.clients);
}

function buttonClicked(){
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
        var my_button   = $(this).attr("class");
        
        console.log(my_button);

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
    
    buttonClicked();
    //var socket  = new io.Socket("http://mcmuffin.student.utwente.nl", {port:8080});
    //var socket  = new io.Socket(null, {port:8080});
    var socket  = io.connect('http://mcmuffin.student.utwente.nl:8080');
    socket.on('message', function(msg){msgReceived(msg)});
    /*
     * socket.on('message', function(msg){
        console.log(msg);
        $clientCounter.html(msg)});
        */
});
