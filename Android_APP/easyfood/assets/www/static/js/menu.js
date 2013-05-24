if(navigator.notification) //Se ejecuta desde Phonegap
	document.addEventListener('deviceready',ready,false);
else //Pruebas
	$(goQuery);

function ready(){
	$(goQuery);
}

function goQuery(){

	//El usuario no esta registrado
	if(!localStorage.logged)
		location.href = 'index.html';

	if(!socket){ //No se puede conectar al servidor
		alertify.alert('No se pudo conectar al servidor, contacte a un mesero.')
		location.href = 'registrar.html'
	}


	localStorage.platillos = JSON.stringify({});

	//Asignar nombre de cliente y numero de mesa en GUI
	$('#cliente-nombre').text(localStorage.cliente);
	//$('#mesa-numero').text(JSON.parse(localStorage.mesa).numero);
	$('#mesa-numero').text(localStorage.orden);



	var m = JSON.parse(localStorage.mesa);

	socket.emit('new_mesa',{'numero': m.numero, 'estado': 1, 'capacidad':m.capacidad})
			
	//Se indica al servidor que la mesa N ha cambiado de socket (pagina)
	socket.on('mesa_created',function(e){
		socket.emit('mesa_socket',{'mesa_id': m.numero })
		//socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })
	})

	//Se registra el cambio correcto del socket
	socket.on('mesa_socket_changed_ok',function(info){
		if(info.cliente == null){
			destroySession();
			location.href = 'index.html'
		}
	})


	socket.on('connect',function(){

		$('#error-fs').fadeOut();
		//Al reconectar el servidor
		if(localStorage.serverDown){
			localStorage.serverDown = false;
			var m = JSON.parse(localStorage.mesa);
			//Se registra la mesa
			socket.emit('new_mesa',{'numero': m.numero, 'estado': 1, 'capacidad':m.capacidad})
			

			socket.on('mesa_created',function(e){
				socket.emit('mesa_socket',{'mesa_id': m.numero });
				//socket.emit('new_cliente',{'nombre': localStorage.cliente, 'mesa': localStorage.mesa })
				//socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })
			})

			
		}
	})

	//Se desconecta del servidor
	socket.on('disconnect',function(err){
		$('#error-fs').fadeIn();
		$('#error-fs').html('<p></p><p></p><p>Ups!</p><p>Hemos perdido conexi&oacute;n con el servidor</p><p>Espere un momento por favor.</p>')

		localStorage.serverDown = true;
	}) //Fin socket desconectado

	socket.on('closeOrder',closeOrder);

	$('.confirmar_btn').on('click',function(){


		var ps = JSON.parse(localStorage.platillos);
		if(JSONlength(ps) > 0){

			$('#error-fs').fadeIn();
			$('#error-fs').html('<h2>Espere un momento...</h2>')


			socket.emit('add_platillo',{'platillos': localStorage.platillos,'cliente': localStorage.cliente + '_' + localStorage.orden });

			socket.on('platillos_agregados',function(){
				$('#error-fs').fadeOut();
				$('.p-orden').remove();
				$('.confirmar_btn').fadeOut();

				alertify.success('Platillos agregados');

				localStorage.platillos = JSON.stringify({});

				socket.removeEventListener('platillos_agregados');

				
			})

		}else{
			$(this).fadeOut();
		}

		return false;

	})



	$('#menu-ops-select>select').ddslick({
		onSelected: function(info){ //Cuando cambie seleccion
			var selectedValue = info.selectedData.value;

			obtenerPlatillos(selectedValue);

			/*navigator.notification.alert(selectedValue,null,"Prueba","Hola")*/
		},
		width: "100%",
	}); //Fin cambio de platillos

	//Mostrar el menu
	$('.options-btn').on('click',function(){
		var nav = $('nav#menu');
		var visible = nav.css('display');
		var wiwi = $(document).width();
		//Regresa al inicio del documento
		$(document).scrollTop(0);
		//Detiene animaciones previas
		$('nav#menu').stop();

		//Si se encuentra visible oculta el menú
		if(visible == 'block'){
			$('nav#menu').animate({
				right: -wiwi
			},'slow',function(){
				nav.css('display','none');
			})
		}else{//Si el menu esta oculto lo muestra
			nav.css('display','block');
			$('nav#menu').animate({
				right: 0
			},'slow',function(){})
		}
	})//Vista mostrar/ocultar menu


	//Ver elemento del menu en forma de bloque 1::1
	$('.view-block').on('click',function(){
		$('.menitem').removeClass('list'); //Elimina vista tipo lista
		$('.menitem').addClass('box'); // Agrega vista tipo bloque ~ caja
		
		$('.menitem').each(function(){
			var self = $(this); 
			var h2 = self.children('.desc').children('h2');
			//Clona el titulo del elemento del menu
			var cpy = h2.clone();
			//Elimina el titulo actual
			h2.remove();
			//Copia al inicio del elemento
			cpy.prependTo(self)
		})
		resizeMenu();
	}) //Fin vista de bloque

	$('.view-horizontal').on('click',function(){
		$('.menitem').removeClass('box'); //Elimina vista en caja ~ bloque
		$('.menitem').addClass('list'); //Habilita vista en lista

		$('.menitem').each(function(){
			var self = $(this);
			var h2 = self.children('h2')

			//Clona el titulo del elemento
			var cpy = h2.clone();
			//Elimina el titulo actual
			h2.remove();
			//Lo agrega antes de la descripcion
			cpy.insertBefore(self.children('.desc').children('p').eq(0))
		})
		resizeMenu();
	}) //Fin vista horizonta

	repos();

} //Fin goQuery



function closeOrder(){

	localStorage.cliente = null;
	localStorage.logged = false;
	localStorage.platillos = JSON.stringify({});
	var m = JSON.parse(localStorage.mesa);

	localStorage.estado = 0;
	m.estado = 0;

	localStorage.mesa = JSON.stringify(m);

	location.href = './index.html';
}

function preCloseOrder(){
	//Notificar al servidor que se quiere cerrar cuenta / Eliminar todo del servidor / Enviar a Caja
	//Reiniciar dispositivo desde caja 


	alertify.set({ labels: {
		ok: 'S&iacute;',
		cancel: 'No'
	}})

	$('#error-fs').fadeIn();

	alertify.confirm('¿Desea agregar el 10% de servicio?',function(e){
		var p = 0;

		if(e)
			p = 1;
		

		socket.emit('cerrar_orden',{'cliente': localStorage.cliente + '_' + localStorage.orden, 'pro': 1})

		$('#error-fs').html('<p></p><p></p><p>Cerrando orden</p><p>Espere un momento por favor.</p>')


			socket.on('orden_cerrada',function(e){

				$('#error-fs').html('<p></p><p></p><p>Orden Cerrada con &eacute;xito</p><p>Puede pasar a apagar a caja.</p>')

				socket.on('close_order',function(e){
					closeOrder();
				})
			}) 
			///------------

	})
}


function repos(){

	var fixT = $('#fix').height();
	$('#main').css('margin-top',fixT+16);
	$('#loader').css('top',fixT)
	
	/* REPOSICIONAR GEAR (opciones) ICON */

	var gearC = $('.options-btn');
	var gear = gearC.children('img');
	var gearCH = gearC.height();
	var gearH = gear.height();
	gear.css('margin-top',(gearCH-gearH)/2)

	resizeMenu();
}


function platilloEvent(){ //Evento para agregar platillos al menu
	$('.add-platillo').on('click',function(e){ //Agregar platillos al menu
		e.preventDefault();

		if(!$('#alertify').has('alertify-isHidden'))
			return false;

		var d = new Date();
		var self = $(this); //Elemento seleccionado hijo del div platillo
		var ref_platillo = self.parents('.menitem'); //Obtiene padre que contiene ID
		var id_platillo = ref_platillo.attr('id')+"_"+d.getTime(); //Obtiene ID del platillo seleccionado
		var platillo_str = $(ref_platillo.find('h2')[0]).text(); //Obtiene nombre del platillo
		var cost = $(ref_platillo.find('.cost')[0]).text();



		var q = 1, g = true;
		alertify.set({ labels: {
			ok: 'Agregar',
			cancel: 'No agregar'
		}})

		alertify.prompt('Platillo agregado. Añada Observaciones',function(e,str){ //Obtiene cantidad 

				if(str === 'Algo en especial sobre este platillo?')
					str = undefined;

				var orden_n = JSON.parse(localStorage.platillos);

				if(e)
					orden_n[id_platillo] = [str,platillo_str];
				else
					orden_n[id_platillo] = [null,platillo_str];

				localStorage.platillos = JSON.stringify(orden_n);


				var nuevo_article = $('<article id="'+id_platillo+'" class="p-orden"><div class="p-ordered"><span class="po-titulo">'+platillo_str+ ' - '+cost+'</span><span class="po-del"><img src="static/imgs/close.png" alt="Eliminar" /></span></div>' +(str!=undefined?('<p class="p-desc">'+str+'</p>'):'')+'</article>');
				nuevo_article.appendTo('#ordenados');


				$('.confirmar_btn').fadeIn();

				alertify.success('Agregado <strong>"'+ platillo_str+'"</strong>')
			//}
				

				$('.po-del').on('click',function(){
					var self = $(this);

					var parent = self.parents('.p-orden');
					var id = parent.attr('id');

					var plats = JSON.parse(localStorage.platillos);

					if(delete plats[id]){
						alertify.error('Platillo eliminado');
						localStorage.platillos = JSON.stringify(plats);
						parent.fadeOut('fast',function(){ $(this).remove();	})
					}

				})

		},"Algo en especial sobre este platillo?");	 //Fin obtener cantidad

		alertify.set({ labels: {
			ok: 'Ok',
			cancel: 'Cancelar'
		}})
	})// add-platillo.on(click)
}//Fin de funcion

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


function agregarPlatillosGUI(platillos){
	var platillo;

	$('#menu-items').text('');

	$.each(platillos,function(i,p){

		platillo = $('<article class="menitem box" id="'+p.id+'"> <h2>'+p.nombre+'</h2> <div class="pic"> <img src="'+node+'/images/'+p.imagen+'" /> </div> <div class="desc"> <p>'+p.descripcion+'</p> </div> <div class="btns"> <ul> <li class="add-platillo"><a href="#">Agregar</a></li> <li class="cost"><span>$'+p.precio+'</span></li> </ul> </div>	</article>');

		platillo.appendTo($('#menu-items'));
	})

	platilloEvent();
	$('#loader').fadeOut();
}

function obtenerPlatillos(tipo){
	$.ajax({
		beforeSend: function(){
			$('#loader').fadeIn();
		},
		type: 'GET',
		dataType: 'jsonp',
		url: node + '/get_platillos',
		data: {tipo: tipo},
		success:function(data){

			if(data.length<=0 || data == null){
				$('#loader').fadeOut();
				alertify.alert('No tenemos platillos disponibles');
				return false;
			}

			agregarPlatillosGUI(data);
		}
	}).error(function(){
		$('#loader').fadeOut();
		alertify.alert('Lo sentimos ha ocurrido un error. Vuelve a intentar.')
	})
}



/*
 *
 * Obtener estado de platillos (Decidir nueva pag, superposicion)
 * Cerrar Orden
 *
*/