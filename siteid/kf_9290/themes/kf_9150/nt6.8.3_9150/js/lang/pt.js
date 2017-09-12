(function($){
	$.lang = {
		language:'pt',
		robot_name: 'robô',
		robot_question_tip: 'Números de resposta pode ser obtido respostas correspondentes',
		chat_title_ext:'(Xiaoneng Edição Trial) ',
		chat_xiaoneng_version:'Tecnologia Xiaoneng',
		chat_button_close:'Fechar',
		chat_button_min:'Minimizar',
		chat_button_resize_max:'Aumentar',
		chat_button_resize_min:'Reduzir',
		chat_button_send:'Enviar',
		chat_button_audio: 'Mantenha pressionada a falar',
		chat_button_audio_end: 'Se a FITA...',
		chat_button_audio_fingerup: 'Dedos deslizamento, cancelar o envio', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Retire o dedo para cancelar o envio', //松开手指，取消发送
		chat_button_audio_shorttime: 'O tempo de conversação é muito curta', //说话时间太短
		chat_button_audio_error: 'Microfones não pode ser utilizada', //麦克风无法使用
		chat_info_loading:'Carregando...',
		chat_info_failure:'Falha no Carregamento',
		chat_info_reload:'Recarregar',
		chat_show_website: 'Ver página',
		message_upload_failure:'Falha no upload do anexo.',
		message_button_submit:'Comentários ',
		evaluation_button_submit:'Avaliar',
		evaluation_button_cancel:'Cancelar',
		rightlabel: {
			about: {title:'Sobre a empresa',selected:true},
			faq: {title:'FAQ',selected:false}
		},
		goodsinfo: {
			marketprice:"Preço de mercado",
			siteprice:	"Preço de venda",
			score:		"Score",
			sizelist:	"A cor",
			colorlist:	"Sz"
		},
		toolbar_default_text:'Nova Mensagem',
		toolbar_min_title:'{$destname}',
		toolbar_min_news:'Você tem {$count} novas mensagens',
		system_title_news:'Representante {$name} está ao seu serviço',
		system_first_news:'Olá, sou {$name}, o que posso fazer por você?',
		system_merge_session:'Você já iniciou uma conversa com o representante {$destname}',
		system_allocation_service:'Atribuindo um novo representante para você, aguarde...',
		system_queue1:'Você é o Nº {$count} na fila de espera. {$br} Se você não quer esperar, {$torobot} [link message={$settingid} source=2]deixe uma mensagem[/link], e entraremos em contato o mais breve possível. ',
		system_mobile_queue1:'Desculpe, aconselhando número excessivo de sua posição classificou {$count} [link message={$settingid} source=2]  Clique na mensagem[/link]',
		system_queue2:'Você é o Nº {$count} na fila de espera.',
		system_mobile_queue2: 'Desculpe, aconselhando número excessivo de sua posição classificou {$count}',
		system_robot_queue1: 'Você está atualmente na fila, que está classificada como a No.{$count}. {$br}Se você não quiser esperar, por favor, [link robot]continue e sessão de robótica[/link] ou [link message={$settingid} source=2]deixar uma mensagem[/link], entraremos em contato o mais rápido possível!',
		system_robot_queue2: 'Você está atualmente na fila, que está classificada como a No.{$count}. {$br}Se você não quiser esperar, por favor, [link robot]continue e sessão de robótica[/link], entraremos em contato o mais rápido possível!',
		system_robot_offline1: 'atendimento ao cliente artificial não é on-line, você pode [link robot]continue e sessão de robótica[/link] ou [link message={$settingid} source=2]deixar uma mensagem[/link], entraremos em contato o mais rápido possível!',
		system_robot_offline2: 'atendimento ao cliente artificial não é on-line, você pode [link robot]continue e sessão de robótica[/link], entraremos em contato o mais rápido possível!',
		system_to_robot: '[link robot]O robô[/link] ou',
		system_no_user: 'A equipe de recepção atendimento Ao cliente não existe ou não está configurado no cliente!',
		system_to_artificial: 'Temos alternar com sucesso ao serviço ao cliente Manual',
		system_online:'O representante {$destname} estará feliz em lhe ajudar. ',
		system_offline:'O representante {$destname} está offline, [link message={$settingid} source=4]deixe uma mensagem[/link]',
		system_abnormal:'Erro de conexão, reconectando. Se você não quer esperar, [link message={$settingid} source=3]deixe uma mensagem[[/link] e entraremos em contato o mais breve possível.',
		system_failure: 'Sua conexão foi interrompida , por favor, [link reconnect={$settingid}]tente novamente[/link]',
		system_connect_timeout:'O tempo para se conectar ao servidor esgotou, cheque a sua Rede.',
		system_connect_wait:'A internet não está estável, reconectando ao servidor. ',
		system_change_session:'O representante {$destname} continua o serviço ',
		system_add_session:'Atendimento Ao cliente {$destname} juntou - se a sessão actual',
		system_switch_session: 'You have replaced the customer service, {$destname} service is for you',
		system_go_away_session:'Representative {$destname} saiu desta conversa',
		system_auto_disconnect:'Você foi desconectado devido ao longo tempo em silêncio. ',
		system_end_session:'A conversa terminou',
		system_before_evaluation:'Você não avaliou o serviço do representante, tem certeza que quer sair da página?',
		system_evaluation:'Sua avaliação {$evaluation} foi enviada.',
		system_evaluation_failure:'Falha no envio da avaliação. ',
		system_mobile_evaluation: 'Mensagem: obrigado PELA SUA avaliação',
		system_fast_messaging:'Você está enviando mensagens muito rápido, aguarde um pouco.',
		system_send_failure:'Falha ao enviar a mensagem. [link href=javascript:void(0);]Reenviar[/link]',
		system_send_timeout:'O tempo de conexão se esgotou, não pode enviar a mensagem',
		system_no_free_user: 'Atualmente nenhum serviço ao cliente livre', //当前没有空闲的客服
		system_over_rechatnum: 'Substituindo mais do que o número máximo de serviço ao cliente', //超过最大更换客服数量
		system_upload_compress: 'fechando',	//正在压缩
		system_upload_start: 'upload', //正在上传
		system_picture_error_type: 'Imagens de o tipo errado', //图片类型有误
		system_picture_error_size: 'Imagem muito grande', //图片太大
		system_giveup_wait: 'Você daria a fila', //您是否放弃排队
		system_giveup_submit: 'confirmar', //确认
		system_no_prev_picture: 'Nenhuma imagem anterior', //没有上一张图片
		system_no_next_picture: 'Nenhuma imagem seguinte', //没有下一张图片
		system_leave_message: 'Deixe uma mensagem', //留言
		system_config_error: 'Dados falhou ao carregar, por favor, recarregar', //数据加载失败，请重新加载
		system_printing: 'é a digitação', //正在输入
		system_cookie: 'É recomendado que você ligue bolinho', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
		captura_reload: 'Capturas de tela para impedir o controle on - line pelo navegador, a Longo prazo, é que depois de atualizar a página actual',
		capture_install:'Você não possui o controle online de captura de tela, clique Sim para instalar \r\nInstallation a instalação necessita que você feche o navegador... \r\n Se você já instalou o controle, reabra o navegador...',
		capture_activex_update:'Uma nova edição do controle de captura de tela está disponível, atualize agora! \r\nClique sim para atualizar, a atualização requer que o navegador seja fechado.. \r\n Se você já atualizou, reabra o navegador.',
		capture_other_update:'Nova edição do plugin de captura de tela está disponível, atualize agora! \r\n Clique sim para atualizar...',
		news_download:'Download',
		news_cancel_trans:'Cancelar',
		news_trans_success: 'carregado com sucesso', //上传成功
		news_trans_retry: 'Re-upload', //重新上传
		news_trans_failure_size: 'Faça o upload de menos de {$maxsize} arquivo MB', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Carregar apenas suporta os seguintes tipos de arquivos: {$type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure:'Falha no upload',
		news_trans_cancel:'Envio cancelado',
		news_trans_size: 'O arquivo é Muito Grande',
		news_trans_type: 'Não suporta esse Tipo de arquivo',
        message_prompt:'Não serviço Ao cliente on - line,[link href="javascript:void(0);"]A Mensagem[/link]',
		news_new:'Nova mensagem',
		button_face:'Expressão',
		button_file:'Arquivos',
		button_image:'Imagens',
		button_save:'Salvar',
		button_view:'Registro de Chat',
		button_captureImage:'Captura de Tela',
		button_evaluation:'Avaliar',
		button_change_csr: 'Substitua Serviço', //更换客服
		button_switch_manual: 'a mão',
		button_more:'Mais',
		button_history: 'retorno',
		button_end_session:'Terminar',
		button_start_session:'Continuar',
		button_enter:'Entrar',
		button_ctrl_enter:'Ctrl+Enter',
		button_capture_show_chatWin: '',
		button_capture_hidden_chatWin: '',
		back_button_text:'Costas',
		dest_sign_text:'Introdução empresarial',
		default_textarea_text:'Eu quero perguntar...',
		send_button_text:'Enviar mensagem',
		default_evaluation_form_title:'Avaliação do serviço',
		default_evaluation_form_fields: [
			{title:"Por favor me de avaliação de serviços",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"Perfeito",value:"5"},
				{text:"Bom",value:"4"},
				{text:"Normal",value:"3"},
				{text:"Ruim",value:"2"},
				{text:"Péssimo",value:"1"}
			], message:["Avalie o serviço do representante",""]},
			{title:"Comentários e sugestões", multipart: true,name:"proposal",type:"textarea","defaultText":"Obrigado pelo seu feedback. Trabalharemos ainda mais.",required:false,max:200,message:["","","Máximo de 200 caracteres"]}
		],
		default_message_form_fields:[
			{title:"Nome",name:"msg_name",type:"text","defaultText":"Digite seu nome verdadeiro",required:true,message:["Digite seu apelido"]},
			{title:"Telefone",name:"msg_tel",type:"text","defaultText":"Digite seu número de telefone fixo ou celular ",required:true,verification:"phone",message:["Digite seu número de telefone","Formato errado"]},
			{title:"Email",name:"msg_email",type:"text","defaultText":"Por favor, preencha seu endereço de e-mail",required:false,verification:"email",message:["Por favor, preencha seu endereço de e-mail","Formato errado"]},
			{title:"Comentários ",name:"msg_content",type:"textarea","defaultText":"Escreva suas questões em detalhes e iremos entrar em contato o mais breve possível.",required:true,max:400,message:["Comentários não podem estar vazios","","Máximo de 200 caracteres"]}
		],
		default_submitinfo_form_title:'',
		default_submitinfo_form_fields: [
			{title:"Questões",name:"tips_question",type:"text","defaultText":"",required:true,message:["Digite o título da sua questão"]},
			{title:"Tipo de questão",name:"tips_type",type:"select","defaultText":"- Selecione um tipo -",required:true, options:[
				"Pré-Venda",
				"Reembolso & Reposição",
				"Logísticas",
				"Sugestões curtas de suprimento"
			]},
			{title:"Nome do cliente",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"Número de contato ",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"Email",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
		message_success:'Comentários enviados!',
		message_no_null:'*',
		message_no_null_char:'(Requerido) ',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
