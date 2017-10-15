define("lib.external.moodular",["jquery-1.4"],function(c){c.fn.moodular=function(a){var b=null,d=c.extend({},c.fn.moodular.defaults,a),e=c.extend({},c.fn.moodular.controls),h=c.extend({},c.fn.moodular.effects);this.each(function(){b=new g(this,d,e,h);c(window).bind("resize",function(){b._resize()})});return d.api?b:null};c.moodular=function(a,b,d,e){this.e=c(a);if(b.random){var h=this.e.children(c("> "+b.item));h.sort(function(){return Math.round(Math.random())-0.5});this.e.remove(c("> "+b.item));
for(var f=0;f<h.length;f++)this.e.append(h[f])}b.continuous&&c(a).html(c(a).html()+c(a).html());this.aItems=null;this.current=this.nbItems=0;this.locked=false;this.dep=0;this.timerMoving=null;this.opts=b;this.controls=d;this.effects=e;this.direction=b.direction=="left"||b.direction=="top"?"next":"prev";this.pos=b.direction=="left"||b.direction=="right"?"left":"top";this.dir=b.direction=="right"||b.direction=="bottom"?-1:1;this.vertical=this.pos=="left"?false:true;this._init()};var g=c.moodular;g.fn=
g.prototype={moodular:"2.3"};g.fn.extend=g.extend=c.extend;g.fn.extend({_init:function(){var a=this;this._resize();this.e.wrap('<div class="carousel"><div class="carousel_viewport"></div></div>');this.e.parent().css({position:"relative",overflow:"hidden",width:this.e.width(),height:this.e.height()});this.e.css({position:"absolute"});var b=0;c("> "+this.opts.item,this.e).each(function(){b+=this.vertical?parseInt(c(this).outerHeight(true)):parseInt(c(this).outerWidth(true))});this.e.css(this.vertical?
"height":"width",b+"px");this.aItems=c("> "+this.opts.item,this.e);this.nbItems=this.aItems.length;this.opts.continuous||(this.nbItems*=2);var d=this.opts.controls.split(" "),e;for(e=0;e<d.length;e++)c.isFunction(this.controls[d[e]])&&this.controls[d[e]](this);d=this.opts.effects.split(" ");for(e=0;e<d.length;e++)c.isFunction(this.effects.init[d[e]])&&this.effects.init[d[e]](this);if(this.opts.startOn){this.speed=this.opts.speed;this.opts.speed=1;this.moveTo(this.opts.startOn)}if(this.opts.auto)this.timerMoving=
setTimeout(function(){a._animate("next")},a.opts.dispTimeout)},_animate:function(a){a=a==undefined?this.direction:a;if(!this.locked){if(this.opts.fireEvents){var b=c.Event("beforeAnimate");b.direction=a;b.realPos=this._realpos(this);c(this).trigger(b)}this.locked=true;clearTimeout(this.timerMoving);this.dep=this.dep==0?this.opts.scroll:this.dep;if(this.dir==-1)if(a=="next")a="prev";else if(a=="prev")a="next";if(a!="next")this.dep*=-1;b=true;if(!this.opts.continuous)if(a=="next"){if(this.current>=
this.nbItems/2-1)this.locked=b=false}else if(this.current<=0)this.locked=b=false;b&&this._beforeMoving()}this.opts.promoCarousel&&this.fadeHeaderOut()},_beforeMoving:function(){var a=this.opts.effects.split(" "),b;for(b=0;b<a.length;b++)if(c.isFunction(this.effects.before[a[b]]))this.effects.before[a[b]](this,this.dep<0?-1:1);if(this.dep<0&&this.opts.continuous){for(b=a=0;b<Math.abs(this.dep);b++){var d=c("> "+this.opts.item+":last",this.e);a+=parseInt(d.css(this.vertical?"height":"width"));c("> "+
this.opts.item+":last",this.e).remove();this.e.prepend(d)}this.e.css(this.pos,-a)}this._move()},_move:function(){var a=this;if(c.isFunction(this.opts.move))this.opts.move(this,function(){a._afterMoving()});else{var b=0,d;if(this.dep>0)for(d=0;d<this.dep;d++)b+=this.vertical?parseInt(this.aItems.eq(this._realpos(this.current)+d).outerHeight(true)):parseInt(this.aItems.eq(this._realpos(this.current)+d).outerWidth(true));else if(!(!this.opts.continuous&&this.current<=0))for(d=0;d<Math.abs(this.dep);d++)b+=
this.vertical?parseInt(this.aItems.eq(this._realpos(this.current)-d).outerHeight(true)):parseInt(this.aItems.eq(this._realpos(this.current)-d).outerWidth(true));this.e.css(this.pos)=="auto"&&this.e.css(this.pos,0);b=parseInt(this.e.css(this.pos))+(this.dep>0?-1:1)*b;if(!this.opts.continuous){if(b>0)b=0;if(this.vertical){if(parseInt(this.e.height())+b<parseInt(this.e.parent().height()))b=parseInt(this.e.parent().height())-parseInt(this.e.height())}else if(parseInt(this.e.width())+b<parseInt(this.e.parent().width()))b=
parseInt(this.e.parent().width())-parseInt(this.e.width())}this.vertical?this.e.stop(true,true).animate({top:parseInt(b)+"px"},this.opts.speed,this.opts.easing,function(){a._afterMoving()}):this.e.stop(true,true).animate({left:parseInt(b)+"px"},this.opts.speed,this.opts.easing,function(){a._afterMoving()})}},_afterMoving:function(){var a;if(this.dep>0&&this.opts.continuous){for(a=0;a<this.dep;a++){var b=c("> "+this.opts.item+":first",this.e);c("> "+this.opts.item+":first",this.e).remove();this.e.append(b)}this.e.css(this.pos,
0)}var d=this;this.current+=this.dep;this.current=this.current==-1?this.opts.continuous?this.nbItems-1:0:this.current==this.nbItems?0:this._realpos(this.current);this.dep=0;this.locked=false;b=this.opts.effects.split(" ");for(a=0;a<b.length;a++)c.isFunction(this.effects.after[b[a]])&&this.effects.after[b[a]](this);for(a=0;a<this.opts.callbacks.length;a++)this.opts.callbacks[a](this);b=this.opts.controls.split(" ");for(a=0;a<b.length;a++)c.isFunction(this.controls.callback[b[a]])&&this.controls.callback[b[a]](this);
if(this.opts.startOn)this.opts.speed=this.speed;if(this.opts.auto)this.timerMoving=setTimeout(function(){d._animate("next")},this.opts.dispTimeout);if(this.opts.promoCarousel){this.changeHeader();this.fadeHeaderIn()}},_realpos:function(a){if(a<0)a=this.nbItems/2-a;return a<this.nbItems/2?a:a-this.nbItems/2},_resize:function(){c("> "+this.opts.item,this.e).css(this.vertical?"height":"width");c("> "+this.opts.item,this.e).each(function(){this.vertical?c(this).height(c(this).height()):c(this).width(c(this).width())})},
reanimate:function(){if(!this.opts.auto){this.locked=false;this.opts.auto=true;var a=this;this.timerMoving=setTimeout(function(){a._animate("next")},this.opts.dispTimeout)}},start:function(){if(!this.opts.auto){this.opts.auto=true;this._animate("next")}return false},stop:function(){clearTimeout(this.timerMoving);return this.opts.auto=false},fadeHeaderOut:function(){c("#"+this.opts.titleSelector+"_link").animate({opacity:[0,"swing"]})},fadeHeaderIn:function(){c("#"+this.opts.titleSelector+"_link").animate({opacity:[1,
"swing"]})},changeHeader:function(){var a={},b=this.aItems[this._realpos(this.current)];a.text="Top stories";a.url="http://www.bbc.com/";a.rev="promo|homepage|na|r|t|i|text|headline";if(c(b).hasClass("news")){a.text="Top News story";a.url=c(b).find("a").attr("href")}if(c(b).hasClass("sport")){a.text="Top Sport story";a.url=c(b).find("a").attr("href")}if(c(b).hasClass("travel")){a.text="From BBC Travel";a.url=c(b).find("a").attr("href")}if(c(b).hasClass("custom"))if("undefined"!=typeof wwhomepage.customPromoHeaders[c(b).find("dt a").attr("href")]){a.text=
wwhomepage.customPromoHeaders[c(b).find("dt a").attr("href")].promo_type;a.url=wwhomepage.customPromoHeaders[c(b).find("dt a").attr("href")].promo_url}a=c('<a title="Go to '+a.text+'" rev="'+a.rev+'" href="'+a.url+'" id="'+this.opts.titleSelector+'_link" style="opacity:1;">'+a.text+"</a>");a.css("opacity",0);c("#"+this.opts.titleSelector).html(a)},next:function(){this._animate("next");return false},prev:function(){this._animate("prev");return false},getCurrent:function(){return this._realpos(this.current)},
moveTo:function(a){if(a>this.nbItems/2)a=this.nbItems/2-1;this.dep=parseInt(a)-parseInt(this.current);this.dep!=0&&this._animate("next");return false}});c.fn.moodular.defaults={titleSelector:"promo_title",item:"li",controls:"",effects:"",easing:"",auto:true,continuous:true,speed:2E3,direction:"left",scroll:1,startOn:0,dispTimeout:1E3,callbacks:[],random:false,api:false};c.fn.moodular.controls={callback:{}};c.fn.moodular.effects={init:{},before:{},after:{}};c.extend(c.fn.moodular.controls,{previewNav:function(a){if(a.e.context.id===
undefined||a.e.context.id==="")throw new Error("the wrapper for the carousel items must have an id to use the preview nav component");var b=a.e.context.id,d=false,e=false,h=c('<div class="nav_left"><span class="hide">Left</span><div class="image"><img width="71" height="40" src=""/></div></div>'),f=c('<div class="nav_right"><span class="hide">Right</span><div class="image"><img width="71" height="40" src=""/></div></div>'),j=a.opts.auto&&a.opts.playPause?c('<div class="autoplay nav_pause"><span class="hide"></span></div>'):
c('<div class="autoplay nav_play"><span class="hide"></span></div>'),l=c('<ol id="'+b+'_items" class="carousel_itemList"></ol>'),m=function(k){k=k==="play"||k===true?"play":"pause";switch(k){case "play":j.attr("class","autoplay nav_pause");a.start();a.manualPlay=true;break;case "pause":j.attr("class","autoplay nav_play");a.stop();break;default:throw new Error("not a valid state");}},o=function(k,n){if(!d){d=true;n==="fadein"&&k.fadeIn(200,function(){d=false});n==="fadeout"&&k.fadeOut(200,function(){e=
d=false})}},p=function(k){o(k,"fadein");if(e===false)e=setTimeout(function(){o(k,"fadeout")},2E3)};h.bind("click",function(){a.prev();m("pause");return false}).mouseover(function(){c(this).css("width","123px").css("cursor","pointer").addClass("hover")}).mouseout(function(){c(this).css("width","47px").css("cursor","default").removeClass("hover")});f.bind("click",function(){a.next();m("pause");return false}).mouseover(function(){c(this).css("width","123px").css("cursor","pointer").addClass("hover");
c.browser.msie&&c.browser.version==="6.0"&&c(this).addClass("nav_right_hover")}).mouseout(function(){c(this).css("width","47px").css("cursor","default").removeClass("hover");c.browser.msie&&c.browser.version==="6.0"&&c(this).removeClass("nav_right_hover")});if(a.opts.playPause){j.css("display","none").bind("click",function(){m(!a.opts.auto);c(this).addClass("hover")}).mouseover(function(){c(this).css("cursor","pointer").addClass("hover");p(j);d=true}).mouseout(function(){c(this).css("cursor","default").removeClass("hover");
d=false});a.e.parent().parent().append(j)}a.e.parent().parent().append(h).append(f);c("#"+b).bind("mousemove",function(){p(j)});a.e.parent().parent().append(l);h="";for(f=0;f<a.nbItems/2;f++)h+='<li class="carousel_itemList_li" rel="'+f+'"><span class="hide">'+(f+1)+"</span></li>";c("#"+b+"_items",a.e.parent().parent()).html(h);c("#"+b+"_items li",a.e.parent().parent()).css("cursor","pointer").click(function(){if(a.locked)a.locked=false;else{c("#"+b+"_items li.active").removeClass("active");a.moveTo(c(this).attr("rel"));
c(this).addClass("active");m("pause")}return false});c(".carousel_itemList_li:first").addClass("active");a.controls.callback.previewNav(a)},callback:{previewNav:function(a){var b=a.e.context.id,d=function(f,j){var l,m;m=j/2-1;l=f===0?m:f-1;if(f===j-1)l=m-1;return l},e=function(f,j){var l;l=f===j/2-1?0:f+1;if(f===j-1)l=0;return l},h=function(f){return c(a.aItems[f]).find("img").attr("src")};c("#"+b+"_items li.active").removeClass("active");c("#"+b+"_items li[rel$="+(a.current===a.nbItems-1?a.nbItems/
2-1:a.current)+"]").addClass("active");c("#"+a.e.context.id).parent().parent().find(".nav_right .image img").attr("src",h(e(a.current,a.aItems.length)));c("#"+a.e.context.id).parent().parent().find(".nav_left .image img").attr("src",h(d(a.current,a.aItems.length)))}}});c.extend(c.fn.moodular.effects.after,{singleRevolution:function(a){if(a.manualPlay!==true&&a.opts.auto===true&&a.current===0){a.e.parent().parent().find(".nav_pause").removeClass("nav_pause").addClass("nav_play");a.stop()}}});return c});
define("wwhomepage.ui.carouselfactory",["lib.external.moodular"],function(c){return{createCarousel:function(g,a){return c(g).moodular(a)}}});
define("wwhomepage.utils.popup",["jquery-1.4"],function(c){return{registerPopup:function(g,a){g=c(g);var b=c(g).attr("href");a=a||{};var d=a.windowName||"popup",e=[],h="",f={};f.toolbar=a.toolbar||"0";f.scrollbar=a.scrollbars||"0";f.location=a.location||"0";f.statusbar=a.statusbar||"0";f.menubar=a.menubar||"0";f.directories=a.directories||"0";f.resizable=a.resizable||"0";f.width=a.width||"100";f.height=a.height||"100";f.left=a.left||"100";f.top=a.top||"100";for(setting in f)e.push(setting+"="+f[setting]);
h=e.join(",");c(g).bind("click",function(j){window.open(b,d,h);j.preventDefault();j.stopPropagation()})}}});
define("wwhomepage.ui.weather",["jquery-1.4"],function(c){var g=function(){};g.prototype={domEl:null,editButton:null,searchPanel:null,defaultCleared:false,moduleId:null,contentBlockId:null,inputDefaultText:null,editButtonText:"Edit my location",closeButtonText:"Close",resultsText:"Select an option below to select your location",noResultsText:"Location not found",init:function(a,b){this.opts=b;this.domEl=c(a);this.domEl.find(".weatherforecast h3").after('<span class="edit">'+this.editButtonText+"</span>");
this.editButton=this.domEl.find(".weatherforecast .edit");this.searchPanel=this.domEl.find(".weatherforecast .searchPanel");this.inputDefaultText=this.searchPanel.find('[name="value"]').val();this.moduleId=this.searchPanel.find('form [name="module"]').val();this.contentBlockId=this.searchPanel.find('form [name="contentBlock"]').val();this.defaultCleared=false;this.opts.autocomplete.enabled===true&&this.searchPanel.find("form").attr("autocomplete","off");a=this.readCookie("hploc");a!==null&&a!=""?
this.setAndUpdate("/customise?module=weather&action=set&value="+a):c("#weather_forecast").removeClass("weather_loading")},reset:function(){this.searchPanel.find(".searchPanelSearch").val(this.inputDefaultText);this.searchPanel.find(".results");this.defaultCleared=false},processResults:function(a){var b=this.searchPanel.find(".results"),d=b.find("ul"),e=b.find("p");d.empty();if(typeof a!="undefined"&&a.length>0){for(var h in a){var f=a[h],j=encodeURI("/customise?module=weather&action=set&value="+f.data.loc);
d.append('<li><a href="'+j+'">'+f.data.full_name+"</a>")}e.text(this.resultsText).removeClass("noResults")}else e.text(this.noResultsText).addClass("noResults");b.not(":visible")&&b.slideDown()},ajaxSearch:function(){var a=this.searchPanel.find("form"),b=this;c.ajax({type:a.attr("method"),url:a.attr("action"),data:{module:"weather",action:"search",value:a.find('[name="value"]').val()},dataType:"json",success:function(d){if(d.content.hasOwnProperty("locations"))b.processResults(d.content.locations);
else if(d.content.hasOwnProperty("forecast")){d=d.content.forecast.location;b.processResults([{data:{loc:d.id,site_name:d.siteName,full_name:d.siteName+", "+d.country}}])}else d.content===false&&b.processResults([])}})},setAndUpdate:function(a){var b=this;a=a.split("?");c.ajax({type:"GET",url:a[0],data:a[1],dataType:"json",success:function(d){c("#weather_forecast").removeClass("weather_loading");d=c(d.content.forecast.html);var e=["h3",".dayForecast",".detail"];for(i in e){b.domEl.find(e[i]).replaceWith(d.find(e[i]));
if(b.searchPanel.is(":visible")){b.searchPanel.slideUp();b.editButton.text(b.editButtonText);b.reset()}}},error:function(){c("#weather_forecast").removeClass("weather_loading")}})},setEventListeners:function(){this.editButton.bind("click",{self:this},function(b){b=b.data.self;if(b.searchPanel.is(":visible")){b.searchPanel.slideUp();b.editButton.text(b.editButtonText)}else{b.searchPanel.slideDown();b.editButton.text(b.closeButtonText);b.reset()}return false},false);var a=this.searchPanel.find("input");
a.bind("focus",{self:this},function(b){b=b.data.self;if(b.defaultCleared===false){c(this).val("");b.defaultCleared=true}return false},false);this.searchPanel.find("form").bind("submit",{self:this},function(b){b.data.self.ajaxSearch();return false},false);this.opts.autocomplete.enabled===true&&a.bind("keyup",{self:this},function(b){b=b.data.self;c(this).val().length>=b.opts.autocomplete.minLength&&b.ajaxSearch();return false},false);this.searchPanel.find(".results a").live("click",{self:this},function(b){b.data.self.setAndUpdate(this.href);
return false},false)},readCookie:function(a){a=a+"=";for(var b=document.cookie.split(";"),d=0;d<b.length;d++){for(var e=b[d];e.charAt(0)==" ";)e=e.substring(1,e.length);if(e.indexOf(a)==0)return e.substring(a.length,e.length)}return null},renderWeather:function(a,b){this.init(a,b);this.setEventListeners()}};return g});
define("wwhomepage.ui.weather4",["jquery-1.4"],function(c){var g=function(){};g.prototype={domEl:null,editButton:null,searchPanel:null,defaultCleared:false,moduleId:null,contentBlockId:null,inputDefaultText:null,editButtonText:"Edit my location",closeButtonText:"Close",resultsText:"Select an option below to select your location",noResultsText:"Location not found",init:function(a,b){this.opts=b;this.domEl=c(a);this.domEl.find(".weatherforecast4 h3").after('<span class="edit">'+this.editButtonText+
"</span>");this.editButton=this.domEl.find(".weatherforecast4 .edit");this.searchPanel=this.domEl.find(".weatherforecast4 .searchPanel");this.inputDefaultText=this.searchPanel.find('[name="value"]').val();this.moduleId=this.searchPanel.find('form [name="module"]').val();this.contentBlockId=this.searchPanel.find('form [name="contentBlock"]').val();this.defaultCleared=false;this.opts.autocomplete.enabled===true&&this.searchPanel.find("form").attr("autocomplete","off");a=this.readCookie("ckps_hploc");
a!==null&&a!=""?this.setAndUpdate("/customise?module=weather4&action=set&value="+a):c("#weather4_forecast").removeClass("weather_loading")},reset:function(){this.searchPanel.find(".searchPanelSearch").val(this.inputDefaultText);this.searchPanel.find(".results");this.defaultCleared=false},processResults:function(a){var b=this.searchPanel.find(".results"),d=b.find("ul"),e=b.find("p");d.empty();if(typeof a!="undefined"&&a.length>0){for(var h in a){var f=a[h],j=encodeURI("/customise?module=weather4&action=set&value="+
f.id);d.append('<li><a href="'+j+'">'+f.name+"</a>")}e.text(this.resultsText).removeClass("noResults")}else e.text(this.noResultsText).addClass("noResults");b.not(":visible")&&b.slideDown()},ajaxSearch:function(){var a=this.searchPanel.find("form"),b=this;c.ajax({type:a.attr("method"),url:a.attr("action"),data:{module:"weather4",action:"search",value:a.find('[name="value"]').val()},dataType:"json",success:function(d){if(d.content.hasOwnProperty("locations"))b.processResults(d.content.locations);else if(d.content.hasOwnProperty("forecast")){d=
d.content.forecast.location;b.processResults([{data:{loc:d.id,site_name:d.siteName,full_name:d.siteName+", "+d.country}}])}else d.content===false&&b.processResults([])}})},setAndUpdate:function(a){var b=this;a=a.split("?");c.ajax({type:"GET",url:a[0],data:a[1],dataType:"json",success:function(d){c("#weather4_forecast").removeClass("weather_loading");d=c(d.content.forecast.html);var e=["h3",".dayForecast",".detail"];for(i in e){b.domEl.find(e[i]).replaceWith(d.find(e[i]));if(b.searchPanel.is(":visible")){b.searchPanel.slideUp();
b.editButton.text(b.editButtonText);b.reset()}}},error:function(){c("#weather4_forecast").removeClass("weather_loading")}})},setEventListeners:function(){this.editButton.bind("click",{self:this},function(b){b=b.data.self;if(b.searchPanel.is(":visible")){b.searchPanel.slideUp();b.editButton.text(b.editButtonText)}else{b.searchPanel.slideDown();b.editButton.text(b.closeButtonText);b.reset()}return false},false);var a=this.searchPanel.find("input");a.bind("focus",{self:this},function(b){b=b.data.self;
if(b.defaultCleared===false){c(this).val("");b.defaultCleared=true}return false},false);this.searchPanel.find("form").bind("submit",{self:this},function(b){b.data.self.ajaxSearch();return false},false);this.opts.autocomplete.enabled===true&&a.bind("keyup",{self:this},function(b){b=b.data.self;c(this).val().length>=b.opts.autocomplete.minLength&&b.ajaxSearch();return false},false);this.searchPanel.find(".results a").live("click",{self:this},function(b){b.data.self.setAndUpdate(this.href);return false},
false)},readCookie:function(a){a=a+"=";for(var b=document.cookie.split(";"),d=0;d<b.length;d++){for(var e=b[d];e.charAt(0)==" ";)e=e.substring(1,e.length);if(e.indexOf(a)==0)return e.substring(a.length,e.length)}return null},renderWeather:function(a,b){this.init(a,b);this.setEventListeners()}};return g});
define("wwhomepage.ui.tabs",["jquery-1.4"],function(c){return{registerTabs:function(g){c(g+" .tab").click(function(a){tabs=c(g+" .tab");tabs.removeClass("selected");panels=c(g+" .panel");panels.removeClass("selected");eventElement=c(a.currentTarget);eventElement.addClass("selected");panelElement=eventElement.next();panelElement.addClass("selected");return false})}}});
define("wwhomepage.ui.drawers",["jquery-1.4"],function(c){var g=function(){};g.prototype={openDrawerId:0,numberOfDrawers:0,drawersLeft:[],init:function(a,b){this.opts=b;c(a).data("opts",b);this.numberOfDrawers=c(a).children().length;this.openDrawerId=this.numberOfDrawers-1;if("undefined"!=typeof this.opts.openDrawer)this.openDrawerId=this.opts.openDrawer;c(a).addClass("drawersEnabled");c(a+" .contentBlocks").addClass("drawer");!c(a+" .contentBlocks").css("-moz-transform")&&!c(a+" .contentBlocks").css("-webkit-transform")&&
!c(a+" .contentBlocks").css("layout-flow")&&!c(a+" .contentBlocks").css("-o-transform")&&c(a+" .contentBlocks").addClass("no-transform")},setOpenDrawer:function(a){for(var b=c(".drawer h2 a"),d=0,e=b.length;d<e;d++){var h=c(b[d]).parent().parent();text='<a class="handle" id="handle'+d+'" href="#"><span>'+c(b[d]).text().replace(/([a-zA-Z& ]+)(.+)/,"$1")+"</span></a>";h.prepend(text).attr("id",d);var f=a.drawerHandleWidth*d;if(this.openDrawerId<d)f=a.drawerHandleWidth*(d-1)+parseInt(a.drawerWidth);
else this.drawersLeft[d]=true;h.css("left",f+"px");if(this.openDrawerId==d)h.addClass("drawer-open");else if(!(c.browser.msie&&"6.0"==c.browser.version)){c("#"+d+" h2").css({opacity:0});c("#"+d+" .contentBlock").css({opacity:0})}}},setEventListeners:function(){c(".handle").bind("click",{self:this},function(a){a=a.data.self;clickedDrawerId=parseFloat(c(this).attr("id").substring(6));if(a.drawersLeft[clickedDrawerId])a.animateRight(clickedDrawerId);else a.drawersLeft[clickedDrawerId]||a.animateLeft(clickedDrawerId);
return false},false)},animateRight:function(a){drawersToAnimateRight=[];for(x=a+1;x<=this.numberOfDrawers;x++){drawer=c("#"+x);if(1<=drawer.length&&this.drawersLeft[x]){drawersToAnimateRight.push(drawer);this.drawersLeft[x]=false}}this.fadeInOutDrawers(a);for(var b=0,d=drawersToAnimateRight.length;b<d;b++){var e={left:parseFloat(drawersToAnimateRight[b].css("left"))+(this.opts.drawerWidth-this.opts.drawerHandleWidth)+"px"};drawersToAnimateRight[b].animate(e,400,function(){c(this).addClass("drawer-right")})}this.toggleHandles(a)},
animateLeft:function(a){drawersToAnimateLeft=[];drawerIdsToAnimateLeft=[];this.drawersLeft[a]=true;for(drawerId=a-1;drawerId>=1;drawerId--){drawer=c("#"+drawerId);drawer.handleWidth=this.opts.drawerHandleWidth;if(1<=drawer.length&&!this.drawersLeft[drawerId]){drawersToAnimateLeft.push(drawer);drawerIdsToAnimateLeft.push(drawerId);this.drawersLeft[drawerId]=true}}this.fadeInOutDrawers(a);var b={left:parseFloat(c("#"+a).css("left"))-(this.opts.drawerWidth-this.opts.drawerHandleWidth)+"px"};c("#"+a).animate(b,
{step:function(d){c.each(drawersToAnimateLeft,function(e,h){h.css("left",d-h.handleWidth*(e+1))})},complete:function(){c(this).removeClass("drawer-right");c.each(drawersToAnimateLeft,function(d,e){e.removeClass("drawer-right")})}},400);this.toggleHandles(a)},fadeInOutDrawers:function(a){if(!(c.browser.msie&&"6.0"==c.browser.version)){c("#"+this.openDrawerId+" h2").animate({opacity:0},this.opts.drawerFadeOutContentSpeed);c("#"+this.openDrawerId+" .contentBlock").animate({opacity:0},this.opts.drawerFadeOutContentSpeed);
c("#"+a+" h2").animate({opacity:1},this.opts.drawerFadeInContentSpeed);c("#"+a+" .contentBlock").animate({opacity:1},this.opts.drawerFadeInContentSpeed)}},toggleHandles:function(a){this.showHandle(this.openDrawerId);this.hideHandle(a);this.openDrawerId=a},showHandle:function(a){c("#handle"+a).animate({opacity:1},400,function(){c(this).css("display","block")})},hideHandle:function(a){c("#handle"+a).animate({opacity:0},400,function(){c(this).css("display","none")})},renderDrawers:function(a,b){this.init(a,
b);this.setOpenDrawer(b);this.setEventListeners()}};return g});
define("wwhomepage.ui.tennisresults",["jquery-1.4"],function(c){var g=function(){};g.prototype={init:function(a){var b=c(a),d=b.find(a+"_mensScores"),e=b.find(a+"_womensScores");if(d&&e)if(d.hasClass("noresults")&&e.hasClass("noresults")){d.hide();e.hide()}else{updated=false;footer=b.find(a+"_footerLinks");updateDom=d.find(".updated");if(!updated&&updateDom.length){footer.append(updateDom.remove());updated=true}updateDom=e.find(".updated");if(!updated&&updateDom.length){footer.append(updateDom.remove());
updated=true}else updateDom.length&&updateDom.remove()}},render:function(a,b){this.init(a,b)}};return g});define("main",function(){});