(function($){
	$.lang = {
		language: 'ja_jp',
		robot_name: 'ロポット',
		robot_question_tip: '番号を入力すればマッチした答えがあります',
		chat_title_ext: '(小能試用版)',
		chat_xiaoneng_version: '小能科技',
		chat_button_close: '閉じる',
		chat_button_min: '最小化',
		chat_button_resize_max: '拡大する',
		chat_button_resize_min: '小さくする',
		chat_button_send: '発送',
		chat_button_audio: '押しまま話す',
		chat_button_audio_end: '録音中……',
		chat_button_audio_fingerup: '指が送信キャンセル、スリップ', //手指上滑，取消发送
		chat_button_audio_freefinger: '送信キャンセルする指を離し', //松开手指，取消发送
		chat_button_audio_shorttime: '通話時間が短すぎます', //说话时间太短
		chat_button_audio_error: 'マイクを使用することはできません', //麦克风无法使用
		chat_info_loading: '読み込み中...',
		chat_info_failure: '接続できません',
		chat_info_reload: '再読込み',
		chat_show_website: 'ホームページをオープン',
		message_upload_failure: '添付ファイルをアップロードできない!',
		message_button_submit: 'メッセージ',
		evaluation_button_submit: 'ご評価',
		evaluation_button_cancel: '取り消す',
		rightlabel: {
			about: {title:'会社について',selected:true},
			faq: {title:'よくある質問',selected:false}
		},
		goodsinfo: {
			marketprice:"市場価格",
			siteprice:	"販売価格",
			score:		"好評率",
			sizelist:	"サイズ",
			colorlist:	"カラー"
		},
		toolbar_default_text: '新たな会話',
		toolbar_min_title: '{$destname}',
		toolbar_min_news: '{$count}件の未読',
		system_title_news: '{$name}のオペレーターがご案内申し上げます',
		system_first_news: '{$name}「ダイマイ」にようこそ！どんなご用件でしょうか？',
		system_merge_session: '同一のオペレーター {$destname} と話し中、，会話が合併されました',
		system_allocation_service: 'オペレーターを繋いでいます、このままお待ちください...',
		system_queue1: '列に並んでいます，只今第{$count}番です。{$br}お待ちしたくない場合，{$torobot}[link message={$settingid} source=2]【メッセージ】[/link]，なるべく早くご連絡致します！',
		system_mobile_queue1:'申し訳ありませんが、あなたのランクの位置{$​​count}の過剰な数を助言 [link message={$settingid} source=2]  メッセージをクリックして、[/link]',
		system_queue2: '列に並んでいます，只今第{$count}番です。',
		system_mobile_queue2: '申し訳ありませんが、あなたのランクの位置{$​​count}の過剰な数を助言',
		system_robot_queue1: 'あなたが現在キューに、あなたが第{$count}位にランクされています。{$br}待機したくない場合は、[link robot]続行し、ロボットセッション[/link]また[link message={$settingid} source=2]はメッセージを残してください[/link]、我々はできるだけ早くご連絡させていただきます！',
		system_robot_queue2: 'あなたが現在キューに、あなたが第{$count}位にランクされています。{$br}待機したくない場合は、[link robot]続行し、ロボットセッション[/link]、我々はできるだけ早くご連絡させていただきます！',
		system_robot_offline1: '人工顧客サービスがオンラインでない後で手動顧客サービスに切り替え、は[link robot]続行し、ロボットセッション[/link]また[link message={$settingid} source=2]はメッセージを残してください[/link]、我々はできるだけ早くご連絡させていただきます！',
		system_robot_offline2: '人工顧客サービスがオンラインでない後で手動顧客サービスに切り替え、は[link robot]続行し、ロボットセッション[/link]、我々はできるだけ早くご連絡させていただきます！',
		system_to_robot: '[link robot]【ロポットに接続】[/link]又は',
		system_to_artificial: '我々は成功し、マニュアル顧客サービスに切り替えています',
		system_no_user: '選択されたオペレーターが存在しない又はオペレーターを繋いでいない！',
		system_online: 'オペレーター {$destname} がご案内します！',
		system_offline:'オペレーター {$destname} がオフライン, [link message={$settingid} source=4]【メッセージ】[/link]',
		system_abnormal: '接続中にエラーが発生しました、再接続を試してます。お待ちしたくない場合，[link message={$settingid} source=3]【メッセージ】[/link]，を残してください[/link]、なるべく早くご連絡致します。',
		system_failure: '接続が中断した、再度 [link reconnect={$settingid}]【お試してください】[/link]',
		system_connect_timeout: 'サーバーに接続できません、ネットワークを確認してください。',
		system_connect_wait: 'ネットワークが不安定，サーバーに再接続中。',
		system_change_session: 'オペレーター {$destname} は続きてご案内します',
		system_add_session: 'オペレーター {$destname} は当該会話を参加します',
		system_switch_session: 'オペレーターが変更されました，{$destname}のオペレーターがご案内します！',
		system_go_away_session: 'オペレーター {$destname} が当該会話から離れました',
		system_auto_disconnect: '長い間で発言しないため、会話が中止されました。',
		system_end_session: '会話が終了',
		system_before_evaluation: 'まだご評価を頂けないまま、当該画面から離れますか？',
		system_evaluation: 'ご評価“{$evaluation}”を提出されました。',
		system_evaluation_failure: 'ご評価を提出失敗！',
		system_mobile_evaluation: 'メッセージ:ご評価ありがとうございます',
		system_fast_messaging: '送信するスピードは速すぎて、少し休んでもいいですか。',
		system_send_failure: '送信失敗！[link href=javascript:void(0);]再送信[/link]',
		system_send_timeout: '接続がタイムアウトしました、送信失敗',
		system_no_free_user: '只今は変更できるオペレーターがいません', //当前没有空闲的客服
		system_over_rechatnum: 'オペレーターを変更する回数を超えました', //超过最大更换客服数量
		system_upload_compress: 'ビュン',	//正在压缩
		system_upload_start: 'アップロード', //正在上传
		system_picture_error_type: '間違ったタイプの写真', //图片类型有误
		system_picture_error_size: '絵が大きすぎます', //图片太大
		system_giveup_wait: 'あなたは、キューを与えるだろう', //您是否放弃排队
		system_giveup_submit: '確認します', //确认
		system_no_prev_picture: 'いいえ前の画像はありません', //没有上一张图片
		system_no_next_picture: 'いいえ次の画像はありません', //没有下一张图片
		system_leave_message: '伝言を残します', //留言
		system_config_error: 'データの読み込みに失敗し、リロードしてください。', //数据加载失败，请重新加载
		system_printing: '入力されました', //正在输入
		system_cookie: 'それはあなたがクッキーを有効にすることをお勧め', //建议开启cookie
		capture_forbidden: 'ブラウザはインストールをインストールしないで、ブラウザはFXツールあるいはその他のQAツールを持参して下さい.',
		capture_reload: 'スクリーンショットコントロールはブラウザに拒否されました、常に許可を設定してページを更新してください',
		capture_install: 'スクリーンショットのコントロールをインストールされせん、確認をクリックしてインストール\r\nスクリーンショットコントロールのインストールを実行するには現在開いているブラウザを一旦終了必要があります...\r\nインストールが完了する場合、ブラウザを閉じて再度オープンしてください...',
		capture_activex_update: 'スクリーンショットコントロールの新しいパージョンアップデート後使用できる！\r\n確認をクリックしてアップデート、ブラウザを一旦終了必要があります...\r\nアップデートのインストールが完了する場合、ブラウザを閉じて再度オープンしてください...',
		capture_other_update: 'スクリーンショットコントロールの新しいパージョンアップデート後使用できる！\r\n確認をクリックしてアップデート...',
		news_download: 'ダンロード',
		news_cancel_trans: '発送を取消す',
		news_trans_success: '成功したアップロード', //上传成功
		news_trans_retry: '再アップロード', //重新上传
		news_trans_failure_size: '{$maxsize} MBのファイル未満をアップロードしてください。', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: 'のみアップロードすると、次のファイルタイプをサポートしています: ${type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure: 'アップロード失敗',
		news_trans_cancel: '発送が取り消されました',
		news_trans_size: 'ファイルが大きいすぎ',
		news_trans_type: 'このタイプのファイルをサポートしません',
		news_new: '新メッセージ',
		button_face: '表情',
		button_file: 'ファイル',
		button_image: '写真',
		button_save: '保存',
		button_view: 'チャット履歴',
		button_captureImage: 'スクリーンショット',
		button_evaluation: 'ご評価',
		button_change_csr: 'オペレーターを変更',
		button_switch_manual: '担当者に接続',
		button_more: 'もっと',
		button_history: '戻す',
		button_end_session: '会話を終わらせる',
		button_start_session: '会話を継続する',
		button_enter: 'Enter',
		button_ctrl_enter: 'Ctrl+Enter',
		button_capture_show_chatWin: 'ウィンドウを隠しない',
		button_capture_hidden_chatWin: 'ウィンドウを隠す',
		back_button_text: '戻す',
		dest_sign_text: '業務紹介',
		default_textarea_text: 'ご質問を書く',
		send_button_text: 'メッセージを発送',
		default_evaluation_form_title: 'サービスをご評価',
		default_evaluation_form_fields: [
			{title:"どうぞ、私の今回のサービスにご評価いただけないでしょうか",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"非常に満足",value:"5"},
				{text:"満足",value:"4"},
				{text:"普通",value:"3"},
				{text:"不満あり",value:"2"},
				{text:"非常に不満",value:"1"}
			], message:["オペレーターをご評価をいただけないでしょうか", ""]},
			{title:"ご提案、フィードバック", multipart: true,name:"proposal",type:"textarea","defaultText":"ご意見、ご感想を書く",required:false,max:200,message:["","","最大入力文字数100文字です"]}
		],
		default_message_form_fields:[
			{title:"お名前",name:"msg_name",type:"text","defaultText":"真実のお名前を入力してください",required:true,message:["ニックネームを入力してください"]},
			{title:"電話",name:"msg_tel",type:"text","defaultText":"固定又は携帯電話番号を入力してください",required:true,verification:"phone",message:["電話番号を入力してください","電話番号のフォーマットミス"]},
			{title:"メールアドレス",name:"msg_email",type:"text","defaultText":"メールアドレスを入力してください",required:false,verification:"email",message:["メールアドレスを入力してください","メールアドレスフォーマットミス"]},
			{title:"メッセージ",name:"msg_content",type:"textarea","defaultText":"ご質問を詳しく書き込んでください、なるべく早くご連絡致します。",required:true,max:400,message:["空白の無いようにお願いします","","最大入力文字数200文字です"]}
		],
		default_submitinfo_form_title: '',
		default_submitinfo_form_fields: [
			{title:"問題",name:"tips_question",type:"text","defaultText":"",required:true,message:["件名をご記入ください"]},
			{title:"問題のカテゴリー",name:"tips_type",type:"select","defaultText":"-問題のカテゴリーを選択してください-",required:true, options:[
				"購入する前のお問い合わせ",
				"商品の返品、交換",
				"配送状況の確認",
				"品切れにつき"
			]},
			{title:"お客様のお名前",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"電話番号",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"メールアドレス",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
        message_prompt:'サービスがない、[link href="javascript:void(0);"]メッセージを[/link]',
		message_success: 'メッセージを提出しました！',
		message_no_null: '*',
		message_no_null_char: '(必填)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
