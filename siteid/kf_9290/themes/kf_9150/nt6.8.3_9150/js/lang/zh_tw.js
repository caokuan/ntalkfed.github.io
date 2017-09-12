(function($){
	$.lang = {
		language: 'zh_tw',
		robot_name: '\u6a5f\u5668\u4eba',
		robot_question_tip: '\u56de\u5fa9\u5e8f\u865f\u5373\u53ef\u5f97\u5230\u5c0d\u61c9\u554f\u984c\u7684\u7b54\u6848',
		chat_title_ext: '(\u5c0f\u80fd\u8a66\u7528\u7248)',
		chat_xiaoneng_version: '\u5c0f\u80fd\u79d1\u6280',
		chat_button_close: '\u95dc\u9589',
		chat_button_min: '\u6700\u5c0f\u5316',
		chat_button_resize_max: '\u64f4\u5927',
		chat_button_resize_min: '\u7e2e\u5c0f',
		chat_button_send: '\u767c\u9001',
		chat_button_audio: '\u6309\u4f4f\u8aaa\u8a71',
		chat_button_audio_end: '\u6b63\u5728\u9304\u97f3\u2026\u2026',
		chat_button_audio_fingerup: '\u624b\u6307\u4e0a\u6ed1\uff0c\u53d6\u6d88\u767c\u9001', //手指上滑，取消发送
		chat_button_audio_freefinger: '\u9b06\u958b\u624b\u6307\uff0c\u53d6\u6d88\u767c\u9001', //松开手指，取消发送
		chat_button_audio_shorttime: '\u000d\u000a\u8aaa\u8a71\u6642\u9593\u592a\u77ed', //说话时间太短
		chat_button_audio_error: '\u9ea5\u514b\u98a8\u7121\u6cd5\u4f7f\u7528', //麦克风无法使用
		chat_info_loading: '\u6b63\u5728\u8f09\u5165...',
		chat_info_failure: '\u8f09\u5165\u5931\u6557',
		chat_info_reload: '\u91cd\u65b0\u8f09\u5165',
		chat_show_website: '\u67e5\u770b\u7db2\u9801',
		message_upload_failure: '\u9644\u4ef6\u4e0a\u50b3\u5931\u6557!',
		message_button_submit: '\u7559\u8a00',
		evaluation_button_submit: '\u8a55\u50f9',
		evaluation_button_cancel: '\u53d6\u6d88',
		rightlabel: {
			about: {title:'\u95dc\u65bc\u4f01\u696d',selected:true},
			faq: {title:'\u5e38\u898b\u554f\u984c',selected:false}
		},
		goodsinfo: {
			marketprice:"\u5e02\u5834\u50f9",
			siteprice:	"\u92b7\u552e\u50f9",
			score:		"\u597d\u8a55\u7387",
			sizelist:	"\u5c3a\u3000\u78bc",
			colorlist:	"\u984f\u3000\u8272"
		},
		toolbar_default_text: '\u65b0\u6703\u8a71',
		toolbar_min_title: '{$destname}',
		toolbar_min_news: '\u60a8\u6709 {$count} \u689d\u672a\u8b80\u6d88\u606f',
		system_title_news: '{$name}\u5ba2\u670d\u70ba\u60a8\u670d\u52d9',
		system_first_news: '\u60a8\u597d\uff0c\u6b61\u8fce\u5149\u81e8{$name}\uff0c\u8acb\u554f\u6709\u4ec0\u9ebc\u53ef\u4ee5\u5e6b\u60a8\uff1f',
		system_merge_session: '\u60a8\u5df2\u6253\u958b\u540c\u4e00\u5ba2\u670d {$destname} \u7684\u6703\u8a71\uff0c\u6703\u8a71\u5df2\u5408\u4f75',
		system_allocation_service: '\u6b63\u5728\u70ba\u60a8\u5206\u914d\u5ba2\u670d\uff0c\u8acb\u7a0d\u7b49...',
		system_queue1: '\u60a8\u7576\u524d\u6392\u968a\u4e2d\uff0c\u60a8\u6392\u5728\u7b2c{$count}\u4f4d\u3002{$br}\u5982\u679c\u4e0d\u60f3\u7b49\u5f85\uff0c\u8acb[link message={$settingid} source=2]\u3010\u7559\u8a00\u3011[/link]\uff0c\u6211\u5011\u6703\u5118\u5feb\u806f\u7e6b\u60a8\uff01',
		system_mobile_queue1:'\u62b1\u6b49\uff0c\u8aee\u8a62\u4eba\u6578\u904e\u591a\u60a8\u6392\u5728\u7b2c{$count}\u4f4d [link message={$settingid} source=2] \u9ede\u64ca\u7559\u8a00[/link]',
		system_queue2: '\u60a8\u7576\u524d\u6392\u968a\u4e2d\uff0c\u60a8\u6392\u5728\u7b2c{$count}\u4f4d\u3002',
		system_mobile_queue2: '\u62b1\u6b49\uff0c\u8aee\u8a62\u4eba\u6578\u904e\u591a\u60a8\u6392\u5728\u7b2c{$count}\u4f4d',
		system_robot_queue1: '\u60a8\u7576\u524d\u6392\u968a\u4e2d\uff0c\u60a8\u6392\u5728\u7b2c{$count}\u4f4d\u3002 {$br}\u5982\u679c\u4e0d\u60f3\u7b49\u5f85\uff0c\u8acb[link robot]\u3010\u7e7c\u7e8c\u548c\u6a5f\u5668\u4eba\u3011[/link]\u6703\u8a71\u9084\u662f[link message={$settingid} source=2]\u3010\u7559\u8a00\u3011[/link]\uff0c\u6211\u5011\u6703\u76e1\u5feb\u806f\u7e6b\u60a8\uff01',
		system_robot_queue2: '\u60a8\u7576\u524d\u6392\u968a\u4e2d\uff0c\u60a8\u6392\u5728\u7b2c{$count}\u4f4d\u3002 {$br}\u5982\u679c\u4e0d\u60f3\u7b49\u5f85\uff0c\u53ef\u4ee5[link robot]\u3010\u7e7c\u7e8c\u548c\u6a5f\u5668\u4eba\u3011[/link]\u6703\u8a71\uff0c\u7a0d\u5f8c\u5728\u8f49\u4eba\u5de5\u5ba2\u670d\u3002',
		system_robot_offline1: '\u4eba\u5de5\u5ba2\u670d\u90fd\u4e0d\u5728\u7dda\uff0c\u662f[link robot]\u3010\u7e7c\u7e8c\u548c\u6a5f\u5668\u4eba\u3011[/link]\u6703\u8a71\u9084\u662f[link message={$settingid} source=2]\u3010\u7559\u8a00\u3011[/link]',
		system_robot_offline2: '\u4eba\u5de5\u5ba2\u670d\u90fd\u4e0d\u5728\u7dda\uff0c\u53ef\u4ee5[link robot]\u3010\u7e7c\u7e8c\u548c\u6a5f\u5668\u4eba\u3011[/link]\u6703\u8a71\uff0c\u7a0d\u5f8c\u5728\u8f49\u4eba\u5de5\u5ba2\u670d',
		system_to_robot: '[link robot]\u3010\u8f49\u6a5f\u5668\u4eba\u3011[/link]\u6216',
		system_no_user: '\u7576\u524d\u5ba2\u670d\u4e0d\u5b58\u5728\u6216\u63a5\u5f85\u7d44\u4e2d\u672a\u914d\u7f6e\u5ba2\u670d\uff01',
		system_to_artificial: '\u5df2\u6210\u529f\u8f49\u4eba\u5de5\u5ba2\u670d',
		system_online: '\u5ba2\u670d {$destname} \u5f88\u9ad8\u8208\u70ba\u60a8\u670d\u52d9\uff01',
		system_offline:'\u5ba2\u670d {$destname} \u5df2\u96e2\u7dda,\u8acb [link message={$settingid} source=4]\u3010\u7559\u8a00\u3011[/link]',
		system_abnormal: '\u56e0\u9023\u7dda\u7570\u5e38\uff0c\u6b63\u5728\u5617\u8a66\u91cd\u9023\u3002\u82e5\u4e0d\u60f3\u7b49\u5f85\uff0c\u8acb[link message={$settingid} source=3]\u3010\u7559\u8a00\u3011[/link]\uff0c\u6211\u5011\u6703\u5118\u5feb\u56de\u5fa9\u60a8\u3002',
		system_failure: '\u60a8\u7684\u9023\u7dda\u5df2\u4e2d\u65b7,\u8acb [link reconnect={$settingid}]\u3010\u91cd\u8a66\u3011[/link]',
		system_connect_timeout: '\u9023\u63a5\u4f3a\u670d\u5668\u8d85\u6642\uff0c\u5efa\u8b70\u6aa2\u67e5\u7db2\u8def\u74b0\u5883\u3002',
		system_connect_wait: '\u7576\u524d\u7db2\u8def\u4e0d\u7a69\u5b9a\uff0c\u6b63\u5728\u91cd\u9023\u4f3a\u670d\u5668\u3002',
		system_change_session: '\u5ba2\u670d {$destname} \u7e7c\u7e8c\u70ba\u60a8\u670d\u52d9',
		system_add_session: '\u5ba2\u670d {$destname} \u52a0\u5165\u7576\u524d\u6703\u8a71',
		system_switch_session: '\u60a8\u5df2\u66f4\u63db\u5ba2\u670d\uff0c{$destname}\u5ba2\u670d\u6b63\u7232\u60a8\u670d\u52d9\uff01',
		system_go_away_session: '\u5ba2\u670d {$destname} \u96e2\u958b\u7576\u524d\u6703\u8a71',
		system_auto_disconnect: '\u60a8\u592a\u9577\u6642\u9593\u672a\u767c\u8a00\uff0c\u7cfb\u7d71\u5df2\u81ea\u52d5\u65b7\u958b\u9023\u63a5\u3002',
		system_end_session: '\u6703\u8a71\u5df2\u7d50\u675f',
		system_before_evaluation: '\u60a8\u9084\u6c92\u6709\u5c0d\u5ba2\u670d\u670d\u52d9\u9032\u884c\u8a55\u50f9\uff0c\u78ba\u5b9a\u96e2\u958b\u7576\u524d\u9801\u9762\u55ce\uff1f',
		system_evaluation: '\u60a8\u7684\u8a55\u50f9\u201c{$evaluation}\u201d\u5df2\u7d93\u63d0\u4ea4\u3002',
		system_evaluation_failure: '\u60a8\u7684\u8a55\u50f9\u63d0\u4ea4\u5931\u6557\uff01',
		system_mobile_evaluation: '\u6d88\u606f\u63d0\u793a\uff1a\u611f\u8b1d\u60a8\u7684\u8a55\u50f9',
		system_fast_messaging: '\u60a8\u767c\u9001\u6d88\u606f\u592a\u5feb\u4e86\uff0c\u8acb\u4f11\u606f\u4e00\u4e0b\u3002',
		system_send_failure: '\u6d88\u606f\u767c\u9001\u5931\u6557\uff01[link href=javascript:void(0);]\u91cd\u65b0\u767c\u9001[/link]',
		system_send_timeout: '\u9023\u63a5\u903e\u6642\uff0c\u767c\u9001\u6d88\u606f\u5931\u6557',
		system_no_free_user: '\u8d85\u904e\u53ef\u66f4\u63db\u5ba2\u670d\u6b21\u6578', //当前没有空闲的客服
		system_over_rechatnum: '\u8d85\u8fc7\u53ef\u66f4\u6362\u5ba2\u670d\u6b21\u6570', //超过最大更换客服数量
		system_upload_compress: '\u6b63\u5728\u58d3\u7e2e',	//正在压缩
		system_upload_start: '\u6b63\u5728\u4e0a\u50b3', //正在上传
		system_picture_error_type: '\u5716\u7247\u985e\u578b\u6709\u8aa4', //图片类型有误
		system_picture_error_size: '\u5716\u7247\u592a\u5927', //图片太大
		system_giveup_wait: '\u60a8\u662f\u5426\u653e\u68c4\u6392\u968a', //您是否放弃排队
		system_giveup_submit: '\u78ba\u8a8d', //确认
		system_no_prev_picture: '\u6c92\u6709\u4e0a\u4e00\u5f35\u5716\u7247', //没有上一张图片
		system_no_next_picture: '\u6c92\u6709\u4e0b\u4e00\u5f35\u5716\u7247', //没有下一张图片
		system_leave_message: '\u7559\u8a00', //留言
		system_config_error: '\u6578\u64da\u52a0\u8f09\u5931\u6557\uff0c\u8acb\u91cd\u65b0\u52a0\u8f09', //数据加载失败，请重新加载
		system_printing: '\u6b63\u5728\u8f38\u5165', //正在输入
		system_cookie: '\u5efa\u8b70\u958b\u555f\u0063\u006f\u006f\u006b\u0069\u0065', //建议开启cookie
		capture_forbidden: '\u8be5\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u5b89\u88c5\u63d2\u4ef6\uff0c\u8bf7\u4f7f\u7528\u6d4f\u89c8\u5668\u81ea\u5e26\u622a\u56fe\u5de5\u5177\u6216\u5176\u4ed6\u622a\u56fe\u5de5\u5177\u3002',
		capture_reload: '\u5728\u7dda\u5c4f\u5e55\u622a\u5716\u63a7\u4ef6\u88ab\u700f\u89bd\u5668\u963b\u6b62\uff0c\u8acb\u8a2d\u7f6e\u9577\u671f\u5141\u8a31\u5f8c\u5237\u65b0\u7576\u524d\u9801\u9762',
		capture_install: '\u60a8\u5c1a\u672a\u5b89\u88dd\u7dda\u4e0a\u87a2\u5e55\u622a\u5716\u63a7\u5236\u9805\uff0c\u9ede\u78ba\u5b9a\u9032\u884c\u5b89\u88dd\r\n\u5b89\u88dd\u622a\u5716\u63a7\u5236\u9805\u9700\u95dc\u9589\u6d41\u89bd\u5668\u8996\u7a97...\r\n\u5982\u679c\u60a8\u5df2\u7d93\u5b89\u88dd,\u8acb\u95dc\u9589\u5f8c\u91cd\u65b0\u6253\u958b\u6d41\u89bd\u5668...',
		capture_activex_update: '\u622a\u5716\u63a7\u5236\u9805\u6709\u65b0\u7248\u672c\uff0c\u5347\u7d1a\u5f8c\u624d\u80fd\u4f7f\u7528\uff01\r\n\u9ede\u78ba\u5b9a\u9032\u884c\u5347\u7d1a\uff0c\u5347\u7d1a\u6642\u9700\u95dc\u9589\u6d41\u89bd\u5668\u8996\u7a97...\r\n\u5982\u679c\u60a8\u5df2\u7d93\u5347\u7d1a\u5b89\u88dd,\u8acb\u95dc\u9589\u5f8c\u91cd\u65b0\u6253\u958b\u6d41\u89bd\u5668...',
		capture_other_update: '\u7dda\u4e0a\u87a2\u5e55\u622a\u5716\u5916\u639b\u7a0b\u5f0f\u6709\u65b0\u7248\u672c\uff0c\u5347\u7d1a\u5f8c\u624d\u80fd\u4f7f\u7528\uff01\r\n\u9ede\u78ba\u5b9a\u9032\u884c\u5347\u7d1a...',
		news_download: '\u4e0b\u8f09',
		news_cancel_trans: '\u53d6\u6d88\u767c\u9001',
		news_trans_success: '\u4e0a\u50b3\u6210\u529f', //上传成功
		news_trans_retry: '\u91cd\u65b0\u4e0a\u50b3', //重新上传
		news_trans_failure_size: '\u8acb\u4e0a\u50b3\u5c0f\u65bc{$maxsize}MB\u7684\u6587\u4ef6', //请上传小于($maxsize)MB的文件
		news_trans_failure_type: '\u50c5\u652f\u6301\u4ee5\u4e0b\u4e0a\u50b3\u6587\u4ef6\u985e\u578b\uff1a{$type}', //仅支持以下上传文件类型：$(type)
		news_trans_failure: '\u4e0a\u50b3\u5931\u6557',
		news_trans_cancel: '\u5df2\u53d6\u6d88\u767c\u9001',
		news_trans_size: '\u6587\u4ef6\u592a\u5927',
		news_trans_type: '\u4e0d\u652f\u6301\u6b64\u985e\u578b\u6587\u4ef6',
		news_new: '\u65b0\u6d88\u606f',
		button_face: '\u8868\u60c5',
		button_file: '\u6587\u4ef6',
		button_image: '\u5716\u7247',
		button_save: '\u4fdd\u5b58',
		button_view: '\u804a\u5929\u8a18\u9304',
		button_captureImage: '\u622a\u5716',
		button_evaluation: '\u8a55\u50f9',
		button_switch_manual: '\u8f49\u4eba\u5de5',
		button_change_csr: '\u66f4\u63db\u5ba2\u670d',
		button_more: '\u66f4\u591a',
		button_history: '\u8fd4\u56de',
		button_end_session: '\u7d50\u675f\u6703\u8a71',
		button_start_session: '\u7e7c\u7e8c\u6703\u8a71',
		button_enter: 'Enter',
		button_ctrl_enter: 'Ctrl+Enter',
		button_capture_show_chatWin: '\u4e0d\u96b1\u85cf\u7a97\u53e3',
		button_capture_hidden_chatWin: '\u96b1\u85cf\u7a97\u53e3',
		back_button_text: '\u8fd4\u56de',
		dest_sign_text: '\u696d\u52d9\u4ecb\u7d39',
		default_textarea_text: '\u6211\u60f3\u554f...',
		send_button_text: '\u767c\u9001\u6d88\u606f',
		default_evaluation_form_title: '\u670d\u52d9\u8a55\u50f9',
		default_evaluation_form_fields: [
			{title:"\u8acb\u60a8\u8a55\u50f9\u6211\u7684\u670d\u52d9",name:"evaluation",type:"radio",required:true,defaultText:"5",options:[
				{text:"\u975e\u5e38\u6eff\u610f",value:"5"},
				{text:"\u6eff\u610f",value:"4"},
				{text:"\u4e00\u822c",value:"3"},
				{text:"\u4e0d\u6eff\u610f",value:"2"},
				{text:"\u5f88\u4e0d\u6eff\u610f",value:"1"}
			], message:["\u8acb\u5c0d\u5ba2\u670d\u9032\u884c\u8a55\u50f9", ""]},
			{title:"\u5efa\u8b70\u8207\u53cd\u994b", multipart: true,name:"proposal",type:"textarea","defaultText":"\u611f\u8b1d\u60a8\u7684\u56de\u994b\uff0c\u6211\u5011\u6703\u66f4\u52a0\u52aa\u529b\u3002",required:false,max:200,message:["","","\u5efa\u8b70\u5167\u5bb9\u4e0d\u80fd\u8d85\u904e100\u500b\u4e2d\u6587\u5b57\u5143"]}
		],
		default_message_form_fields:[
			{title:"\u59d3\u540d",name:"msg_name",type:"text","defaultText":"\u8acb\u586b\u5beb\u60a8\u7684\u771f\u5be6\u59d3\u540d",required:true,message:["\u8acb\u8f38\u5165\u60a8\u7684\u6635\u7a31"]},
			{title:"\u96fb\u8a71",name:"msg_tel",type:"text","defaultText":"\u8acb\u586b\u5beb\u56fa\u5b9a\u6216\u884c\u52d5\u96fb\u8a71\u865f\u78bc",required:true,verification:"phone",message:["\u8acb\u586b\u5beb\u96fb\u8a71\u865f\u78bc","\u96fb\u8a71\u865f\u78bc\u683c\u5f0f\u932f\u8aa4"]},
			{title:"\u90f5\u7bb1",name:"msg_email",type:"text","defaultText":"\u8acb\u586b\u5beb\u60a8\u7684\u90f5\u7bb1\u5730\u5740",required:false,verification:"email",message:["\u8acb\u586b\u5beb\u60a8\u7684\u90f5\u7bb1\u5730\u5740","\u96fb\u5b50\u90f5\u7bb1\u4f4d\u5740\u683c\u5f0f\u932f\u8aa4"]},
			{title:"\u7559\u8a00",name:"msg_content",type:"textarea","defaultText":"\u8acb\u5c07\u60a8\u7684\u554f\u984c\u8a73\u7d30\u5beb\u4e0b\uff0c\u6211\u5011\u6703\u5118\u5feb\u8207\u60a8\u806f\u7e6b\u3002",required:true,max:400,message:["\u7559\u8a00\u5167\u5bb9\u4e0d\u80fd\u70ba\u7a7a","","\u7559\u8a00\u5167\u5bb9\u4e0d\u80fd\u8d85\u904e200\u500b\u4e2d\u6587\u5b57\u5143"]}
		],
		default_submitinfo_form_title: '',
		default_submitinfo_form_fields: [
			{title:"\u554f\u3000\u3000\u984c",name:"tips_question",type:"text","defaultText":"",required:true,message:["\u8acb\u8f38\u5165\u554f\u984c\u6a19\u984c"]},
			{title:"\u554f\u984c\u985e\u578b",name:"tips_type",type:"select","defaultText":"-\u8acb\u9078\u64c7\u554f\u984c\u985e\u578b-",required:true, options:[
				"\u552e\u524d\u8aee\u8a62",
				"\u9000\u63db\u8ca8\u670d\u52d9",
				"\u7269\u6d41\u8aee\u8a62",
				"\u7f3a\u8ca8\u5efa\u8b70"
			]},
			{title:"\u5ba2\u6236\u59d3\u540d",name:"tips_name",type:"text","defaultText":"",required:false},
			{title:"\u806f\u7e6b\u96fb\u8a71",name:"tips_phone",type:"text","defaultText":"",required:false,verification:"phone"},
			{title:"\u96fb\u5b50\u90f5\u4ef6",name:"tips_email",type:"text","defaultText":"",required:false,verification:"email"}
		],
        message_prompt:'\u7576\u524d\u7121\u5ba2\u670d\u5728\u7dda\uff0c[link href="javascript:void(0);"]\u6211\u8981\u7559\u8a00[/link]',
		message_success: '\u7559\u8a00\u63d0\u4ea4\u6210\u529f\uff01',
		message_no_null: '*',
		message_no_null_char: '(\u5fc5\u586b)',
		editorFaceAlt: {
			'1':'wx','2':'tx','3':'hx','4':'dy','5':'ll','6':'sj','7':'dk','8':'jy','9':'zj','10':'gg',
			'11':'kx','12':'zb','13':'yw','14':'dn','15':'sh','16':'ku','17':'fn','18':'ws','19':'ok','20':'xh'
		}
	};
})(nTalk);
