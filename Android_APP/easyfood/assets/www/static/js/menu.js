if(navigator.notification)
	document.addEventListener('deviceready',ready,false);
else
	$(goQuery);


var socket;

function ready(){
	$(goQuery);
}

function goQuery(){

	if(!localStorage.logged)
		location.href = 'index.html';

	if(!socket){
		alertify.alert('No se pudo conectar al servidor, contacte a mesero.')
		location.href = 'standby.html'
	}

	$('#cliente-nombre').text(localStorage.cliente);
	$('#mesa-numero').text(localStorage.mesa.numero);


	socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })

	socket.on('mesa_socket_changed_ok',function(info){
		console.log(info)
	})

	$('#menu-ops-select>select').ddslick({
		onSelected: function(info){ //Cuando cambie seleccion
			var selectedValue = info.selectedData.value; 
			/*navigator.notification.alert(selectedValue,null,"Prueba","Hola")*/
		},
		width: "100%",
	});


	$('.options-btn').on('click',function(){
		var nav = $('nav#menu');
		var visible = nav.css('display');
		var wiwi = $(document).width();
		
		if(visible == 'block'){
			nav.animate({
				rigth: -wiwi+'px'
			},'slow',function(){nav.css('display','none');})
		}
		else{
			nav.animate({
				rigth:0
			},'slow',function(){nav.css('display','block');})
		}
	})


	$('.view-block').on('click',function(){
		$('.menitem').removeClass('list');
		$('.menitem').addClass('box');
		
		$('.menitem').each(function(){
			var self = $(this);
			var h2 = self.children('.desc').children('h2')
			var cpy = h2.clone();

			h2.remove();
			
			cpy.prependTo(self)
		})
		resizeMenu();
	})

	$('.view-horizontal').on('click',function(){
		$('.menitem').removeClass('box');
		$('.menitem').addClass('list');

		$('.menitem').each(function(){
			var self = $(this);
			var h2 = self.children('h2')
			var cpy = h2.clone();

			h2.remove();
			
			cpy.insertBefore($('.desc p:first-child'))
		})
		resizeMenu();
	})

	repos();

}


function repos(){

	var fixT = $('#fix').height();
	$('#main').css('margin-top',fixT+16);

	/* REPOSICIONAR GEAR ICON */

	var gearC = $('.options-btn');
	var gear = gearC.children('img');
	var gearCH = gearC.height();
	var gearH = gear.height();
	gear.css('margin-top',(gearCH-gearH)/2)

	resizeMenu();
	
}


function resizeMenu(){
	/*Resize Menu*/
	var fixT = $('#fix').height();
	var menu = $('nav#menu');
	var docH = $(document).height();

	menu.css({
		height: docH,
		top: fixT
	})
}
