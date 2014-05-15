
$(function(){
	$('#soundboard').click(function(){
		console.log('ducoment location ['+window.location+']');
		window.location = window.location + 'userboard';
	});

	$('#player').click(function(){
		window.location = window.location + 'player';
	});

});
