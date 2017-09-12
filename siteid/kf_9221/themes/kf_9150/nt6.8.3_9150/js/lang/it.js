(function($){
	$.lang = {
		language:'it',
		robot_name: 'Robot',
		robot_question_tip: 'Rispondi numeri possono essere ottenute risposte corrispondenti',
		chat_title_ext:'(versione di prova Xiaoneng)',
		chat_xiaoneng_version:'Xiaoneng Technology',
		chat_button_close:'Chiudi',
		chat_button_min:'Riduci a icona',
		chat_button_resize_max:'Ingrandisci',
		chat_button_resize_min:'Riduci',
		chat_button_send:'Invia',
		chat_button_audio: 'IL parlare',
		chat_button_audio_end: 'E \'il nastro...',
		chat_button_audio_fingerup: 'Dita scivolano, annullare l\'invio', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Rilasciare il dito per annullare l\'invio', //松开手指，取消发送
		chat_button_audio_shorttime: 'Tempo di conversazione è troppo breve', //说话时间太短
		chat_button_audio_error: 'Microfoni non possono essere utilizzati', //麦克风无法使用
		chat_info_loading:'Caricamento in corso...',
		chat_info_failure:'Caricamento non riuscito',
		chat_info_reload:'Ricarica',
		chat_show_website: 'Vedere Pagina',
		message_upload_failure:'Caricamento allegato non riuscito!',
		message_button_submit:'Commenti',
		evaluation_button_submit:'Valuta',
		evaluation_button_cancel:'Cancella',
		rightlabel: {
			about: {title:'Informazioni sulla società',selected:true},
			faq: {title:'FAQ',selected:false}
		},
		goodsinfo: {
			marketprice:"Prezzo di mercato",
			siteprice:	"Prezzo di vendita",
			score:		"IL punteggio",
			sizelist:	"IL Colore",
			colorlist:	"SZ"
		},
		toolbar_default_text:'Nuovo Messaggio',
		toolbar_min_title:'{$destname}',
		toolbar_min_news:'Hai {$count} nuovi messaggi',
		system_title_news:'Il rappresentante {$name} è al vostro servizio',
		system_first_news:'Salve, sono {$name}, cosa posso fare per lei?',
		system_merge_session:'Hai già iniziato la conversazione con il rappresentante {$destname}',
		system_allocation_service:'Ti stiamo assegnando un rappresentante, si prega di attendere...',
		system_queue1:'Sei il N.{$count} nella coda di attesa. {$br}Se non vuoi aspettare, ti preghiamo di  {$torobot} [link message={$settingid} source=2]lasciare un messaggio[/link], ti contatteremo il prima possibile!',
		system_mobile_queue1:'Siamo spiacenti, consulenza numero eccessivo di posizione classificato {$count} [link message={$settingid} source=2]  Fare clic sul messaggio[/link]',
		system_queue2:'Sei il N.{$count} nella coda di attesa.',
		system_mobile_queue2: 'Siamo spiacenti, consulenza numero eccessivo di posizione classificato {$count}',
		system_robot_queue1: 'Attualmente sei in coda, si è classificato N.{$count}. {$br}Se non si vuole aspettare, vi prego di [link robot]continuare e la sessione di robotica[/link] o [link message={$settingid} source=2]lasciare un messaggio[/link], vi contatteremo al più presto!',
		system_robot_queue2: 'Attualmente sei in coda, si è classificato N.{$count}. {$br}Se non si vuole aspettare, vi prego di [link robot]continuare e la sessione di robotica[/link], vi contatteremo al più presto!',
		system_robot_offline1: 'servizio clienti online non è artificiale, è [link robot]continuare e la sessione di robotica[/link] o [link message={$settingid} source=2]lasciare un messaggio[/link], vi contatteremo al più presto!',
		system_robot_offline2: 'servizio clienti online non è artificiale, è [link robot]continuare e la sessione di robotica[/link], vi contatteremo al più presto!',
		system_to_robot: '[link robot]IL Robot[/link] o',
		system_to_artificial: 'Abbiamo passare con successo al servizio clienti manuale',
		system_no_user: 'Attualmente non esiste, o gruppo di Clienti di accoglienza non e \'configurato in Servizio Clienti!',
		system_online:'Il rappresentante {$destname} è lieto di aiutarti!',
		system_offline:'Il rappresentante {$destname} non è in linea, ti preghiamo di [link message={$settingid} source=2]lasciare un messaggio[/link]',
		system_abnormal:'Errore di rete, riconnessione in corso. Se non vuoi aspettare, ti preghiamo di [link message={$settingid} source=2]lasciare un messaggio[/link], ti contatteremo il prima possibile!',
		system_failure: 'La connessione è stata interrotta , si prega [link reconnect={$settingid}]di riprovare[/link]',
		system_connect_timeout:'Connessione al server scaduta, si prega di controllare la rete.',
		system_connect_wait:'Internet instabile, riconnessione al server in corso.',
		system_change_session:'Il rappresentante {$destname} continua il servizio',
		system_add_session:'Il rappresentante {$destname} si è unito a questa conversazione',
		system_switch_session: 'IL tuo cliente è stato sostituito, {$destname} Call è al vostro Servizio!',
		system_go_away_session:'Il rappresentante {$destname} ha abbandonato questa conversazione',
		system_auto_disconnect:'La linea telefonica è stata interrotta a causa del lungo silenzio.',
		system_end_session:'Conversazione terminata',
		system_before_evaluation:'Non hai valutato il servizio del rappresentante, sei sicuro di voler lasciare questa pagina?',
		system_evaluation:'La tua valutazione "{$evaluation}" è stata inviata.',
		system_evaluation_failure:'Invio valutazione non riuscito!',
		system_mobile_evaluation: 'Grazie per la vostra valutazione di messaggio:',
		system_fast_messaging:'Stai inviando messaggi troppo velocemente, si prega di fare una pausa.',
		system_send_failure:'Invio messaggio non riuscito! [link href=javascript:void(0);]Invia di nuovo[/link]',
		system_send_timeout:'Connessione scaduta, invio messaggio non riuscito',
		system_no_free_user: 'Attualmente nessun servizio clienti gratuito', //当前没有空闲的客服
		system_over_rechatnum: 'Sostituzione più del numero massimo di servizio al cliente', //超过最大更换客服数量
		system_upload_compress: 'zippare',	//正在压缩
		system_upload_start: 'Caricamento', //正在上传
		system_picture_error_type: 'Immagini del tipo sbagliato', //图片类型有误
		system_picture_error_size: 'Immagine troppo grande', //图片太大
		system_giveup_wait: 'Vuoi dare la coda', //您是否放弃排队
		system_giveup_submit: 'confermare', //确认
		system_no_prev_picture: 'Nessun immagine precedente', //没有上一张图片
		system_no_next_picture: 'Nessuna immagine successiva', //没有下一张图片
		system_leave_message: 'Lascia un messaggio', //留言
		system_config_error: 'I dati non è stato caricato, si prega di ricaricare', //数据加载失败，请重新加载
		system_printing: 'sta scrivendo', //正在输入
		system_cookie: 'E\'consigliabile accendere biscotto', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
		capture_reload: 'Cartina schermata del Browser di fermare il controllo è, per favore, di cui a lungo termine dopo l\'attuale Pagina consente di aggiorna',
		capture_install:'Non disponi del controllo screenshot in linea, clicca su Sì per installarlo \r\nL\'installazione richiede la chiusura del browser...\r\n Se il controllo è già stato installato, si prega di riaprire il browser...',
		capture_activex_update:'Una nuova edizione di controllo screenshot è disponibile, si prega di aggiornare ora! \r\nClicca su Sì per aggiornare, l\'aggiornamento richiede la chiusura del browser..\r\n Se l\'aggiornamento è già stato effettuato, si prega di riaprire il browser..',
		capture_other_update:'Una nuova edizione di plug in screenshot online è disponibile, si prega di aggiornare ora! \r\nClicca su Sì per aggiornare...',
		news_download:'Scarica',
		news_cancel_trans:'Cancella',
		news_trans_success: 'Carica di successo', //上传成功
		news_trans_retry: 'Re-upload', //重新上传
		news_trans_failure_size: 'Si prega di caricare meno {$maxsize} File MB', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Carica solo supporta i seguenti tipi di file: ${type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure:'Caricamento non riuscito',
		news_trans_cancel:'Invio annullato',
		news_trans_size: 'IL File è troppo Grande',
		news_trans_type: 'Non è favorevole a questo tipo di File',
		news_new:'Nuovo messaggio',
		button_face:'Espressione',
		button_file:'Files',
		button_image:'Immagini',
		button_save:'Salva',
		button_view:'Registro chat',
		button_captureImage:'Screenshot',
		button_evaluation:'Valuta',
		button_change_csr: 'Servizio Sostituire', //更换客服
		button_switch_manual: 'La mano',
		button_more:'Più',
		button_history: 'ritorno',
		button_end_session:'Fine',
		button_start_session:'Continua',
		button_enter:'Enter',
		button_ctrl_enter:'Ctrl+Enter',
		button_capture_show_chatWin: '',
		button_capture_hidden_chatWin: '',
		back_button_text:'Indietro',
		dest_sign_text:'Introduzione azienda',
		default_textarea_text:'Vorrei chiedere...',
		send_button_text:'Invia messaggio',
		default_evaluation_form_title:'Valutazione servizio',
		default_evaluation_form_fields: [
			{title:"Per favore, il mio Servizio di valutazione",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"Perfetto",value:"5"},
				{text:"Bene",value:"4"},
				{text:"Normale",value:"3"},
				{text:"Cattivo",value:"2"},
				{text:"Peggiore",value:"1"}
			], message:["Si prega di valutare il servizio del rappresentante",""]},
			{title:"Consigli e Feedback", multipart: true,name:"proposal",type:"textarea","defaultText":"Grazie per il feedback. Ci impegneremo ancora di più.",required:false,max:200,message:["","","200 caratteri al massimo"]}
		],
		default_message_form_fields:[
			{title:"Nome",name:"msg_name",type:"text","defaultText":"Inserisci il tuo vero nome",required:true,message:["Inserisci il tuo nickname"]},
			{title:"Telefono",name:"msg_tel",type:"text","defaultText":"Inserisci il tuo numero di telefono fisso o mobile",required:true,verification:"phone",message:["Inserisci il tuo numero di telefono","Formato errato"]},
			{title:"Email",name:"msg_email",type:"text","defaultText":"Inserisci il tuo indirizzo e-mail",required:false,verification:"email",message:["Inserisci il tuo indirizzo e-mail","Formato errato"]},
			{title:"Commenti",name:"msg_content",type:"textarea","defaultText":"Si prega di scrivere le vostre domande in dettaglio, vi contatteremo al più presto.",required:true,max:400,message:["I commenti non possono essere vuoti","","400 caratteri al massimo"]}
		],
		default_submitinfo_form_title:'',
		default_submitinfo_form_fields: [
			{title:"Domande",name:"tips_question",type:"text","defaultText":"",required:true,message:["Inserisci un titolo per la tua domanda"]},
			{title:"Tipo di domanda",name:"tips_type",type:"select","defaultText":"- Seleziona un tipo -",required:true, options:[
				"Pre-vendita",
				"Rimborso&Sostituzione",
				"Logistica",
				"Consigli approvvigionamento corto"
			]},
			{title:"Nome cliente",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"Numero contatto",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"Email",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
		message_success:'Commenti inviati!',
		message_no_null:'*',
		message_no_null_char:'(Richiesto)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
