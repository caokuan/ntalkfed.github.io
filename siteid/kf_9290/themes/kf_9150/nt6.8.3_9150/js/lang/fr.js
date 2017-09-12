(function($){
	$.lang = {
		language:'fr',
		robot_name: 'Robot',
		robot_question_tip: 'Répondre numéros peuvent être obtenus réponses correspondantes',
		chat_title_ext:'(Xiaoneng version d\'essai)',
		chat_xiaoneng_version:'Xiaoneng Technologie',
		chat_button_close:'Fermer',
		chat_button_min:'Réduire l\'icône',
		chat_button_resize_max:'Agrandir',
		chat_button_resize_min:'Réduire',
		chat_button_send:'Envoyer ',
		chat_button_audio: 'Pas un mot',
		chat_button_audio_end: 'C\'est un enregistrement...',
		chat_button_audio_fingerup: 'Les doigts glisser, d\'annuler l\'envoi', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Relâchez votre doigt pour annuler l\'envoi', //松开手指，取消发送
		chat_button_audio_shorttime: 'Le temps de conversation est trop courte', //说话时间太短
		chat_button_audio_error: 'Microphones ne peuvent pas être utilisés', //麦克风无法使用
		chat_info_loading:'Chargement...',
		chat_info_failure:'Echec du changement',
		chat_info_reload:'Recharger ',
		chat_show_website: 'Voir page',
		message_upload_failure:'Chargement de pièce jointe échoué',
		message_button_submit:'Commentaires',
		evaluation_button_submit:'Evaluer ',
		evaluation_button_cancel:'Retour',
		rightlabel: {
			about: {title:'A propos de la compagnie',selected:true},
			faq: {title:'FAQ',selected:false}
		},
		goodsinfo: {
			marketprice:"Prix du marché",
			siteprice:	"Prix de vente",
			score:		"Score",
			sizelist:	"Couleur",
			colorlist:	"Taille"
		},
		toolbar_default_text:'Nouveau message',
		toolbar_min_title:'{$destname}',
		toolbar_min_news:'Vous avez {$count} nouveau(x) message(s)',
		system_title_news:'Représentant {$name} est à votre service',
		system_first_news:'Bonjour, je suis {$name}, que puis-je faire pour vous?',
		system_merge_session:'Vous avez déjà commencé la conversation avec le représentant {$destname}',
		system_allocation_service:'Nous sommes entrain de vous mettre en contact avec un représentant, veuillez patienter...',
		system_queue1:'Vous êtes No.{$count} sur la liste d\'attente. {$br} Si vous ne pouvez pas attendre, veuillez  {$torobot} [link message={$settingid} source=2]laisser un message[/link], et nous vous contacterons le plus tôt possible!',
		system_mobile_queue1:'Désolé, conseils nombre excessif de votre poste classé clic {$count} [link message={$settingid} source=2]  Cliquez sur le message[/link]',
		system_queue2:'Vous êtes No.{$count} sur la liste d\'attente.',
		system_mobile_queue2: 'Désolé, conseiller nombre excessif de votre poste classé {$count}',
		system_robot_queue1: 'Vous êtes actuellement dans la file d\'attente, vous êtes classé n ° {$count}. {$br}Si vous ne voulez pas attendre, s\'il vous plaît [link robot]continuer et de la robotique session[/link] ou [link message={$settingid} source=2]laisser un message[/link], nous vous contacterons dès que possible!',
		system_robot_queue2: 'Vous êtes actuellement dans la file d\'attente, vous êtes classé n ° {$count}. {$br}Si vous ne voulez pas attendre, s\'il vous plaît [link robot]continuer et de la robotique session[/link], nous vous contacterons dès que possible!',
		system_robot_offline1: 'service à la clientèle artificielle est pas en ligne, est [link robot]continuer et de la robotique session[/link] ou [link message={$settingid} source=2]laisser un message[/link], nous vous contacterons dès que possible!',
		system_robot_offline2: 'service à la clientèle artificielle est pas en ligne, vous pouvez [link robot]continuer la session et de la robotique[/link], plus tard passer à service manuel client',
		system_to_robot: '[link robot]robot de transfert[/link] ou',
		system_to_artificial: 'Nous avons passer avec succès au service manuel client',
		system_no_user: 'Le courant de service à la clientèle n\'existe pas ou n\'est pas conçu dans la Section de réception de service à la clientèle!',
		system_online:'Représentant {$destname} est heureux de vous aider!',
		system_offline:'Le Représentant {$destname} n\'est pas en ligne, veuillez [link message={$settingid} source=4]laisser un message[/link]',
		system_abnormal:'Erreur du réseau internet, reconnexion en cours. Si vous ne pouvez pas attendre, veuillez [link message={$settingid} source=3]laisser un message[/link], et nous vous contacterons le plus tôt possible!',
		system_failure: 'Votre connexion a été interrompue , se il vous plaît [link reconnect={$settingid}]essayer de nouveau[/link]',
		system_connect_timeout:'Le temps de connexion au serveur est passé, veuillez vérifier votre réseau internet.',
		system_connect_wait:'La connexion internet n\'est pas stable, reconnexion au serveur en cours.',
		system_change_session:'Représentant {$destname} continue le service',
		system_add_session:'Représentant {$destname} a rejoint la conversation',
		system_switch_session: 'Vous avez remplacé le service à la clientèle, {$destname} de service à la clientèle est à votre service!',
		system_go_away_session:'Représentant {$destname} a quitté la conversation',
		system_auto_disconnect:'Vous avez été coupé en raison d\'un long temps de silence ',
		system_end_session:'Fin de la conversation',
		system_before_evaluation:'Vous n\'avez pas évalué le service du représentant, êtes vous sûr de vouloir quitter cette page?',
		system_evaluation:'Votre évaluation "{$evaluation}" a été envoyé.',
		system_evaluation_failure:'Echec lors de l\'envoi de votre évaluation!',
		system_mobile_evaluation: 'Rappel: je vous remercie de votre information',
		system_fast_messaging:'Vous envoyez vos messages trop vite, veuillez prendre une pause.',
		system_send_failure:'Echec d\'envoi du message! [link href=javascript:void(0);]Réenvoyer[/link]',
		system_send_timeout:'Le temps de connexion est passé, le message n\'a pas été envoyé',
		system_no_free_user: 'Actuellement aucun service client gratuit', //当前没有空闲的客服
		system_over_rechatnum: 'Remplacement de plus que le nombre maximum de service à la clientèle', //超过最大更换客服数量
		system_upload_compress: 'Compresser',	//正在压缩
		system_upload_start: 'Uploading', //正在上传
		system_picture_error_type: 'Photos du mauvais type', //图片类型有误
		system_picture_error_size: 'Image trop grande', //图片太大
		system_giveup_wait: 'Voulez-vous renoncer à la file d\'attente', //您是否放弃排队
		system_giveup_submit: 'confirmer', //确认
		system_no_prev_picture: 'Pas d\'image précédente', //没有上一张图片
		system_no_next_picture: 'Pas d\'image suivante', //没有下一张图片
		system_leave_message: 'Laissez un message', //留言
		system_config_error: 'Données n\'a pas réussi à charger, recharger s\'il vous plaît', //数据加载失败，请重新加载
		system_printing: 'est tapant', //正在输入
		system_cookie: 'Il a recommandé que vous tournez cookies', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
		capture_reload: 'Capture d\'écran de la ligne de commande est un navigateur d\'arrêter, s\'il vous plaît, ensemble à long terme permettant de rafraîchir la page courante après',
		capture_install:'Vous n\'avez pas le contrôle de capture d\'écran en ligne, cliquez sur Oui pour installer \r\nL\'installation nécessite la fermeture du navigateur...\r\n Si vous avez déjà installé le contrôle, vous pouvez donc rouvrir le navigateur...',
		capture_activex_update:'La nouvelle version du contrôle de capture d\'écran est disponible, faites la mise à jour maintenant! \r\nCliquez sur Oui pour faire la mise à jour, pour la faire vous devez fermer le navigateur...\r\n Si vous avez déjà fait la mise à jour, vous pouvez donc rouvrir le navigateur...',
		capture_other_update:'La nouvelle version du plug-in de capture d\'écran en ligne est disponible, faites la mise à jour maintenant! \r\n Cliquez sur Oui pour faire la mise à jour...',
		news_download:'Télécharger',
		news_cancel_trans:'Retour',
		news_trans_success: 'Ajouter réussie', //上传成功
		news_trans_retry: 'Re-upload', //重新上传
		news_trans_failure_size: 'S\'il vous plaît télécharger moins {$maxsize} fichier MB', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Upload ne prend en charge les types de fichiers suivants: {$type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure:'Echec de chargement',
		news_trans_cancel:'Envoi annulé',
		news_trans_size: 'Le fichier est trop grand',
		news_trans_type: 'Ne pas soutenir ce type de fichier',
		news_new:'Nouveau message',
        message_prompt:'Pas de service à la clientèle en ligne,[link href="javascript:void(0);"]Message[/link]',
		button_face:'Expression',
		button_file:'Fichiers',
		button_image:'Images',
		button_save:'Sauvegarder',
		button_view:'Chat log',
		button_captureImage:'Capture d\'écran',
		button_evaluation:'Evaluer ',
		button_change_csr: 'Remplacer service', //更换客服
		button_switch_manual: 'la main',
		button_more:'Plus',
		button_history: 'Retour',
		button_end_session:'Fin',
		button_start_session:'Continuer',
		button_enter:'Entrer',
		button_ctrl_enter:'Ctrl+Enter',
		button_capture_show_chatWin: '',
		button_capture_hidden_chatWin: '',
		back_button_text:'Retour',
		dest_sign_text:'Présentation du business',
		default_textarea_text:'Je voudrais demander...',
		send_button_text:'Envoyer un message',
		default_evaluation_form_title:'Evaluation de service ',
		default_evaluation_form_fields: [
			{title:"Merci pour votre soutien, et veuillez évaluer mon service s'il vous plaît",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"Parfait",value:"5"},
				{text:"Bonne",value:"4"},
				{text:"Normal",value:"3"},
				{text:"Mauvais",value:"2"},
				{text:"Pire",value:"1"}
			], message:["Veuillez évaluer le service du représentant",""]},
			{title:"Commenter", multipart: true,name:"proposal",type:"textarea","defaultText":"Merci pour vos commentaires. Nous allons faire mieux.",required:false,max:200,message:["","","200 caractères au maximum"]}
		],
		default_message_form_fields:[
			{title:"Nom",name:"msg_name",type:"text","defaultText":"Veuillez entrer votre vrai nom",required:true,message:["Veuillez entrer votre pseudo"]},
			{title:"Téléphone",name:"msg_tel",type:"text","defaultText":"Veuillez entrer les numéros de votre téléphone portable et de maison",required:true,verification:"phone",message:["Veuillez entrer votre numéro de téléphone","Mauvais format"]},
			{title:"Email",name:"msg_email",type:"text","defaultText":"Se il vous plaît indiquer votre adresse e-mail",required:false,verification:"email",message:["Se il vous plaît indiquer votre adresse e-mail","Mauvais format"]},
			{title:"Commentaires",name:"msg_content",type:"textarea","defaultText":"Veuillez entrer vos questions bien détaillées, et nous vous contacterons dès que possible.",required:true,max:400,message:["Les commentaires ne peuvent pas être vides","","400 caractères au maximum"]}
		],
		default_submitinfo_form_title:'',
		default_submitinfo_form_fields: [
			{title:"Questions",name:"tips_question",type:"text","defaultText":"",required:true,message:["Veuillez donner un titre à votre question"]},
			{title:"Type de Question",name:"tips_type",type:"select","defaultText":"- Choisir un type -",required:true, options:[
				"Pré-vente",
				"Remboursement & Remplacement ",
				"Logistique",
				"Suggestions d'approvisionnement simple"
			]},
			{title:"Nom du client",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"Numéro de téléphone",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"Email",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
		message_success:'Commentaires soumis!',
		message_no_null:'*',
		message_no_null_char:'(Obligatoire)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
