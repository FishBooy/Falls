/*! Copyright (c) 2014-01 kevin 
 * Licensed
 *
 * Name: falls 
 * Version: 1.0
 * dataType: json
 * dataLength: 50 one time(ajax request)
 * dataFormate:
 {
	height: "681"
	id: "358660"
	image: "http://www.wookmark.com/images/original/358660_wookmark.jpg"
	preview: "http://www.wookmark.com/images/thumbs/358660_wookmark.jpg"
	referer: "http://www.pinterest.com/pin/348606827377244144/"
	title: "Magic room. | Sweet home"
	url: "http://www.wookmark.com/image/358660/magic-room-sweet-home"
	width: "500"	
  }
 */
;(function($,window){

	/*------构造函数-------*/
	function FallsGallery(ele,opts){

		this.fallsWrapper=ele;
		this.opts=$.extend(false,this.defaultOpts,opts || {});
		this.data=[];
		this.timeId=null;

		this.init();	
	};


	/*------参数配置------*/
	FallsGallery.prototype.defaultOpts={

		itemWidth: 236,
		itemMarginLeft: 7,
		itemMarginRight: 7,
		url: 'http://www.wookmark.com/api/json/popular?callback=?',
		backup: '',
		jsonCache: [],
		ajaxTimes: 0,
		counts: 'auto',
		colsHeight: [],
		indexArr: [],
		zoom: true,
		resize: true,
		loadingTxt:'loading'
	};


	/*------对象方法------*/
	/*--初始化--*/
	FallsGallery.prototype.init=function(){
		(this.opts.zoom) && this.zoomBind() && (this.opts.resize) && this.resizeBind();
		this.hoverBind();
		this.getCols();
	}


	/*-加载流程-*/
	//获取列数
	FallsGallery.prototype.getCols=function(reorder){
		var w=this.opts.itemWidth+this.opts.itemMarginLeft+this.opts.itemMarginRight,
			n=Math.floor($(window).width()/w);

		this.opts.counts=n;
		reorder && (this.opts.counts=n);

		this.fallsWrapper.css('width',n*w);
		this.opts.itemTotalWidth=w;
		
		reorder || this.getData();
		reorder && this.reOrder();
	};

	//异步请求数据
	FallsGallery.prototype.getData=function(){

		$.ajax({
			type: 'GET',
			url: this.opts.url,
			cache: false,
			data: {'page': this.opts.ajaxTimes},
			dataType:'jsonp',
			timeout: 60000,
			success: this.sCallBack(),
			error: this.eCallBack()		
		})

	};

	//请求成功==>处理数据
	FallsGallery.prototype.sCallBack=function(){
		var _this=this;

		return function(data){
			if($('.loading',_this.fallsWrapper).length){
				$('.loading',_this.fallsWrapper).remove()
			};
			_this.domInsert(data)
			
		};
	};

	//DOM操作==>主体
	FallsGallery.prototype.domInsert=function(data){

		var counts=this.opts.counts,
			times=this.opts.ajaxTimes,
			arr=this.opts.colsHeight,
			indexArr=this.opts.indexArr,
			copy=[],
			copyForSort=[],
			length=data.length,
			indexEle;

		for(var i=0;i<length;i++){

			indexEle=(i<counts  && !times)? i:indexArr[0];//最小高度在arr中的索引值
			posTop=(i<counts && !times)? 0:arr[indexEle];

			var curItem=$(this.createHtml(data[i]))
				.appendTo(this.fallsWrapper)
				.css({
					left: indexEle*this.opts.itemTotalWidth,
					top: posTop
				});

			curItem
			.find('img')
			.css('height',Math.floor(this.opts.itemWidth*data[i]['height']/data[i]['width']));

			var h=curItem.outerHeight();
			if(i<counts && !times){
				arr.push(h);
				copy.push(h);
				copyForSort.push(h);
			}else{
				arr[indexEle]=arr[indexEle]+h;
				for(var ele in arr){
					copy.push(arr[ele]) && copyForSort.push(arr[ele]);
				};
				
			};

			if((i+1)>=counts || times!=0){
				indexArr.length=0;
				copyForSort.sort(function(a,b){return a-b});
				for(var k=0;k<copyForSort.length;k++){
					for(var j=0;j<copy.length;j++){
						copyForSort[k]===copy[j] && (indexArr[k]=j) && (copy[j]='');
					}
				};

				copy=[];
				copyForSort=[];		
			}
		};

		this.data=this.data.concat(data);
		this.scrollBind();
	};
	//DOM操作==>模板替换
	FallsGallery.prototype.createHtml=function(data){
		return '<div class="falls-item">\
					<div class="item-wrapper">\
						<a href="'+data.url+'" class="item-img" target="_blank"><img src="'+data.image+'"/></a>\
						<h2 class="item-title"><span>'+data.title+'</span></h2>\
						<div class="item-info">\
							<p class="fav-view-src">\
								<a href="'+data.referer+'" target="_blank" class="src"><span>view-source</span></a>\
							</p>\
						</div>\
					</div>\
				</div>';
	};

	//请求失败==>提示错误
	FallsGallery.prototype.eCallBack=function(){
		var _this=this;
		return function(data){
			alert('请求失败');		
		};
	};

	
	/*-事件绑定-*/
	//主要事件->滚动加载
	FallsGallery.prototype.scrollBind=function(){

		var _this=this,
			arr=this.opts.colsHeight,
			newArr=[];

		for(var ele in arr){
			newArr.push(arr[ele]);
		};
		newArr.sort(function(a,b){return a-b;});
		$(window).scroll(function(e) {
			if($(this).scrollTop()+$(this).height()>=newArr[newArr.length-1]){
				_this.loading(newArr[newArr.length-1]+10);

				_this.opts.ajaxTimes++;
				_this.getCols();

				$(this).unbind('scroll');
			}
		});
	};

	//窗口调整
	FallsGallery.prototype.resizeBind=function(){
		var _this=this;
		$(window).resize(function(){
			_this.timeId && clearTimeout(_this.timeId);
			_this.timeId=setTimeout(function(){

				var winH=$(window).height(),winW=$(window).width();
				if($('.layers-container').length){
					var layerWrap=$('.layers-container').css({width:winW,height:winH}),
						img=$('img',layerWrap),
						wOri=img.width(),
						imgW=wOri,
						imgH=img.height();

					// 图片大小等比例伸缩
					// (imgW>winW*(1/2)) && (imgW=winW*(1/2)) && (imgH=imgH*winW*(1/2)/wOri);
					// img.css({width:imgW,height:imgH});

					var	layer=$('.layer-outter',layerWrap),
						layerW=layer.outerWidth();
					layer.css({left:Math.floor((winW-layerW)/2),top:50});
				};

				_this.getCols(1);

			},200)			
		})	
	};
	//重新排序
	FallsGallery.prototype.reOrder=function(){
		this.opts.colsHeight.length=0;
		this.opts.indexArr.length=0;

		var items=$('.falls-item'),
			counts=this.opts.counts,
			arr=this.opts.colsHeight,
			indexArr=this.opts.indexArr,
			copy=[],
			copyForSort=[],
			length=items.length,
			indexEle;

		for(var i=0;i<length;i++){
			indexEle=(i<counts)? i:indexArr[0];//最小高度在arr中的索引值
			posTop=(i<counts)? 0:arr[indexEle];

			var curItem=$(items[i])
				.css({
					left: indexEle*this.opts.itemTotalWidth,
					top: posTop
				});

			var h=curItem.outerHeight();
			if(i<counts){
				arr.push(h);
				copy.push(h);
				copyForSort.push(h);
			}else{
				arr[indexEle]=arr[indexEle]+h;
				for(var ele in arr){
					copy.push(arr[ele]) && copyForSort.push(arr[ele]);
				};
				
			};

			if((i+1)>=counts){
				indexArr.length=0;
				copyForSort.sort(function(a,b){return a-b});
				for(var k=0;k<copyForSort.length;k++){
					for(var j=0;j<copy.length;j++){
						copyForSort[k]===copy[j] && (indexArr[k]=j) && (copy[j]='');
					}
				};

				copy=[];
				copyForSort=[];		
			}
		}

		$(window).unbind('scroll');
		this.scrollBind();
	};

	//图片放大
	FallsGallery.prototype.zoomBind=function(){
		var _this=this;

		this.fallsWrapper
		.addClass('can-zoom')
		.on('click','.item-img',function(e){
			e.preventDefault();
			e.stopPropagation();
			$('body').addClass('no-scroll');

			var winW=$(window).width(),
				winH=$(window).height(),
				layerWrap=$(_this.createLayer($(this)))
						.appendTo('body')
						.css({width:winW,height:winH,overflowY:'scroll'})
						.click(function(){ 
							$('.layers-container').length && $('.layers-container').remove();
							$('body').removeClass('no-scroll');
						}),
				index=$('.item-img',_this.fallsWrapper).index($(this)),
				wOri=_this.data[index]['width'],
				imgW=wOri,
				imgH=_this.data[index]['height'];

			(imgW>winW*(1/2)) && (imgW=winW*(1/2)) && (imgH=imgH*winW*(1/2)/wOri);
			var img=$('img',layerWrap)
					.css({width:imgW,height:imgH})
					.click(function(e){
						e.stopPropagation();
					}),
				layer=$('.layer-outter',layerWrap);

			var layerW=layer.outerWidth(),
				layerH=layer.outerHeight();
			layer.css({left:Math.floor((winW-layerW)/2),top:50})		
		});

		$('body')
		.on('mouseover','.layer-outter',function(){$('span',this).addClass('visible');})
		.on('mouseleave','.layer-outter',function(){$('span',this).removeClass('visible');})
		.on('click','.close-btn',function(e){e.preventDefault(); $('.layers-container').length && $('.layers-container').remove();})
		return true;
	};
	FallsGallery.prototype.createLayer=function(obj){

		var src=$('img',obj).attr('src');

		return '<div class="layers-container">\
					<div class="layer-outter">\
						<div class="layer">\
							<span class="close-btn">close</span>\
							<img src="'+src+'"/>\
						</div>\
					</div>\
				</div>';
	};

	//样式区分
	FallsGallery.prototype.hoverBind=function(){
		this.fallsWrapper
		.on('mouseover','.item-wrapper',function(){
			$(this).addClass('active')
		})
		.on('mouseleave','.item-wrapper',function(){
			$(this).removeClass('active')
		})
	}



	//重新排列
	FallsGallery.prototype.rank=function(){
	};
	//loading显示
	FallsGallery.prototype.loading=function(top){
		$('<div>')
		.addClass('loading')
		.css({
			position:'absolute',
			top:top,
			right:0,
			width:'100%'
		})
		.text(this.opts.loadingTxt)
		.appendTo(this.fallsWrapper);
	};


	$.fn.fallsGallery=function(opts){
		return this.each(function(){
			$(this).data('Falls',new FallsGallery($(this),opts));
		})
	};

})(jQuery,window);

