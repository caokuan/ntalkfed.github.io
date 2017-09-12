(function($){
	$.lang = {
		language:'es',
		robot_name: 'robot',
		robot_question_tip: 'Con Responder números se pueden obtener respuestas correspondientes',
		chat_title_ext:'(Xiaoneng online servicio de consumidor versión de)',
		chat_xiaoneng_version:'Xiaoneng Tecnología S.L.',
		chat_button_close:'Cerrar',
		chat_button_min:'Minimizar',
		chat_button_resize_max:'Acercar',
		chat_button_resize_min:'Reducir',
		chat_button_send:'Enviar',
		chat_button_audio: 'Pulsa para hablar',
		chat_button_audio_end: 'Grabación...',
		chat_button_audio_fingerup: 'Desliza arriba para cancelar', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Suelta para cancelar', //松开手指，取消发送
		chat_button_audio_shorttime: 'Habla demasiado corto', //说话时间太短
		chat_button_audio_error: 'Micrófono no utilizable', //麦克风无法使用
		chat_info_loading:'Cargando...',
		chat_info_failure:'Error al Cargar',
		chat_info_reload:'Recargar',
		chat_show_website: 'Hojear páginas web',
		message_upload_failure:'Subida de achivos adjuntos fracasada',
		message_button_submit:'Subir mensajes',
		evaluation_button_submit:'Evaluar',
		evaluation_button_cancel:'Cancelar',
		rightlabel: {
			about: {title:'Sobre nosotros',selected:true},
			faq: {title:'Preguntas frecuentes',selected:false}
		},
		goodsinfo: {
			marketprice:"Precio corriente",
			siteprice:	"Precio de venta",
			score:		"Sugerencia positiva",
			sizelist:	"Color",
			colorlist:	"Tamaño"
		},
		toolbar_default_text:'Nueva sesión',
		toolbar_min_title:'{$destname}',
		toolbar_min_news:'Tiene {$count} mensajes no leídos',
		system_title_news:'{$name} está a su disposición',
		system_first_news:'Hola, bienvenidos a {$name}, ¿en qué puedo ayudarle?',
		system_merge_session:'está hablando con {$destname}, las sesiones de conversación se han fusionado',
		system_allocation_service:'	Ahora estamos reservando un servicio para usted, espere un momento.',
		system_queue1:'Ahora está usted el el puesto {$count} en la cola. {$br}O puede pulsar {$torobot} [link message={$settingid} source=2] y dejarnos un mensaje [/link], nos pondremos en contacto con usted pronto.',
		system_mobile_queue1:'',
		system_queue2:'Ahora está usted en el puesto {$count} en la cola.',
		system_mobile_queue2: '',
		system_robot_queue1: '',
		system_robot_queue2: '',
		system_robot_offline1: '',
		system_robot_offline2: '',
		system_to_robot: '[link robot]recurrir a un robot [/link] o',
		system_to_artificial: '',
		system_no_user: '¡Por el momento el servicio de consumidores no existe o el grupo de recepción no dispone de dicho servicio!',
		system_online:'	¡Es un placer para {$destname} poder atender a usted!',
		system_offline:'{$destname} está offline, por favor [link message={$settingid} source=4]déjenos un mensaje[/link]',
		system_abnormal:'Conección de servicio fracasada, está reconectándose. Puede también [link message={$settingid} source=3]para dejarnos un mensaje[/link],pronto nos pondremos en contacto con usted!',
		system_failure: 'Su conección está broqueada, [link reconnect={$settingid}] intentar de nuevo [/link]',
		system_connect_timeout:'Tarda demasiado la conección al servidor, le recomendamos comprobar la connección del Internet.',
		system_connect_wait:'La red no funciona bien, se está reconectando al servidor.',
		system_change_session:'{$destname} sigue en su disposición',
		system_add_session:'{$destname} se une a la conversación',
		system_switch_session: 'Ha cambiado del servicio, {$destname} ahora está atendiendo a usted.',
		system_go_away_session:'{$destname} sale de la actual conversación',
		system_auto_disconnect:'No ha hablado por demasiado tiempo. El servidor se ha desconectado.',
		system_end_session:'La conversación sa ha acabado.',
		system_before_evaluation:'Todavía no ha evaluado el servicio, ¿seguro quiere salir de la página?',
		system_evaluation:'Se ha enviado su evaluación "{$evaluation}"',
		system_evaluation_failure:'¡Envío de evaluación fracasado!',
		system_mobile_evaluation: 'Mensaje: ¡gracias por su evaluación!',
		system_fast_messaging:'Su keytype es demasiado rápido, descanse un poco.',
		system_send_failure:'¡Envío de mensaje fracasado! [link href=javascript:void(0);]Enviar de nuevo[/link]',
		system_send_timeout:'	Tarda demasiado la conección, ¡envío de mensaje fracasado!',
		system_no_free_user: 'No existe servicio disponibles por el momento', //当前没有空闲的客服
		system_over_rechatnum: 'demasiado cambio de servicios ', //超过最大更换客服数量
		system_upload_compress: 'En compresión',	//正在压缩
		system_upload_start: 'Subiendo', //正在上传
		system_picture_error_type: 'Formato de dibujo incorrecto', //图片类型有误
		system_picture_error_size: 'Dibujo demasiado grande', //图片太大
		system_giveup_wait: '¿Decides abandonar su puesto en la cola?', //您是否放弃排队
		system_giveup_submit: 'Sí', //确认
		system_no_prev_picture: 'Sin el dibujo antetrior', //没有上一张图片
		system_no_next_picture: 'Sin el dibujo posterior', //没有下一张图片
		system_leave_message: 'Dejar un mensaje', //留言
		system_config_error: 'Carga de datos fracasada, recargue.', //数据加载失败，请重新加载
		system_printing: 'Introduciendo', //正在输入
		system_cookie: 'Abrir cookie en iPhone', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
		captura_reload: 'Online control de la captura de pantalla bloqueado por el navegador, renueve la página después de permitirlo',
		capture_install:'No ha instalado el control de la captura de pantalla, hacer click en OK para instalarlo\r\nPara instalarlo, tienes que cerrar el navegador de antemano...\r\nSi ya lo ha instalado, cierre el navegador y reabrirlo...',
		capture_activex_update:'El control de la captura de pantalla tiene una nueva versión, tiene que renovarlo antes del uso. \r\nHaga Click en OK para renovarlo,para instalar en control, tiene que cerrar el navegador de antemano...\r\nSi ya lo ha renovado ,cierre el navegador y reabrirlo...',
		capture_other_update:'El control de la captura de pantalla tiene una nueva versión, tiene que renovarlo antes del uso.\r\n Haga click en OK para renovar...',
		news_download:'Descargar',
		news_cancel_trans:'Cancelar el envío del archivo',
		news_trans_success: 'Cargar con éxito!', //上传成功
		news_trans_retry: 'Recargar', //重新上传
		news_trans_failure_size: 'Por favor, cargue archivos menos que ($maxsize)MB', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Cargue archivos con v $(type).', //仅支持以下上传文件类型：$(type)
		news_trans_failure:'Carga fracasada',
		news_trans_cancel:'Carga cancelada',
		news_trans_size: 'Dibujo demasiado grande',
		news_trans_type: 'Tipo de dibujo incorrecto',
		news_new:'Nuevo mensaje',
		button_face:'Emoji',
		button_file:'Archivos',
		button_image:'Dibujo',
		button_save:'Guardar',
		button_view:'Historia de Chat',
		button_captureImage:'Captura de dibujos',
		button_evaluation:'Evaluación',
		button_change_csr: 'Cambiarse de un nuevo servicio', //更换客服
		button_switch_manual: 'Pasar al manual',
		button_more:'Más',
		button_history: 'Regresar',
		button_end_session:'Terminar el chat',
		button_start_session:'Continuar el chat',
		button_enter:'Entrar',
		button_ctrl_enter:'Ctrl+Enter',
		button_capture_show_chatWin: 'No esconder la ventana',
		button_capture_hidden_chatWin: 'Esconder la ventana',

		back_button_text:'Regresar',
		dest_sign_text:'Nuestro negocio',
		default_textarea_text:'Quería preguntar...',
		send_button_text:'Enviar',
		default_evaluation_form_title:'Evaluación',
		default_evaluation_form_fields: [
			{title:"Por favor, evaluar mis servicios",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"supersatisfecho",value:"5"},
				{text:"satisfecho",value:"4"},
				{text:"regular",value:"3"},
				{text:"insatisfecho",value:"2"},
				{text:"disgustado ",value:"1"}
			], message:["Por favor, evalúe el servicio del representante",""]},
			{title:"Sugerencia y observaciones", multipart: true,name:"proposal",type:"textarea","defaultText":"Gracias por su sugerencia, seguiremos trabajando con más esfuerzo.",required:false,max:200,message:["","","Los caracteres de la sugerencia no deben sobrepasar a 200."]}
		],
		default_message_form_fields:[
			{title:"Nombre",name:"msg_name",type:"text","defaultText":"Introduzca su nombre",required:true,message:["Introduzca su nombre"]},
			{title:"móvil",name:"msg_tel",type:"text","defaultText":"Introduzca su móvil o teléfono",required:true,verification:"phone",message:["Introduzca el número de teléfono","Formato del número de teléfono incorrecto"]},
			{title:"correo",name:"msg_email",type:"text","defaultText":"Introduzca su correo electrónico",required:false,verification:"email",message:["Por favor, introduzca su dirección de correo electrónico","Formato de correo incorrecto"]},
			{title:"mensaje",name:"msg_content",type:"textarea","defaultText":"Por favor, escriba debajo sus problemas, nos pondremos en contacto con usted pronto.",required:true,max:400,message:["Mensaje no puede ser nulo.","","El límite de palabras del mesaje es 200."]}
		],
		default_submitinfo_form_title:'',
		default_submitinfo_form_fields: [
			{title:"Cuestión",name:"tips_question",type:"text","defaultText":"",required:true,message:["título"]},
			{title:"Tipo de cuestión",name:"tips_type",type:"select","defaultText":"- introduzca -",required:true, options:[
				"Consulta de prevenda",
				"Servicio de postvenda",
				"Consulta de logística",
				"Recomendacions de falta de stock"
			]},
			{title:"Nombre",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"móvil",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"Correo",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
		message_success:'!Envío de mensaje con éxito!',
		message_no_null:'*',
		message_no_null_char:'(Requerido)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
