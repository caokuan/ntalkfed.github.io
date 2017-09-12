(function($){
	$.lang = {
		language:'de',
		robot_name: 'Roboter',
		robot_question_tip: 'Antworten Nummern entsprechenden Antworten erhalten',
		chat_title_ext:'(Xiaoneng Probeversion)',
		chat_xiaoneng_version:'Xiaoneng Technology',
		chat_button_close:'Schließen',
		chat_button_min:'Minimieren',
		chat_button_resize_max:'Vergrößern',
		chat_button_resize_min:'Reduzieren',
		chat_button_send:'Senden',
		chat_button_audio: 'Sie Sprechen',
		chat_button_audio_end: 'Der rekorder...',
		chat_button_audio_fingerup: 'Finger gleiten, brechen Sie das Senden', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Lassen Sie die Finger abbrechen Senden', //松开手指，取消发送
		chat_button_audio_shorttime: 'Gesprächszeit ist zu kurz', //说话时间太短
		chat_button_audio_error: 'Mikrofone können nicht verwendet werden,', //麦克风无法使用
		chat_info_loading:'Lädt...',
		chat_info_failure:'Laden fehlgeschlagen',
		chat_info_reload:'Erneut laden',
		chat_show_website: 'Auf der WEB - Seite',
		message_upload_failure:'Anhang hochladen fehlgeschlagen!',
		message_button_submit:'Kommentare',
		evaluation_button_submit:'Bewerten',
		evaluation_button_cancel:'Stornieren',
		rightlabel: {
			about: {title:'Über die Firma',selected:true},
			faq: {title:'FAQ',selected:false}
		},
		goodsinfo: {
			marketprice:"Marktpreis",
			siteprice:	"Kaufpreis",
			score:		"Score",
			sizelist:	"Farbe",
			colorlist:	"SZ"
		},
		toolbar_default_text:'Neue Nachricht',
		toolbar_min_title:'{$destname}',
		toolbar_min_news:'Sie haben {$count} neue Nachrichten',
		system_title_news:'Vertreter {$name} ist für Sie da',
		system_first_news:'Hallo, hier ist {$name}, was kann ich für Sie tun?',
		system_merge_session:'Sie haben bereits das Gespräch mit Vertreter {$destname} begonnen',
		system_allocation_service:'Ein Vertreter wird Ihnen zugewiesen, bitte warten ...',
		system_queue1:'Sie sind Nr. {$count} in der Warteschlange. {$br}Wenn Sie nicht warten möchten, bitte {$torobot} [link message={$settingid} source=2]hinterlassen Sie eine Nachricht[/link], und wir werden Sie so schnell wie mögich kontaktieren!',
		system_mobile_queue1:'Es tut uns Leid, Beratung übermäßige Anzahl Ihrer Platz Position {$count} [link message={$settingid} source=2]  Klicken Sie auf die Meldung [/link]',
		system_queue2:'Sie sind Nr. {$count} in der Warteschlange.',
		system_mobile_queue2: 'Es tut uns Leid, Beratung übermäßige Anzahl Ihrer Platz Position {$count}',
		system_robot_queue1: 'Sie befinden sich in der Warteschlange, Sie sind Nummer {$count} eingestuft. {$br}Wenn Sie nicht warten möchten, fahren Sie bitte fort [link robot]und Robotik-Session[/link] oder [link message={$settingid} source=2]eine Nachricht hinterlassen[/link], werden wir Sie so bald wie möglich in Verbindung!',
		system_robot_queue2: 'Sie befinden sich in der Warteschlange, Sie sind Nummer {$count} eingestuft. {$br}Wenn Sie nicht warten möchten, fahren Sie bitte fort [link robot]und Robotik-Session[/link], werden wir Sie so bald wie möglich in Verbindung!',
		system_robot_offline1: 'Online Kunden-Service ist nicht künstlich, ist [link robot]und Robotik-Session[/link] oder [link message={$settingid} source=2]eine Nachricht hinterlassen[/link], werden wir Sie so bald wie möglich in Verbindung!',
		system_robot_offline2: 'Online Kunden-Service ist nicht künstlich, ist [link robot]und Robotik-Session[/link], werden wir Sie so bald wie möglich in Verbindung!',
		system_to_robot: '[link robot]An den Roboter[/link] Oder',
		system_to_artificial: 'Wir haben erfolgreich wechseln in den manuellen Kundendienst',
		system_no_user: 'Derzeit gibt es nicht Oder in der Gruppe - empfang nicht konfiguriert Customer Service!',
		system_online:'Vertreter {$destname} ist froh, Ihnen zu helfen!',
		system_offline:'Vertreter {$destname} ist offline, bitte [link message={$settingid} source=4]hinterlassen Sie eine Nachricht[/link]',
		system_abnormal:'Netzwerk-Fehler, wird erneut verbindet. Wenn Sie nicht warten möchten, bitte [link message={$settingid} source=3]hinterlassen Sie eine Nachricht[/link], und wir werden Sie so schnell wie möglich kontaktieren.',
		system_failure: 'Ihre Verbindung unterbrochen wurde , [link reconnect={$settingid}] Wiederholung [/link]',
		system_connect_timeout:'Verbindung zum Server ist abgelaufen, bitte überprüfen Sie Ihr Netzwerk.',
		system_connect_wait:'Internet nicht stetig, Server wird erneut verbindet.',
		system_change_session:'Vertreter {$destname} setzt den Service fort',
		system_add_session:'Vertreter {$destname} nimmt an diese Unterhaltung teil',
		system_switch_session: 'Sie ersetzt, kundenservice, für ihre DIENSTLEISTUNGEN {$destname} kundenservice!',
		system_go_away_session:'Vertreter {$destname} verlässt diese Unterhaltung',
		system_auto_disconnect:'Sie wurden wegen des langen Schweigens durchgetrennt.',
		system_end_session:'Unterhaltung beendet',
		system_before_evaluation:'Sie haben den Service des Vertreters noch nicht bewertet, möchten Sie wirklich diese Seite verlassen?',
		system_evaluation:'Ihre Bewertung "{$evaluation}" wurde übermittelt.',
		system_evaluation_failure:'Einreichen Ihrer Auswertung fehlgeschlagen!',
		system_mobile_evaluation: 'Botschaft: vielen dank für ihre BEWERTUNG',
		system_fast_messaging:'Sie senden die Nachrichten zu schnell, bitte kurz warten',
		system_send_failure:'Fehler beim Senden der Nachricht! [link href=javascript:void(0);]Erneut senden[/link]',
		system_send_timeout:'Verbindung abgelaufen, die Nachricht kann nicht versendet werden',
		system_no_free_user: 'Zur Zeit ist kein Service kostenlos Kunden', //当前没有空闲的客服
		system_over_rechatnum: 'Ersetzen von mehr als die maximale Anzahl von Kundendienst', //超过最大更换客服数量
		system_upload_compress: 'zipping',	//正在压缩
		system_upload_start: 'Hochladen', //正在上传
		system_picture_error_type: 'Bilder vom falschen Typ', //图片类型有误
		system_picture_error_size: 'Das Bild ist zu groß', //图片太大
		system_giveup_wait: 'Würden Sie die Warteschlange aufgeben', //您是否放弃排队
		system_giveup_submit: 'bestätigen', //确认
		system_no_prev_picture: 'Kein vorheriges Bild', //没有上一张图片
		system_no_next_picture: 'Kein nächstes Bild', //没有下一张图片
		system_leave_message: 'Hinterlassen Sie eine Nachricht', //留言
		system_config_error: 'Daten nicht geladen werden, bitte erneut laden', //数据加载失败，请重新加载
		system_printing: 'ist die Eingabe', //正在输入
		system_cookie: 'Es wird empfohlen, dass Sie Cookie drehen', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
		capture_reload: 'Online - screenshots, kontrollen werden die browser zu stoppen, bitte nach dem langfristigen erlaubt auf der aktuellen Seite',
		capture_install:'Sie verfügen nicht über die Online-Screenshot-Steuerung, klicken Sie auf Ja, um zu installieren\r\nInstallation erfordert den Browser zu schließen...\r\nWenn Sie die Kontrolle bereits installiert haben, bitte öffnen Sie den Browser...',
		capture_activex_update:'Neue Version der Screenshot-Steuerung ist verfügbar, bitte aktualisieren Sie jetzt! \r\nKlicken Sie Ja um zu aktualisieren, und die Aktualisierung erfordert den Browser zu schließen..\r\nWenn Sie bereits diese aktualisiert haben, bitte öffnen Sie den Browser erneut...',
		capture_other_update:'Neue Version der Online-Screenshot-Steuerung ist verfügbar, bitte aktualisieren Sie jetzt! \r\nKlicken Sie Ja um zu aktualisieren, ',
		news_download:'Herunterladen',
		news_cancel_trans:'Stornieren',
		news_trans_success: 'Upload erfolgreich', //上传成功
		news_trans_retry: 'Re-upload', //重新上传
		news_trans_failure_size: 'Bitte laden Sie weniger als {$maxsize} MB-Datei', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Laden Sie unterstützt nur die folgenden Dateitypen: {$type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure:'Hochladen fehlgeschlagen',
		news_trans_cancel:'Senden storniert',
		news_trans_size: 'Die datei IST zu Groß',
		news_trans_type: 'Nicht für diese Art der datei',
		news_new:'Neue Nachricht',
		message_prompt:'Ohne - service online,[link href="javascript:void(0);"]Ich Will, ich Will[/link]',
		button_face:'Ausdruck',
		button_file:'Dateien',
		button_image:'Bilder',
		button_save:'Sichern',
		button_view:'Chat Log',
		button_captureImage:'Screenshot',
		button_evaluation:'Bewerten',
		button_change_csr: '', //更换客服
		button_switch_manual: 'Den Hand',
		button_more:'Mehr',
		button_history: 'Rückkehr',
		button_end_session:'Ende',
		button_start_session:'Fortsetzen',
		button_enter:'Enter',
		button_ctrl_enter:'Ctrl+Enter',
		button_capture_show_chatWin: '',
		button_capture_hidden_chatWin: '',
		back_button_text:'Rücken',
		dest_sign_text:'Business-Einführung',
		default_textarea_text:'Ich möchte fragen...',
		send_button_text:'Nachricht senden',
		default_evaluation_form_title:'Service-Bewertung',
		default_evaluation_form_fields: [
			{title:"Bitte BEWERTUNG meine DIENSTE",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"Perfekt",value:"5"},
				{text:"Gut",value:"4"},
				{text:"Normal",value:"3"},
				{text:"Schlecht",value:"2"},
				{text:"Sehr schlecht",value:"1"}
			], message:["Bitte bewerten Sie den Service des Vertreters",""]},
			{title:"Anregungen und feedback", multipart: true,name:"proposal",type:"textarea","defaultText":"Vielen Dank für Ihr Feedback. Wir werden uns mehr Mühe geben.",required:false,max:200,message:["","","Maximal 200 Zeichen"]}
		],
		default_message_form_fields:[
			{title:"Name",name:"msg_name",type:"text","defaultText":"Bitte geben Sie Ihre richtigen Namen ein",required:true,message:["Bitte geben Sie Ihren Spitznamen ein"]},
			{title:"Telefon",name:"msg_tel",type:"text","defaultText":"Bitte geben Sie Ihre Hause- oder Mobiltelefonnummer ein",required:true,verification:"phone",message:["Bitte geben Sie Ihre Telefonnummer ein","Falsches Format"]},
			{title:"Email",name:"msg_email",type:"text","defaultText":"Bitte geben Sie Ihre E-Mail -Adresse",required:false,verification:"email",message:["Bitte geben Sie Ihre E-Mail -Adresse","Falsches Format"]},
			{title:"Kommentare",name:"msg_content",type:"textarea","defaultText":"Bitte beschreiben Sie Ihre Fragen im Detail, und wir werden Sie so schnell wie möglich kontaktieren.",required:true,max:400,message:["Kommentare können nicht leer sein","","Maximal 400 Zeichen"]}
		],
		default_submitinfo_form_title:'',
		default_submitinfo_form_fields: [
			{title:"Fragen",name:"tips_question",type:"text","defaultText":"",required:true,message:["Bitte geben Sie einen Titel für Ihre Frage ein"]},
			{title:"Frage-Art",name:"tips_type",type:"select","defaultText":"- Bitte wählen Sie eine Art aus -",required:true, options:[
				"Vorverkauf",
				"Erstattung & Austausch",
				"Logistik",
				"Mangelware-Vorschläge"
			]},
			{title:"Client-Name",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"Kontaktnummer",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"Email",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
		message_success:'Kommentare eingereicht!',
		message_no_null:'*',
		message_no_null_char:'(Erforderlich)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
