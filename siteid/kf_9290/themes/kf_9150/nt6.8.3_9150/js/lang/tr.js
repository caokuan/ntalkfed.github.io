(function($){
	$.lang = {
		language: 'tr',
		robot_name: 'robot',
		robot_question_tip: 'Yanıt sayıları, onlara karşılık gelen cevaplardan elde edilebilir.',
		chat_title_ext: '(Xiaoneng çevrimiçi müşteri hizmetleri deneme sürümü)',
		chat_xiaoneng_version: 'Xiaoneng Technology Co.Ltd',
		chat_button_close: 'Kapat',
		chat_button_min: 'Küçült',
		chat_button_resize_max: 'Yakınlaştır',
		chat_button_resize_min: 'Uzaklaştır',
		chat_button_send: 'Gönder',
		chat_button_audio: 'Bekleyin',
		chat_button_audio_end: 'Bantta...',
		chat_button_audio_fingerup: 'Parmaklarınızı koyun, göndermeyi iptal edin', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Parmaklarınızı kaldırın, göndermeyi iptal edin', //松开手指，取消发送
		chat_button_audio_shorttime: 'Kısa konuşma', //说话时间太短
		chat_button_audio_error: 'Çalışmayan mikrofon', //麦克风无法使用
		chat_info_loading: 'Yükleniyor...',
		chat_info_failure: 'Yükleme başarısız',
		chat_info_reload: 'Yeniden yükle',
		chat_show_website: 'Web sayfalarını görüntüle',
		message_upload_failure: 'Ek yükleme başarısız',
		message_button_submit: 'Mesaj panosu',
		evaluation_button_submit: 'Değerlendirme',
		evaluation_button_cancel: 'İptal',
		rightlabel: {
			about: {title:'Hakkımızda',selected:true},
			faq: {title:'SSS',selected:false}
		},
		goodsinfo: {
			marketprice:"Piyasa Fiyatı",
			siteprice:	"Satış Fiyatı",
			score:		"Puan",
			sizelist:	"Renk",
			colorlist:	"Boyut"
		},
		toolbar_default_text: 'Yeni Oturum',
		toolbar_min_title: '{$destname}',
		toolbar_min_news: '{$count} okunmamış mesajınız var. ',
		system_title_news: '{$name} size yardım etmek için burada.',
		system_first_news: 'Merhaba, {$name}\'e hoş geldiniz, Sizin için ne yapabilirim?',
		system_merge_session: '{$destname} ile sohbet ediyorsunuz, oturum burada birleştirildi.',
		system_allocation_service: 'Şimdi size bir müşteri hizmetleri temsilcisi tahsis ediyoruz, lütfen biraz bekleyin...',
		system_queue1: 'Şu an sıradaki {$count}. kişisiniz.{$br}İsterseniz {$torobot} bağlantısına tıklayarak bize [link message={$settingid} source=2]mesaj gönderebilirsiniz.[/link]',
		system_mobile_queue1:'',
		system_queue2: 'Şu an sıradaki {$count}. kişisiniz.',
		system_mobile_queue2: '',
		system_robot_queue1: '',
		system_robot_queue2: '',
		system_robot_offline1: '',
		system_robot_offline2: '',
		system_to_robot: '[link robot]Robota dön[/link] veya',
		system_to_artificial: '',
		system_no_user: 'Şu anda müşteri hizmeti kullanılamıyor veya alıcı grup, müşteri hizmetini yapılandırmamış!',
		system_online: '{$destname} size hizmet etmekten mutluluk duyuyor!',
		system_offline:'{$destname} çevrimdışı, lütfen [link message={$settingid} source=4] bize[/link] mesaj atın.',
		system_abnormal: 'Sunucu bağlantı hatası, yeniden bağlanılıyor. İsterseniz [link message={$settingid} source=3] bize[/link] mesaj atabilirsiniz, size en kısa zamanda ulaşacağız!',
		system_failure: 'Bağlantınızda hata oluştu, [link reconnect={$settingid}] yeniden deneyin[/link].',
		system_connect_timeout: 'Sunucu bağlantısında zaman aşımı oluştu, ağ bağlantınızı kontrol etmenizi öneriyoruz.',
		system_connect_wait: 'Ağ istikrarlı değil, sunucuyla yeniden bağlantı kuruluyor.',
		system_change_session: '{$destname} size hizmet etmeye devam ediyor.',
		system_add_session: '{$destname} bu sohbete katıldı.',
		system_switch_session: 'Müşteri hizmeti türünü değiştirdiniz, {$destname} hizmeti sizin için devrede.',
		system_go_away_session: 'Şimdi {$destname} temsilcisine aktarıldınız.',
		system_auto_disconnect: 'Sessizlik uzun sürdü, sunucu bağlantısı kesildi.',
		system_end_session: 'Sohbet önceden bitti.',
		system_before_evaluation: 'Müşteri hizmetlerini değerlendirmediniz, sayfadan çıkmak istediğinizden emin misiniz?',
		system_evaluation: '"{$evaluation}" gönderdiniz!',
		system_evaluation_failure: 'Değerlendirmeniz gönderilemedi!',
		system_mobile_evaluation: 'Mesaj: değerlendirmeniz için teşekkür ederiz.',
		system_fast_messaging: 'Çok hızlı yazıyorsunuz, lütfen önce biraz soluklanın.',
		system_send_failure: 'Mesaj gönderilemedi! [link href=javascript:void(0);]mesajı yeniden gönder[/link]',
		system_send_timeout: 'Bağlantı hatası, mesaj gönderilemedi!',
		system_no_free_user: 'Müşteri Hizmetleri kullanılamıyor.', //当前没有空闲的客服
		system_over_rechatnum: 'Müşteri Hizmetleri miktarındaki limit aşıldı.', //超过最大更换客服数量
		system_upload_compress: 'Sıkıştırılıyor',	//正在压缩
		system_upload_start: 'Yükleniyor', //正在上传
		system_picture_error_type: 'Yanlış resim türü', //图片类型有误
		system_picture_error_size: 'Aşırı büyük resim', //图片太大
		system_giveup_wait: 'Sıradan çıkıyor musunuz?', //您是否放弃排队
		system_giveup_submit: 'Evet', //确认
		system_no_prev_picture: 'Son resim bulunamadı', //没有上一张图片
		system_no_next_picture: 'Sonraki resim bulunamadı', //没有下一张图片
		system_leave_message: 'Mesaj bırakma', //留言
		system_config_error: 'Veri yükleme başarısız, lütfen yeniden yükleyin.', //数据加载失败，请重新加载
		system_printing: 'Giriliyor', //正在输入
		system_cookie: 'iPhone\'da çerez açma', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
		capture_reload: 'Tarayıcı tarafından çevrimiçi ekran görüntüsü kontrolleri durdu, lütfen uzun süreden sonra mevcut sayfayı yenilemeye ayarlayın.',
		capture_install: 'Ekran görüntüsü kontrolünü kurmamışsınız, kurmak için Tamam\'a tıklayın \r\nKontrolü kurmak için, öncesinde tarayıcıyı kapatmalısınız...\r\nKurduysanız, lütfen tarayıcıyı kapatıp yeniden açın ...',
		capture_activex_update: 'Ekran görüntüsü kontrolünün yeni versiyonu mevcut, yazılımı kullanmadan önce yükseltme yapmanız gerekir! \r\nYükseltmek için Tamam\'a tıklayın. Kontrolü kurmak için, öncesinde tarayıcıyı kapatmalısınız...\r\nKurduysanız, lütfen tarayıcıyı kapatıp yeniden açın ...',
		capture_other_update: 'Ekran görüntüsü kontrolünün yeni versiyonu mevcut, yazılımı kullanmadan önce yükseltme yapmanız gerekir! \r\nYükseltmek için Tamam seçeneğine tıklayın...',
		news_download: 'İndir',
		news_cancel_trans: 'Dosya yüklemeyi iptal et',
		news_trans_success: 'Yükleme başarılı!', //上传成功
		news_trans_retry: 'Yeniden yükle!', //重新上传
		news_trans_failure_size: 'Lütfen yükleyeceğiniz dosyanın boyutu en fazla ($maxsize) MB olsun.', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Lütfen $(type) türü dosya yükleyin.', //仅支持以下上传文件类型：$(type)
		news_trans_failure: 'Yükleme başarısız',
		news_trans_cancel: 'Yükleme iptal edildi',
		news_trans_size: 'Aşırı büyük resim',
		news_trans_type: 'Yanlış resim türü',
		news_new: 'Yeni mesaj ',
		button_face: 'İfadeler',
		button_file: 'Dosya',
		button_image: 'Görüntü',
		button_save: 'Kaydet',
		button_view: 'Sohbet Geçmişi',
		button_captureImage: 'Fotoğraf Çek',
		button_evaluation: 'Değerlendirme',
		button_change_csr: 'Müşteri hizmetlerine geçmek için', //更换客服
		button_switch_manual: 'Manuele Dön',
		button_more: 'Daha Fazla',
		button_history: 'Geri',
		button_end_session: 'Sohbeti Bitir',
		button_start_session: 'Sohbete Devam Et',
		button_enter: 'Gir',
		button_ctrl_enter: 'Ctrl+Enter',
		button_capture_show_chatWin: 'Pencereyi gizleme',
		button_capture_hidden_chatWin: 'Pencereyi gizle',
		back_button_text: 'Geri',
		dest_sign_text: 'İşletmemiz',
		default_textarea_text: 'Şunu sormak istiyorum:',
		send_button_text: 'Gönder',
		default_evaluation_form_title: 'Değerlendirme',
		default_evaluation_form_fields: [
			{title:"Lütfen hizmetimi değerlendirin",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"çok memnun kaldım",value:"5"},
				{text:"memnun kaldım",value:"4"},
				{text:"orta",value:"3"},
				{text:"memnun kalmadım",value:"2"},
				{text:"hiç memnun kalmadım ",value:"1"}
			], message:["Lütfen müşteri hizmetlerini değerlendirin", ""]},
			{title:"Öneri ve geri bildirim", multipart: true,name:"proposal",type:"textarea","defaultText":"Geri bildiriminizden dolayı teşekkür ederiz, daha sıkı çalışmaya devam edeceğiz.",required:false,max:200,message:["","","Önerilen sözcük sınırı 200 karakter."]}
		],
		default_message_form_fields:[
			{title:"ad",name:"msg_name",type:"text","defaultText":"Lütfen adınızı yazın",required:true,message:["Lütfen adınızı yazın"]},
			{title:"telefon",name:"msg_tel",type:"text","defaultText":"Lütfen ev veya cep telefonunuzu yazın",required:true,verification:"phone",message:["Lütfen telefon numaranızı yazın","Telefon numarası format hatası"]},
			{title:"e-posta",name:"msg_email",type:"text","defaultText":"",required:false,verification:"E-email",message:["","E-posta format hatası"]},
			{title:"mesaj",name:"msg_content",type:"textarea","defaultText":"Lütfen probleminizi ayrıntılı olarak yazın, en kısa zamanda size ulaşacağız.",required:true,max:400,message:["Mesaj boş olamaz.","","Sözcük sınırı 200 karakterdir."]}
		],
		default_submitinfo_form_title: '',
		default_submitinfo_form_fields: [
			{title:"Soru",name:"tips_question",type:"text","defaultText":"",required:true,message:["başlık"]},
			{title:"Soru Türü",name:"tips_type",type:"select","defaultText":"-lütfen yazın-",required:true, options:[
				"Satış öncesi danışma",
				"Satış sonrası hizmet",
				"Lojistik danışma",
				"Stokta yok önerileri"
			]},
			{title:"Ad",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"Telefon",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"E-posta",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
		message_success: 'Mesaj Gönderildi!',
		message_no_null: '*',
		message_no_null_char: '(gerekli)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
