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

	//Asignar nombre de cliente y numero de mesa en GUI
	$('#cliente-nombre').text(localStorage.cliente);
	$('#mesa-numero').text(JSON.parse(localStorage.mesa).numero);


	//Se indica al servidor que la mesa N ha cambiado de socket (pagina)
	socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })

	//Se registra el cambio correcto del socket
	socket.on('mesa_socket_changed_ok',function(info){
		if(info.cliente == null){
			destroySession();
			location.href = 'index.html'
		}
	})


	socket.on('connect',function(){
		//Al reconectar el servidor
		if(localStorage.serverDown){
			localStorage.serverDown = false;
			var m = JSON.parse(localStorage.mesa);
			//Se registra la mesa
			socket.emit('mesa_socket',{'mesa_id': JSON.parse(localStorage.mesa).numero })
			socket.emit('mesa_socket_changed',{'cliente': localStorage.cliente + '_' + localStorage.orden })
			socket.emit('new_mesa',{'numero': m.numero, 'estado': m.estado, 'capacidad':m.capacidad})
		}
	})

	//Se desconecta del servidor
	socket.on('disconnect',function(err){
		$('#error-fs').fadeIn();
		$('#error-fs').html('<p></p><p></p><p>Ups!</p><p>Hemos perdido conexi&oacute;n con el servidor</p><p>Espere un momento por favor.</p>')

		localStorage.serverDown = true;
	}) //Fin socket desconectado

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
			cpy.insertBefore($('.desc p:first-child'))
		})
		resizeMenu();
	}) //Fin vista horizonta

	repos();

} //Fin goQuery

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

		var self = $(this); //Elemento seleccionado hijo del div platillo
		var ref_platillo = self.parents('.menitem'); //Obtiene padre que contiene ID
		var id_platillo = ref_platillo.attr('id'); //Obtiene ID del platillo seleccionado
		var platillo_str = ref_platillo.children('h2').text(); //Obtiene nombre del platillo
		
		var q = 1, g = true;

		alertify.prompt('Cantidad',function(e,str){ //Obtiene cantidad 

			if(e){ //Si se indico cantidad
				if(!(q = parseInt(str))) //La cantidad no es valida
					g = false;
			}else //No se indico cantidad
				q  = null;


			if(!g) //Cantidad no valida
				alertify.error('Cantidad no v&aacute;lida');
			else if(q != null){//Cantidad valida

				if(orden_n.hasOwnProperty(id_platillo)) //Ya se ha agreda este platillo
					orden_n[id_platillo] += q;
				else //Primer seleccion de platillo
					orden_n[id_platillo] = q;

				$('.confirmar_btn').fadeIn();

				alertify.success('Agregado(s) <strong>' + q + '</strong> platillo(s) <strong>"'+ platillo_str+'"</strong>')
			}
				
		},"1");	 //Fin obtener cantidad
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

		platillo = $('<article class="menitem box" id="'+p.id+'"> <h2>'+p.nombre+'</h2> <div class="pic"> <img src="'+p.imagen+'" /> </div> <div class="desc"> <p>'+p.descripcion+'</p> </div> <div class="btns"> <ul> <li class="add-platillo"><a href="#">Agregar</a></li> <li><span>$'+p.precio+'</span></li> </ul> </div>	</article>');

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
	})
}



/*
 *
 * Enviar platillos al servidor
 * Asignar platillo a cocinero
 * Notificar cambio en estado de platillo
 * Obtener estado de platillos (Decidir nueva pag, superposicion)
 * Cerrar Orden
 *
*/