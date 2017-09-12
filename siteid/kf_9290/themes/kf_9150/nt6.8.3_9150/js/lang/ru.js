(function($){
	$.lang = {
		language: 'ru',
		robot_name: 'робот',
		robot_question_tip: 'Ответить числа могут быть получены соответствующие ответы',
		chat_title_ext: '(Пробная версия neng)',
		chat_xiaoneng_version: 'neng',
		chat_button_close: 'выключить',
		chat_button_min: 'минимизировать',
		chat_button_resize_max: 'расширять',
		chat_button_resize_min: 'уменьшить',
		chat_button_send: 'отправить',
		chat_button_audio: 'Удерживайте говорить',
		chat_button_audio_end: 'Это запись...',
		chat_button_audio_fingerup: 'Пальцы скольжения, отменить отправку', //手指上滑，取消发送
		chat_button_audio_freefinger: 'Отпустите палец, чтобы отменить отправку', //松开手指，取消发送
		chat_button_audio_shorttime: 'Время разговора слишком коротка', //说话时间太短
		chat_button_audio_error: 'Микрофоны не могут быть использованы', //麦克风无法使用
		chat_info_loading: 'загрузится...',
		chat_info_failure: 'неушпешно загрузится',
		chat_info_reload: 'перезагрузить',
		chat_show_website: 'просматривать веб - страницы',
		message_upload_failure: 'Приложение не удалось запустить!',
		message_button_submit: 'сообщение',
		evaluation_button_submit: 'отзыв',
		evaluation_button_cancel: 'отмено',
		rightlabel: {
			about: {title:'о компании',selected:true},
			faq: {title:'частные встречаемые вопросы',selected:false}
		},
		goodsinfo: {
			marketprice:"рыночная цена",
			siteprice:	"продажная цена",
			score:		"отметка",
			sizelist:	"цвет",
			colorlist:	"размер"
		},
		toolbar_default_text: 'новый диалог',
		toolbar_min_title: '{$destname}',
		toolbar_min_news: 'у вас {$count} непрочитанное сообщение',
		system_title_news: '{$name}Обслуживание клиентов для вас',
		system_first_news: 'Здравствуйте,добро пожаловать{$name},чем я могу вам помочь?',
		system_merge_session: 'Вы должны открыть один и тот же уровень обслуживания клиентов {$destname} сессии,сессия была объединена',
		system_allocation_service: 'Вам распределят обслуживания клиентов,подождите,пожалуйста',
		system_queue1: 'Вы в настоящее время в очереди,вы пришли в первые {$count} бит.{$br}Если вы не хотите ждать,пожалуйста {$torobot} [link message={$settingid} source=2]сообщение[/link],мы свяжемся с Вами как можно скорее !',
		system_mobile_queue1:'К сожалению, советы чрезмерное количество вашей позиции занимает {$count} [link message={$settingid} source=2]  Нажмите на сообщение[/link]',
		system_queue2: 'Вы в настоящее время в очереди,вы пришли в первые {$count} бит.',
		system_mobile_queue2: 'К сожалению, советы чрезмерное количество вашей позиции занимает {$count}',
		system_robot_queue1: 'Вы в настоящее время в очереди, вы ранжируются № {$count}. {$br}Если вы не хотите ждать, пожалуйста, [link robot]продолжайте и робототехника сессии[/link] или [link message={$settingid} source=2]оставить сообщение[/link], мы свяжемся с вами как можно скорее!',
		system_robot_queue2: 'Вы в настоящее время в очереди, вы ранжируются № {$count}. {$br}Если вы не хотите ждать, пожалуйста, [link robot]продолжайте и робототехника сессии[/link], мы свяжемся с вами как можно скорее!',
		system_robot_offline1: 'Искусственное обслуживание клиентов не в сети, вы можете [link robot]продолжайте и робототехника сессии[/link] или [link message={$settingid} source=2]оставить сообщение[/link], мы свяжемся с вами как можно скорее!',
		system_robot_offline2: 'Искусственное обслуживание клиентов не в сети, вы можете [link robot]продолжайте и робототехника сессии[/link], мы свяжемся с вами как можно скорее!',
		system_to_robot: '[link robot]в свою очередь  робот[/link] или',
		system_to_artificial: 'Мы успешно перейти на ручное обслуживание клиентов',
		system_no_user: 'В настоящее время в Группе обслуживания клиентов, не существует или не настроен прием клиентов!',
		system_online: 'Обслуживание клиентов {$destname} рад служить вам !',
		system_offline:'Обслуживание клиентов {$destname} вне форума,пожалуйста [link message={$settingid} source=4]сообщение[/link]',
		system_abnormal: 'Из-за аномальных соединений,пытаются восстановить . Если вы не хотите ждать,пожалуйста[link message={$settingid} source=3]сообщение[/link], мы ответим вам как можно скорее .',
		system_failure: 'Ваше соединение было прервано,[link reconnect={$settingid}]Повторить [/link]',
		system_connect_timeout: 'Превышено время ожидания подключения к серверу,рекомендуется проверить сетевое окружение.',
		system_connect_wait: 'сейчас сеть не стабильная,переподключается к серверу.',
		system_change_session: 'Обслуживание клиентов {$destname} чтобы продолжить,чтобы служить вам',
		system_add_session: 'Обслуживание клиентов {$destname} присоединиться к текущей сессии',
		system_switch_session: 'Вы были заменены {$destname} обслуживания клиентов, для обслуживания клиентов вы !',
		system_go_away_session: 'Обслуживание клиентов {$destname} Оставив текущую сессию',
		system_auto_disconnect: 'Вы долго не говорили,система автоматическо отключить разговор.',
		system_end_session: 'разговор окончился',
		system_before_evaluation: 'Вы ещё не оценили сервис обслуживания клиентов,вы уедете из текущего страницы?',
		system_evaluation: 'Ваши комментарии "{$evaluation}" был представлен.',
		system_evaluation_failure: 'не удалось представить отзыв!',
		system_mobile_evaluation: 'Новости совет: спасибо вам за оценки',
		system_fast_messaging: 'Вы отправляете сообщения слишком быстро,Подождите,пожалуйста.',
		system_send_failure: 'Не удалось отправить сообщение ![link href=javascript:void(0);]Клуб [/link]',
		system_send_timeout: 'Превышено время ожидания подключения к серверу,не удалось отправить сообщение',
		system_no_free_user: 'На данный момент не бесплатно обслуживания клиентов', //当前没有空闲的客服
		system_over_rechatnum: 'Замена более чем максимальное число обслуживания клиентов', //超过最大更换客服数量
		system_upload_compress: 'Архивирование',	//正在压缩
		system_upload_start: 'Выгрузка', //正在上传
		system_picture_error_type: 'Фотографии неправильного типа', //图片类型有误
		system_picture_error_size: 'Изображение слишком велико', //图片太大
		system_giveup_wait: 'Вы откажетесь очереди', //您是否放弃排队
		system_giveup_submit: 'подтвердить', //确认
		system_no_prev_picture: 'Нет предыдущего изображения', //没有上一张图片
		system_no_next_picture: 'Нет следующая картина', //没有下一张图片
		system_leave_message: 'Оставьте сообщение', //留言
		system_config_error: 'Данные не удалось загрузить, пожалуйста, перезагрузите', //数据加载失败，请重新加载
		system_printing: 'печатает', //正在输入
		system_cookie: 'Она рекомендуется включить куки', //建议开启cookie
		capture_forbidden: 'sorry, this browser don\'t support this capture plugin!',
        capture_reload: 'онлайн скриншоты браузера контроля был остановить,пожалуйста,в долгосрочной перспективе после настройки позволяет Обновить страницу',
		capture_install: 'Вы еще не установили управление захват экрана,кликнить да чтобы установить . Установка управление захват экрана,необходимо закрыть окно браузера.Если вы уже установили \r\nПожалуйста,выключите затем сново открыть браузер',
		capture_activex_update: 'Скриншот управления имеет новую версию,вы можете использовать после обновления ! \r\n точка для определения обновления при обновлении необходимости закрывать окно браузера ... \r\n Если вы уже обновили установку,выключите Откройте браузер ...',
		capture_other_update: 'Сейчас на сайте Скриншоты подключить новую версию,вы можете использовать после обновления ! \r\n точка для определения обновления...',
		news_download: 'скачать',
		news_cancel_trans: 'отменить отправить',
		news_trans_success: 'Загрузка успешно завершена', //上传成功
		news_trans_retry: 'Повторно загрузить', //重新上传
		news_trans_failure_size: 'Пожалуйста, загрузите меньше {$maxsize}MB файл', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'Загрузить только поддерживает следующие типы файлов: {$type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure: 'Загрузить не удалось',
		news_trans_cancel: 'отменили отправить',
		news_trans_size: 'Файл слишком большой ',
		news_trans_type: 'Этот тип  файла  не поддерживается ',
		news_new: 'новое сообщение',
		button_face: 'мимика',
		button_file: 'файл',
		button_image: 'фото',
		button_save: 'сохранить',
		button_view: 'чат записи',
		button_captureImage: 'скриншот',
		button_evaluation: 'обзор',
        button_change_csr: 'Заменить службу',
		button_switch_manual: 'рука',
		button_more: 'больше',
		button_history: 'возвращение',
		button_end_session: 'разговор окончилось',
		button_start_session: 'продолжать разговор',
		button_enter: 'Enter',
		button_ctrl_enter: 'Ctrl+Enter',
		button_capture_show_chatWin: '',
		button_capture_hidden_chatWin: '',
		back_button_text: 'возвращение',
		dest_sign_text: 'Бизнес-презентация',
		default_textarea_text: 'хочу спросить...',
		send_button_text: 'отправить сообщение',
		default_evaluation_form_title: 'оценивать сервис',
		default_evaluation_form_fields: [
			{title:" Пожалуйста,  я  службы  оценки",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"Очень доволен",value:"5"},
				{text:"доволен",value:"4"},
				{text:"так себе",value:"3"},
				{text:"не доволен",value:"2"},
				{text:"Очень не доволен",value:"1"}
			], message:["Пожалуйста,оцените сервис обслуживания клиентов",""]},
			{title:"Рекомендации  и обратной связи",multipart: true,name:"proposal",type:"textarea","defaultText":"Спасибо за ваш отзыв,мы будем стараться делать лучше",required:false,max:200,message:["","","Максимум 200 символов"]}
		],
		default_message_form_fields:[
			{title:"полное имя",name:"msg_name",type:"text","defaultText":"Пожалуйста,заполните ваше настоящее имя",required:true,message:["Пожалуйста,заполните ваше настоящее имя"]},
			{title:"номер телефона",name:"msg_tel",type:"text","defaultText":"Пожалуйста,заполните номер мобильного или фиксированного телефона",required:true,verification:"phone",message:["Пожалуйста, заполните номер мобильного или фиксированного телефона","Пожалуйста, заполните номер мобильного или фиксированного телефона"]},
			{title:"электронная почта",name:"msg_email",type:"text","defaultText":"Пожалуйста, введите Ваш адрес электронной почты",required:false,verification:"email",message:["Пожалуйста, введите Ваш адрес электронной почты","Адрес электронной почты неверен"]},
			{title:"сообщение",name:"msg_content",type:"textarea","defaultText":"Пожалуйста, подробно запишите ваши вопросы , мы будем в контакте с вами как скорее.",required:true,max:400,message:["Содержание сообщения не может быть пустым.","","Максимум 400 символов"]}
		],
		default_submitinfo_form_title: '',
		default_submitinfo_form_fields: [
			{title:"вопрос",name:"tips_question",type:"text","defaultText":"",required:true,message:["Пожалуйста, заполните название вопроса"]},
			{title:"тип вопросов",name:"tips_type",type:"select","defaultText":"-Пожалуйста, выберите типы вопросов-",required:true, options:[
				"Предварительная консультация",
				"услуг возврата товара",
				"Логистический консалтинг",
				"рекомендация по не хватке товаров"
			]},
			{title:"Имя клиента",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"контакт",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"электронная почта",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
        message_prompt:'без  обслуживания клиентов  онлайн  ,[link href="javascript:void(0);"]сообщение[/link]',
		message_success: 'Сообщение отправлено успешно!',
		message_no_null: '*',
		message_no_null_char: '(обязательно заполнить)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
