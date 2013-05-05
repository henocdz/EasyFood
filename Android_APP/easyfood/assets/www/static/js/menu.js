if(navigator.notification)
	document.addEventListener('deviceready',ready,false);
else
	$(goQuery);

function ready(){
	$(goQuery);
}

function goQuery(){

	if(!localStorage.logged)
		location.href = 'index.html';

	if(!socket){
		alertify.alert('No se pudo conectar al servidor, contacte a un mesero.')
		location.href = 'standby.html'
	}

	$('#cliente-nombre').text(localStorage.cliente);
	$('#mesa-numero').text(JSON.parse(localStorage.mesa).numero);


	socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })

	socket.on('mesa_socket_changed_ok',function(info){
		if(info.cliente == null){
			destroySession();
			location.href = 'index.html'
		}
	})


	socket.on('connect',function(){
		if(localStorage.serverDown){
			localStorage.serverDown = false;
			var m = JSON.parse(localStorage.mesa);
			socket.emit('mesa_socket',{'mesa_id': JSON.parse(localStorage.mesa).numero })
			socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })
			socket.emit('new_mesa',{'numero': m.numero, 'estado': m.estado, 'capacidad':m.capacidad})
		}
	})

	socket.on('disconnect',function(err){ //El servidor cae
		$('#error-fs').fadeIn();
		$('#error-fs').html('<p></p><p></p><p>Ups!</p><p>Hemos perdido conexi&oacute;n con el servidor</p><p>Espere un momento por favor.</p>')

		localStorage.serverDown = true;
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
		
		$(document).scrollTop(0);
		$('nav#menu').stop();

		if(visible == 'block'){
			console.log(-wiwi+'px')
			$('nav#menu').animate({
				right: -wiwi
			},'slow',function(){
				nav.css('display','none');
			})
		}
		else{
			nav.css('display','block');
			$('nav#menu').animate({
				right: 0
			},'slow',function(){})
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

} //Fin goQuery


function repos(){

	var fixT = $('#fix').height();
	$('#main').css('margin-top',fixT+16);

	/* REPOSICIONAR GEAR (opciones) ICON */

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
	var docH = $(document).height() - fixT;

	menu.css({
		height: docH,
		top: fixT
	})
}
