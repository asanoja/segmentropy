var containerList 	= ["BODY","DIV","UL","DL","P","TABLE","TD","SECTION","HEADER","FOOTER","ASIDE","NAV","ARTICLE"];
var contentList 	= ["SPAN","A","LI","DT","DD","H1","H2","H3","H4","H5","IMG"];

var excludeList 	= ["SCRIPT","STYLE","AREA","HEAD","META","FRAME","FRAMESET","BR","HR","NOSCRIPT","IFRAME"];

var ignoreList 	 	= ["HTML","TBODY","TR","","LINK"];

var ac = 0.5; //in pixel-square
var mac = 0.002 //0.002 pixel-square
var dc = 50; //50px
var tc = 1; //3 words

var dx = dc;
var dy = dc;

var blocks = [];

var bind=0;

var colors = {PAGE:'#FFFF00',CONTAINER:'#34FF00',CONTENT_CONTAINER:'#6FBEE5',CONTENT:'blue',DEFAULT:'magenta'};

function documentDim(win,doc) {
	var w,h;
	if (win) w=win; else w=window;
	if (doc) d=doc; else d=document;
	var e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
return {w:x,h:y};
}

function dumpSegmentationTree(obj,level,pid) {
	if (!obj) return;
	var xml = "";
	var go,spc="";
	
	for (var i=0;i<level;i++) spc+=" ";
	
	if (level==0) {
		xml+="<page geometry=\""+getPolygonPoints(obj.dim)+"\">\n"
	} else {
		xml+="<"+obj.label.toLowerCase()+" type=\""+obj.type.toLowerCase()+"\" geometry=\""+getPolygonPoints(obj.dim)+"\" id=\""+obj.id+"\">\n"
	}
	for (var i=0;i<obj.geometricObjects.length;i++) {
		go=obj.geometricObjects[i];
		if (go) {
			//bs+="[GO"+getId(go)+","+getType(go)+","+go.tagName+","+go.getAttribute('bomgeometry')+"]"
			xml+=spc+"  <"+getType(go).toLowerCase()+" id=\""+getId(go)+"\" geometry=\""+go.getAttribute('bomgeometry')+"\">\n"
			for (var j=0;j<go.childNodes.length;j++) {
				elem=go.childNodes[j];
				//~ if (isText(elem))
					//~ xml+=spc+"      "+go.childNodes[j].data+"\n";
				//~ else if (!isWS(elem))
					//~ xml+=spc+"      "+go.childNodes[j].innerHTML+"\n";
					xml+=spc+"      "+elem+"\n";
					
			}
			xml+=spc+"  </"+getType(go).toLowerCase()+">\n";
		}
	}
	for (var i=0;i<obj.children.length;i++) {
		block = obj.children[i];
		xml+=dumpSegmentationTree(block,level+1,pid);
	}
	if (level==0) {
		xml+="</page>\n"
	} else {
		xml+= "</"+obj.label.toLowerCase()+">\n"
	}
	return(xml);
}

function rawTreeDump(obj,id,level) {
	if (!obj) return;
	if (!obj.block)  return;
	obj.id=id;
	var k=1
	var acum="";
	var spc="";
	for (var i=0;i<level;i++) spc+="&nbsp;";
	
	for (var i=0;i<obj.children.length;i++) {
		if (obj && obj.block) {
			dat = rawTreeDump(obj.children[i],id+"."+(k),level+1);
			if (dat) {
				acum += "<br>" + spc +  dat;
				k++;
			}
		}
	}
	obj.block.innerHTML = "<span visited='true' style='opacity:1;color:black;font-size:12pt'>L"+obj.id+"</span>";
	console.log(obj.id,obj.block);
	bover = "onmouseover=\"over(parent.contentDocument.getElementById('"+obj.block.getAttribute("id")+"'),this)\"";
	bout = "onmouseout=\"out(parent.contentDocument.getElementById('"+obj.block.getAttribute("id")+"'),this)\"";
	mnt = "<span "+bover+" "+bout+">L"+obj.id+" @ "+obj.block.getAttribute("id")+" ["+obj.dim.x+" "+obj.dim.y+" "+obj.dim.w+" "+obj.dim.h+"] CH:"+countChildren(obj)+"</span>";
	return(spc+mnt+acum);
}
function countChildren(obj) {
	var count=0;
	for (var i=0;i<obj.children.length;i++) {
		if (obj.children[i]) 
			count++;
	}
	return(count);
}

function blockCount(obj,onlyLeaves) {
	if (!obj) return;
	if (!obj.block)  return;
	var count;
	if (onlyLeaves && countChildren(obj)>0) 
		count=0;
	else 
		count=1;
	
	for (var i=0;i<obj.children.length;i++) {
		if (obj && obj.block) {
			dat = blockCount(obj.children[i],onlyLeaves);
			if (dat) {
				count+=dat
			}
		}
	}
	return(count);
}

function prepareLogicStructure(go,parent) {
	if (!go) return;
	if (go.getAttribute("class")=="block") return;
	var log,gchild,lchild;
	log=parent;
	//console.log(go.tagName+" "+go.getAttribute("id")+" "+go.getAttribute("class"))
	if (included(getType(go),["CONTAINER","CONTENT_CONTAINER","CONTENT","DEFAULT"])) {
		log = createNewLogicalObject(go,parent);
	}
	for (var i=0;i<go.children.length;i++) {
		gchild = go.children[i];
		prepareLogicStructure(gchild,log);
	}
	return(log);
}

function exportInfo(obj,dest) {
	if (!obj) return(dest);
	if (!obj.block)  return(dest);
	var k=1
	var acum="";
	var dat;
	
	if (countChildren(obj)>0) {
		for (var i=0;i<obj.children.length;i++) {
			if (obj && obj.block) {
				dest = exportInfo(obj.children[i],dest);
			}
		}
	} else {
		bind++;
		dest["block"+bind] = "L"+obj.id+","+obj.dim.x+","+obj.dim.y+","+obj.dim.w+","+obj.dim.h;
	}
	//obj.block.innerHTML = "<span visited='true' style='opacity:1;color:black;font-size:12pt'>L"+obj.id+"</span>";
	//~ console.log(obj.id,obj.block);
	//~ bover = "onmouseover=\"over(parent.contentDocument.getElementById('"+obj.block.getAttribute("id")+"'),this)\"";
	//~ bout = "onmouseout=\"out(parent.contentDocument.getElementById('"+obj.block.getAttribute("id")+"'),this)\"";
	//~ mnt = "<span "+bover+" "+bout+">L"+obj.id+" @ "+obj.block.getAttribute("id")+" ["+obj.dim.x+" "+obj.dim.y+" "+obj.dim.w+" "+obj.dim.h+"] CH:"+countChildren(obj)+"</span>";
	return(dest);
}

function startSegmentation() {	
		contentDocument = contentWindow.document;
		h = topDocument.getElementById("gran");
		ac = h.options[h.selectedIndex].value;
		
		h = topDocument.getElementById("sdc");
		dc = parseInt(h.value);
		
		debug("Starting with AC:"+ac+", DC:"+dc+"px");
		var root = contentDocument.getElementsByTagName('BODY')[0];
		debug("Processing Content Structure");
		processContentStructure(root,0);
		debug("Processing Geometric Structure");
		processGeometricStructure(root,0,1);
		debug("Pre-processing Logic Structure");
		var page = prepareLogicStructure(root);
		debug("Processing Logic Structure");
		processLogicStructure(page,0,1,undefined);
		debug("Preparing output");
		xtree = rawTreeDump(page,1,0)
		add2('vbtree',0,xtree,true);
		
		var xml="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
		xml+=dumpSegmentationTree(page,0,"");
		add2('wprima',0,xml);
		debug(blockCount(page)+" BLOCKS");
		debug(blockCount(page,true)+" LEAVES BLOCKS");
		debug("DOC GEOM:" + documentDim(contentWindow,contentDocument).w+"x"+documentDim(contentWindow,contentDocument).h);
		var params = {};
		params.source = "BOMdata";
		params.meta = "chrome "+documentDim(contentWindow,contentDocument).w+"x"+documentDim(contentWindow,contentDocument).h;
		params.category ="cat";
		params.page = contentDocument.URL;
		params.total = blockCount(page,true);
		params = exportInfo(page,params,"post");
		console.log(params);
		//add2('export',0,output);
		post_to_url("http://www-poleia.lip6.fr/~sanojaa/SCAPE/submit.php",params);

}

function post_to_url(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    outputDocument.body.appendChild(form);
    form.submit();
}

function getXPath(elt) {
     var path = "";
     for (; elt && elt.nodeType == 1; elt = elt.parentNode)
     {
   	idx = getElementIdx(elt);
	xname = elt.tagName;
	if (idx > 1) xname += "[" + idx + "]";
	path = "/" + xname + path;
     }
 
     return path.toLowerCase();	
}

function getElementIdx(elt)
{
    var count = 1;
    for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling)
    {
        if(sib.nodeType == 1 && sib.tagName == elt.tagName)	count++
    }
    
    return count;
}

function findPos(obj) {
   var curleft = obj.offsetLeft || 0;
   var curtop = obj.offsetTop || 0;
   while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
   }
   return {x:curleft,y:curtop};
}

function getRect(obj) {
	if (obj.tagName.toUpperCase() == "BODY") {
		return {x:0, y:0, w:documentDim().w, h:documentDim().h}
	} else {
		//~ r=obj.getBoundingClientRect();
		return {x:$(obj).offset().left, y:$(obj).offset().top, w:$(obj).width(), h:$(obj).height()};
	}
	
}

function isText(element) {
	if (element) {
		if (element.nodeName=="#text") {
			return(element.data.trim()!="");
		} else
			return(false);
	} else {
		return(false);
	}
}

function isWS(element) {
	if (element) {
		if (element.nodeType == 3) {
			if (element.data) {
				return(element.data.trim()=="");
			} else {
				return false
			}
		} else {
			return false;
		}
	} else {
		return(false);
	}
}

function isComment(element) {
	if (element) {
		if (element.nodeType == 8) {
			return true;
		} else {
			return false;
		}
	} else {
		return(false);
	}
}

function isRoot(element) {
	if (element) {
		if (element.tagName.toUpperCase() == "BODY") {
			return true;
		} else {
			return false;
		}
	} else {
		return(false);
	}
}


function isContentContainer(element) {
	if (isContainer(element)) {
		var etc=0;
		var child;
		var n=element.childNodes.length;
		for (var i=0; i<element.childNodes.length; i++) {
			child = element.childNodes[i];
			//~ console.log(child,isWS(child))
			if (isContent(child)) {
				etc++;
			}
			//~ console.log(isWS(child),child.data);
			if (isWS(child) || isComment(child) || !visible(child) || isExcluded(child) || isIgnored(child)) {
				n--;
			}
		}
			//~ console.log("CONTENT",element.tagName,etc,element.childNodes.length,n);//~ console.log(element.tagName,etc,element.childNodes.length,n);

		return(etc == n);
	} else {
		return(false);
	}
}

function isDefault(element) {
	//inspect area and text length of element
	if (element.childNodes.length==0) {
		return(true)
	} 
	var ws = 0;
	for (var i=0; i<element.childNodes.length; i++) {
		if (isWS(element.childNodes[i])) {
			ws++;
		}
	}
	return(element.childNodes.length == ws);
}

function isContent(element) {
	if (isWS(element)) return(false);
	if (isComment(element)) return(false);
	if (isText(element)) return(true);
	var itis = false;
	for (var i=0;i<contentList.length;i++) {
		if (contentList[i].toUpperCase() == element.tagName.toUpperCase()) {
			itis = true;
			break;
		}
	}
	
	//~ var etc = 0;
	//~ var n = element.childNodes.length;
	//~ for (var i=0; i<element.childNodes.length; i++) {
		//~ child = element.childNodes[i];
		//~ if (isContent(child) || isText(child)) {
			//~ etc++;
		//~ }
		//~ if (isWS(child) || isComment(child)) 
				//~ n--;
	//~ }
	//~ console.log("CNT",element.tagName,itis,etc,element.childNodes.length,n);
	return(itis);
	//~ return(itis && (etc==n));
}

function isContainer(element) {
	if (isWS(element)) return(false);
	if (isComment(element)) return(false);
	if (isText(element)) return(false);
	
	var itis = false;
	for (var i=0;i<containerList.length;i++) {
		if (containerList[i].toUpperCase() == element.tagName.toUpperCase()) {
			itis = true;
			break;
		}
	}
	return(itis);
}
function isExcluded(element) {
	if (isWS(element)) return(false);
	if (isComment(element)) return(false);
	if (isText(element)) return(false);
	if (!element) return(false);
	
	var itis = false;
	for (var i=0;i<excludeList.length;i++) {
		if (excludeList[i].toUpperCase() == element.tagName.toUpperCase()) {
			itis = true;
			break;
		}
	}
	return(itis);
}

function isIgnored(element) {
	if (isWS(element)) return(false);
	if (isComment(element)) return(false);
	if (isText(element)) return(false);
	if (!element) return(false);
	
	var itis = false;
	for (var i=0;i<ignoreList.length;i++) {
		if (ignoreList[i].toUpperCase() == element.tagName.toUpperCase()) {
			itis = true;
			break;
		}
	}
	return(itis);
}

function relativeArea(element) {
	var r,p;
	if (element.parentNode) {
		r = getPolygonPoints(getRect(element));
		p = getPolygonPoints(getRect(element.parentNode))
		ra = Math.abs(PolyK.GetArea(r));
		rp = Math.abs(PolyK.GetArea(p));
		res = ra / rp;
		if (res>1) res=1;
		return(res);
	} else {
		return(1);
	}
}

function BOMType(element) {
	if (isWS(element)) return(null);
	if (isComment(element)) return(null);
	if (isText(element)) return(null);
	if (isExcluded(element)) return(null);
	if (!visible(element)) return(null);
	if (!isContent(element)) {
		if ((element.children.length==0) && (element.innerText.trim()=="")) {
			return(null);
		}
	}
	
	//this bother on chrome evaluation with this pluging
	if (element.getAttribute("id")) {
		if (element.getAttribute("id").toLowerCase() == "window-resizer-tooltip") 
			return false;
	}
	
	if (isDefault(element)) 			return "DEFAULT";
	if (isContent(element)) 			return "CONTENT";
	if (isContentContainer(element)) 	return "CONTENT_CONTAINER";
	if (isContainer(element)) 			return "CONTAINER";
	if (isRoot(element)) 				return "PAGE";
	return(null);
}

function processContentStructure(element,level) {
	if (!element) return;
	if (isWS(element)) return(false);
	if (isComment(element)) return(false);
	if (isText(element)) {
		var span = contentDocument.createElement("span");
		span.setAttribute("class","bomwrapper");
		var par = element.parentNode;
		span.appendChild(element);
		par.appendChild(span);
		element = span;
		element.setAttribute("bomtype","CONTENT");
		add2('content',level,"[CONTENT,SPAN]");
		return;
	}
	if (element.getAttribute("bomtype")) return(false);
	if (isExcluded(element)) return(false);
	if (!visible(element)) return(false);
	if (!valid(element)) return(false);
	if (isIgnored(element)) {
		for (var i=0; i<element.childNodes.length; i++) {
			//debug(element.children[i].nodeName+" "+element.children[i].nodeType);
			processContentStructure(element.childNodes[i],level+1);
		}
		return;
	}
	
	var tn = element.tagName;
	var bt = BOMType(element);
	//~ console.log(tn,bt)
	element.setAttribute("bomtype",bt);
	add2('content',level,"["+bt+","+tn+"]");
	for (var i=0; i<element.childNodes.length; i++) {
		//debug(element.children[i].nodeName+" "+element.children[i].nodeType);
		processContentStructure(element.childNodes[i],level+1);
	}
}

function processGeometricStructure(element,level,pid) {
	if (!element) return;
	if (isWS(element)) return(false);
	if (isComment(element)) return(false);
	if (isText(element)) return(false);
	if (isExcluded(element)) return(false);
	
	var bt = element.getAttribute("bomtype");
	var tn = element.tagName;
	var dim = getRect(element);
	var r = dim.x+" "+dim.y+" "+dim.w+" "+dim.h;
	var a =  relativeArea(element);
	element.setAttribute("bomgeometry",r);
	element.setAttribute("bomarea",a);
	element.setAttribute("bomid",pid);
	add2('geometric',level,"[B"+pid+","+bt+","+tn+","+r+"] A:["+a+"]");
	var k = 0;
	for (var i=0; i<element.childNodes.length; i++) {
		child = element.childNodes[i];
		if (!isWS(child) && !isComment(child) && !isText(child) && !isExcluded(child)) {
			k++;
			processGeometricStructure(element.childNodes[i],level+1,pid+"."+k);
		} 
	}
}

function visuallyDifferent(element) {
	if (element) {
		if (!included(element.style.backgroundColor.toLowerCase(),["","transparent","rgba(0,0,0,0)"])) {
			return(true);
		}
	}
	return(false);
}

function distanceGL(go,lo) {
	return(1);
} //delete me
function distanceGG(go,lo) {
	return(0);
} //delete me

function edistance(x1,y1,x2,y2) {
var xs = 0;
var ys = 0;
xs = x2-x1;
xs = xs*xs;
ys = y2-y1;
ys = ys*ys;
return(Math.sqrt(xs+ys));
}

function getPoints(geo) {
	poly = geo.getAttribute("bomgeometry").split(" ");
	for (var u=0;u<poly.length;u++) {
		poly[u] = parseFloat(poly[u]);
	}
	return(poly);
}

function visited(element) {
	if (!element) return(true);
	var res;
	if (res = element.getAttribute("visited")) {
		if (res == "true") {
			return(true);
		} else {
			return(false);
		}
	} else {
		return(false);
	}
}

//~ function getClosestGO(go) {
	//~ gpoly = getPoints(go);
	//~ var distance = [{obj:undefined, value:9999999999},{obj:undefined, value:9999999999},{obj:undefined, value:9999999999},{obj:undefined, value:9999999999}]
	//~ closest = {obj:undefined, value:9999999999};
	//~ for(var k=0;k<go.parentNode.childNodes.length;k++) {
	//~ var col = contentDocument.getElementsByTagName("*");
	//~ console.log("cl",col.length);
	//~ for(var k=0;k<col.length;k++) {
		//~ child = col[k];
		//~ if (!isExcluded(child) && (child != go) && !child.getAttribute("visited")) {
			//~ if (!isText(child) && !isWS(child) && !isComment(child)) {
				//~ 
				//~ cpoly = getPoints(child);
				//~ 
				//~ dleft = Math.abs(cpoly[0] - gpoly[0])
				//~ dtop = Math.abs(cpoly[1] - gpoly[1])
				//~ dright = Math.abs(cpoly[2] - gpoly[2])
				//~ dbottom = Math.abs(cpoly[3] - gpoly[3])
				//~ 
				//~ ileft = 0
				//~ itop = 1
				//~ iright = 2
				//~ ibottom = 3
				//~ 
				//~ console.log("ddg",gpoly);
				//~ console.log("ddc",cpoly);
				//~ console.log("ddx",cpoly[ileft],cpoly[itop],cpoly[iright],cpoly[ibottom]);
				//~ 
				//~ dleft = PolyK.ClosestEdge(gpoly,cpoly[ileft],cpoly[itop]);
				//~ dtop = PolyK.ClosestEdge(gpoly,cpoly[ileft],cpoly[ibottom]);
				//~ dright = PolyK.ClosestEdge(gpoly,cpoly[iright],cpoly[itop]);
				//~ dbottom = PolyK.ClosestEdge(gpoly,cpoly[iright],cpoly[ibottom]);
				//~ 
				//~ console.log("dd",dleft.dist,dtop.dist,dright.dist,dbottom.dist);
				//~ 
				//~ if (dleft.dist < distance[0].value) {
					//~ distance[0].obj = child;
					//~ distance[0].value = dleft.dist;
				//~ }
				//~ if (dtop.dist < distance[1].value) {
					//~ distance[1].obj = child;
					//~ distance[1].value = dtop.dist;
				//~ }
				//~ if (dright.dist < distance[2].value) {
					//~ distance[2].obj = child;
					//~ distance[2].value = dright.dist;
				//~ }
				//~ if (dbottom.dist < distance[3].value) {
					//~ distance[3].obj = child;
					//~ distance[3].value = dbottom.dist;
				//~ }
			//~ }
		//~ }
	//~ }
	//~ console.log(go);
	//~ for (var k=0;k<distance.length;k++) {
		//~ if (distance[k].value < closest.value) {
			//~ closest.obj = distance[k].obj;
			//~ closest.value = distance[k].value;
			//~ console.log("D:",distance[k].obj,distance[k].value);
		//~ }
	//~ }
	//~ 
	//~ console.log(closest);
	//~ if (closest.value < dc) {
		//~ return(closest);
	//~ } else {
		//~ return(false);
	//~ }
//~ }

function isIn(geo,log) {
	var itis = false;
	for (var i=0;i<log.geometricObjects.length;i++) {
		if (log.geometricObjects[i] == geo)
			itis = true;
	}
	return(itis);
}

function isContained(p1,p2) {
	var res = PolyK.Contained(p1,p2);
	return(res);
}

function visible(obj) {
	if (isWS(obj)) return(false);
	if (isComment(obj)) return(false);
	if (isText(obj)) return(true);
	if (isExcluded(obj)) return(false);
	if (visited(obj)) return(false);
	
	var xvis=false;
	var xarea=parseFloat((Math.abs(getRect(obj).w-getRect(obj).x))*(Math.abs(getRect(obj).h-getRect(obj).y)));
	xvis = (included(obj.style.visibility.toUpperCase(),["","VISIBLE","INHERIT"])) || (!included(obj.style.display.toUpperCase(),["","NONE"]));
	return(xvis && (xarea>0));
}

function valid(obj) {
	var val = false;
	var c=0;
	var ws=0;
	var vok=0;
	var child;
	for (var i=0;i<obj.childNodes.length;i++) {
		child = obj.childNodes[i];
		if (isWS(child)) {
			ws++;
		} else { 
			if (isText(child)) {
				if (child.data.trim().length>=tc) { //mejorar el conteo evitar ws internos
					vok++;
				}
			} else {
				if (getType(child)=="CONTENT") { //i.e.: <img/>, <br/> tags
					vok++;
				} else {
					if (!isExcluded(child) && !isIgnored(child) && !isComment(child) ) {
						if (valid(child)) 
							vok++;
					} 
				}
			}
		}
	}
	return(vok>0);
}

function distance(log1,log2) {
	
	var closest = {obj:undefined, value:9999999999};
	
	ileft = 0
	itop = 1
	iright = 2
	ibottom = 3
	
	poly1 = getPolygonPoints(log1.dim);
	
	dleft = PolyK.ClosestEdge	(poly1,log2.dim.x,log2.dim.y);
	dtop = PolyK.ClosestEdge	(poly1,log2.dim.x,log2.dim.h);
	dright = PolyK.	ClosestEdge	(poly1,log2.dim.w,log2.dim.h);
	dbottom = PolyK.ClosestEdge	(poly1,log2.dim.w,log2.dim.y);
		
	if (dleft.dist < closest.value) {
		closest.obj = blocks[i];
		closest.value = dleft.dist;
	}
	if (dtop.dist < closest.value) {
		closest.obj = blocks[i];
		closest.value = dtop.dist;
	}
	if (dright.dist < closest.value) {
		closest.obj = blocks[i];
		closest.value = dright.dist;
	}
	if (dbottom.dist < closest.value) {
		closest.obj = blocks[i];
		closest.value = dbottom.dist;
	}
	
	//console.log("closest",closest.obj,closest.value);
	return(closest);
}

function createNewLogicalObject(geo,parent) {
	var log = new logicalObject();
	log.addGeometricObject(geo);
	log.parent = parent;
	log.setLabel();
	if (parent)	parent.children.push(log);
	blocks.push(log);
	return(log);
}

function getAligment(log1,log2) {
	if ( (Math.abs(log1.dim.x-log2.dim.x)<dc) && (Math.abs(log1.dim.w-log2.dim.w)<dc)) {
		return("V");
	} else { 
		if ( (Math.abs(log1.dim.y-log2.dim.y)<dc) && (Math.abs(log1.dim.h-log2.dim.h)<dc)) {
			return("H");
		} else {
			return(null);
		}
	}
}

function removeLogicObject(log) {
	if (log.parent) {
		var ind=log.parent.children.indexOf(log);
		//~ for(var i=0;i<log.parent.children.length;i++) {
			//~ if (log.parent.children[i]==log) {
				//~ ind=i;
				//~ break;
			//~ }
		//~ }
		
	
		for(var i=0;i<log.children.length;i++) {
			child = log.children[i];
			child.parent = log.parent;
			log.parent.children.push(child);
		}
		
		//~ log.parent.children.splice(ind,1);
		log.parent.children[ind]=undefined
		blocks.splice(blocks.indexOf(log),1);
		log.deleteBlock();
		log = undefined
	}
}

function processLogicalObject(log) {
	if (!log) return;
	if (log.visited) return;
	var dep = true;
	var i,j;
	//~ if (dep && log.block) log.block.style.backgroundColor="#FFFF00";
	for (i=0;i<log.children.length;i++) {
		if ((log.children[i]) && (log.children[i].relativeArea()<ac)) {
			if (log.children[i].visualCuesPresent && log.children[i].type=='CONTENT') {
				console.log(log.geometricObjects[0].style.backgroundColor);
				log.children[i].clearChildrenBlocks();
			} else {
				var touch = 0;
				var stop=false;
				if (i<log.children.length-1)
					j=i+1
				else
					j=i
				//~ for (var j=i+1;j<log.children.length;j++) {
				if (dep && log.children[i].block) log.children[i].block.style.backgroundColor="#FF0000";
				while (!stop) {
					if (log.children[j]) {
						if (dep && log.children[j].block) log.children[j].block.style.backgroundColor="#A52A2A";
						//~ if (log.children[j].visualCuesPresent && log.children[i].type=='CONTENT') {
							//~ log.children[j].clearChildrenBlocks();
							//~ touch++;
						//~ } else {
						if (log.children[j] && log.children[j].relativeArea()<ac) {
							if ((i!=j) && (distance(log.children[i],log.children[j]).value<dc) && (included(getAligment(log.children[i],log.children[j]),["V","H"])) ) {
								log.children[i].mergeWith(log.children[j]);
								touch++;
							} 
						} else {
							
							if (dep && log.children[j].block) log.children[j].block.style.backgroundColor="transparent";
							//~ if (dep && log.block) log.block.style.backgroundColor="transparent";
							//~ if (log.children[j].type!="CONTENT") {
								//~ processLogicStructure(log.children[j]);
							//~ } else log.children[j].clearChildrenBlocks();
						}
						if (dep && log.children[j].block) log.children[j].block.style.backgroundColor="transparent";
					}
					j++;
					stop = (j>=log.children.length);
				}
				if (dep && log.children[i].block) log.children[i].block.style.backgroundColor="transparent";
			}
			//~ if (dep && log.block) log.block.style.backgroundColor="transparent";
			if (touch==0) {
				log.children[i].clearChildrenBlocks();
			}
		} else {
			if (log.children[i] && (log.children[i].type!="CONTENT")) {
				processLogicStructure(log.children[i]);
			} 
			//~ log.children[i].clearChildrenBlocks();
			//~ log.children[i].visited = true
		}
	}
}



function processLogicStructure(log,level,pid,parent) {
	if (!log) return;
	if (log.visited) return;
	console.log("Current Element",log);
	
	if (log.type=="PAGE") {
		processLogicalObject(log);
	} else if (log.type=="CONTAINER"){
		if (log.children.length==1) {
			child = log.children[0];
			removeLogicObject(log);
			processLogicStructure(child,level+1,pid,log);
		} else {
			processLogicalObject(log);
		}
	} else if (log.type=="CONTENT_CONTAINER") {
		if (log.children.length==1) {
			child = log.children[0];
			removeLogicObject(log);
			processLogicStructure(child,level+1,pid,log);
		} else {
			processLogicalObject(log);
		}
	} else if (log.type=="CONTENT") {
		if (log.children.length==1) {
			child = log.children[0];
			removeLogicObject(log);
			processLogicStructure(child,level+1,pid,log);
		} else {
			processLogicalObject(log);
		}
	} else if (log.type=="DEFAULT") {
		processLogicalObject(log);
	} else {
		console.log("WARNING!!!! Element SKIPPED")
	}
	log.visited = true;
}

//~ function processLogicStructure2(log,level,pid,parent) {
	//~ console.log("Current Element",log);
	//~ if (isWS(geo)) return(false);
	//~ if (isComment(geo)) return(false);
	//~ if (isText(geo)) return(false);
	//~ if (isExcluded(geo)) return(false);
	//~ if (visited(geo)) return(false);
	//~ if (!visible(geo)) return(false);
	//~ 
	//~ 
	//~ var log;
	//~ var gos = "";
	//~ var nlog;
//~ 
	//~ if (geo.getAttribute("bomtype")) {
		//~ if ((geo.getAttribute("bomtype")=="CONTAINER") || (geo.getAttribute("bomtype")=="CONTENT") || (geo.getAttribute("bomtype")=="CONTENT_CONTAINER") || (geo.getAttribute("bomtype")=="DEFAULT")){
			//~ if (!isWS(geo) && !isComment(geo) && !isText(geo) && !isExcluded(geo) && !visited(geo)) {
					//~ console.log("Current GO",geo,relativeArea(geo));
				//~ console.log(go);
				//~ console.log(log);
				//~ //gos += "(B"+go.getAttribute("bomid")+" "+go.getAttribute("bomtype")+ " " + go.tagName+")";
				//~ //add2('logic',level,"[L"+pid+"] "+log.label+" GO:["+gos+"]");
				//~ k=0;
				//~ 
					//~ if (getType(geo)=="CONTAINER") {
						//~ if (relativeArea(geo) > ac) {
							//~ log = createNewLogicalObject(geo,parent);
							//~ console.log("New CONTAINER LOG Case 1",geo.tagName,log);
							//~ processSiblings(geo,level,pid,parent);
							//~ processChildren(geo,level,pid,log);
						//~ } else if (relativeArea(geo) > mac) {
							//~ if (visuallyDifferent(geo)) {
								//~ log = createNewLogicalObject(geo,parent);
									//~ console.log("New CONTAINER LOG Case 2",geo.tagName,log);
							//~ } else {
								//~ nlog = getClosestLO(geo,["CONTAINER"]);
								//~ //no usar logical objects usar el esquema tradicional de elementos
								//~ console.log("nlog",nlog.obj);
								//~ if (!nlog.obj) {
									//~ log = createNewLogicalObject(geo,parent);
									//~ console.log("New CONTAINER LOG Case 3",geo.tagName,log);
								//~ } else {
									//~ log = nlog.obj;
									//~ log.addGeometricObject(geo);
									//~ console.log("Reuse CONTAINER LOG Case 4",geo.tagName,log);
								//~ }
							//~ }
						//~ }
					//~ }
					//~ if (getType(geo)=="CONTENT_CONTAINER") {
						//~ if (relativeArea(geo) > ac) {
							//~ log = createNewLogicalObject(geo,parent);
							//~ console.log("New CONTENT_CONTAINER LOG Case 1",geo.tagName,log);
							//~ processSiblings(geo,level,pid,parent);
							//~ processChildren(geo,level,pid,log);
						//~ } else if (relativeArea(geo) > mac) {
							//~ nlog = getClosestLO(geo,["CONTENT_CONTAINER"]);
							//~ console.log("nlog",nlog.obj);
							//~ if (!nlog.obj) {
								//~ log = createNewLogicalObject(geo,parent);
								//~ console.log("New CONTENT_CONTAINER LOG Case 2",geo.tagName,log);
							//~ } else {
								//~ log = nlog.obj;
								//~ log.addGeometricObject(geo);
								//~ console.log("Reuse CONTENT_CONTAINER LOG Case 3",geo.tagName,log);
							//~ }
						//~ }
					//~ }
					//~ if (getType(geo)=="CONTENT") {
						//~ nlog = getClosestLO(geo,["CONTENT","CONTENT_CONTAINER"]);
						//~ console.log("nlog",nlog.obj);
						//~ if (!nlog.obj) {
							//~ log = createNewLogicalObject(geo,parent);
							//~ console.log("New CONTENT LOG Case 2",geo.tagName,log);
						//~ } else {
							//~ log = nlog.obj;
							//~ log.addGeometricObject(geo);
							//~ console.log("Reuse CONTENT LOG Case 3",geo.tagName,log);
						//~ }
					//~ }
			//~ }
		//~ }  else {
			//~ console.log("Ignoring Case 1",geo);
			//~ for (var i=0; geo.children.length; i++) {
				//~ child = geo.children[i];
				//~ processLogicStructure(child,level+1,pid+"."+k);
			//~ }
		//~ }
	//~ } else {
		//~ console.log("Ignoring Case 2",geo);
		//~ for (var i=0; geo.children.length; i++) {
			//~ child = geo.children[i];
			//~ processLogicStructure(child,level+1,pid+"."+k);
		//~ }
	//~ return(log);
//~ }

function getPolygonPoints(dim) {
	var res = [];
	res = res.concat([dim.x,dim.y]);
	res = res.concat([dim.x,dim.h]);
	res = res.concat([dim.w,dim.h]);
	res = res.concat([dim.w,dim.y]);
	//~ res = res.concat([dim.x,dim.y]);
	return(res);
}

function getX(points) {
	var x=[];
	for (var i=0;i<points.length;i+=2) {
		x.push(points[i]);
	}
	return(x);
}

function getY(points) {
	var y=[];
	for (var i=1;i<points.length;i+=2) {
		y.push(points[i]);
	}
	return(y);
}

function getType(obj) {
	if (isWS(obj)) return("");
	if (isComment(obj)) return("");
	if (isText(obj)) return("");
	if (isExcluded(obj)) return("");
	if (visited(obj)) return("");
	
	return(obj.getAttribute("bomtype"));
}
function getId(go) {
	return(go.getAttribute("bomid"));
}

function included(obj,arr) {
	for (var i=0;i<arr.length;i++) {
		if (arr[i]==obj) {
			return(true);
		}
	}
	return(false);
}

function logicalObject(obj) {
	this.block = undefined;
	this.id = "L"+blocks.length;
	this.dim = undefined;
	this.parent;
	this.visited = false;
	this.children = [];
	this.type = "";
	this.geometricObjects = [];
	this.label = "STANDARD";
	this.visualCuesPresent = false;

	this.setLabel = function() {
		if (this.dim.x < dx) {
			this.label = "LEFT";
		} else {
			if ((documentDim().w - this.dim.w) < dx) {
				this.label = "RIGHT";
			} else {
				if (this.dim.y < dy) {
					this.label = "TOP";
				} else {
					if ((documentDim().h - this.dim.h) < dy) {
						this.label = "BOTTOM";
					} else {
						this.label = "STANDARD";
					}
				}
			}
		}
	}
	
	this.nextSibling = function() {
		if (this.parent) {
			ind = this.parent.children.indexOf(this);
			if (ind<this.parent.children.length) {
				return(this.parent.children[ind+1]);
			} else {
				return(null);
			}
		} else {
			return(null);
		}
	}
	
	this.previousSibling = function() {
		if (this.parent) {
			ind = this.parent.children.indexOf(this);
			if (ind>0) {
				return(this.parent.children[ind-1]);
			} else {
				return(null);
			}
		} else {
			return(null);
		}
	}
	
	this.clearChildrenBlocks = function() {
		this.visited = true
		for (var i=0;i<this.children.length;i++) {
			if (this.children[i]) {
				this.children[i].clearChildrenBlocks();
				this.children[i].deleteBlock();
				this.children[i] = undefined;
			}
		}
	}
	
	this.mergeWith = function(log) {
		if (log.geometricObjects) {
			for (var i=0;i<log.geometricObjects.length;i++) {
				this.addGeometricObject(log.geometricObjects[i]);
				log.deleteBlock();
			}
		}
		for (var i=0;i<log.children.length;i++) {
			child = log.children[i];
			if (child) {
				child.parent = this;
				child.visited = true;
				this.children.push(child);
			}
		}
		if (this.type!="CONTAINER") {
			if (log.type!="DEFAULT") {
				if (this.type != log.type) this.type = log.type;
			}
		}
		this.clearChildrenBlocks();
		//~ log.geometricObjects = undefined;
		blocks.splice(blocks.indexOf(log),1);
		log = undefined
	}
	
	this.area = function() {
		return( (this.dim.w-this.dim.x) * (this.dim.h-this.dim.y));
	}
	
	this.relativeArea = function() {
		if (this.parent) {
			return(this.area() / this.parent.area() );
		} else {
			return(1.0);
		}
	}
	
	this.bomgeometry = function() {
		return [this.dim.x,this.dim.y,this.dim.w,this.dim.h];
	}
	
	this.makeid = function()
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 25; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
	
	this.addGeometricObject = function(geo) {
		this.geometricObjects.push(geo);
		var nr;
		var r;
		if (!this.dim) {
			this.dim = {x:0,y:0,w:0,h:0}
			gr = getRect(geo);
			this.dim = gr;
			r = getPolygonPoints(this.dim);
			this.type = getType(geo);
			if (geo.tagName.toUpperCase()=="BODY") {this.type='PAGE';this.id="PAGE";}
		} else {
			r = getPolygonPoints(this.dim).concat(getPolygonPoints(getRect(geo)));
			if (included(getType(geo),["CONTAINER","CONTENT_CONTAINER"])) {
				this.type = getType(geo);
			}
		}
		
		xs = getX(r);
		ys = getY(r);
		//~ console.log("Xs",xs)
		//~ console.log("Ys",ys)
		//~ ab = PolyK.GetAABB(r);
		//~ ab = PolyK.ConvexHull(r); for later when it works stable
		
		//~ this.dim.x = ab.x;
		//~ this.dim.y = ab.y;
		//~ this.dim.w = ab.width;
		//~ this.dim.h = ab.height;
		
		this.dim.x = Math.min.apply(null, xs);
		this.dim.y = Math.min.apply(null, ys);
		this.dim.w = Math.max.apply(null, xs);
		this.dim.h = Math.max.apply(null, ys);
		
		//console.log("DIM",r,this.dim)
		
		if (!this.block) {
			this.block = this.insertBlock();
		}
		var g = this.dim.x+" "+this.dim.y+" "+this.dim.w+" "+this.dim.h;
		this.block.setAttribute("bomgeometry",g);
		this.block.setAttribute("bomtype",this.type);
		//~ this.block.setAttribute("id",this.id);
		color=colors[this.type]; 
		
		this.block.setAttribute("style","border : 2px solid black;z-index: 10000;position:absolute;background-color:transparent;border-color:"+color+";color:black;font-weight:bold;opacity:1"); 
		//left:"+this.dim.x+";top:"+this.dim.y+";width:"+(this.dim.w-this.dim.x)+";height:"+(this.dim.h-this.dim.y)+"
		this.block.style.left = this.dim.x+"px";
		this.block.style.top = this.dim.y+"px";
		this.block.style.width = this.dim.w+"px";
		this.block.style.height = this.dim.h+"px";
		geo.setAttribute("visited","true");
		var sfc;
		var bgc;
		bgc = contentWindow.getComputedStyle(geo,null).getPropertyValue("background-color");
		fc = parseInt(contentWindow.getComputedStyle(geo,null).getPropertyValue("font-size"));
		if (bgc!="rgba(0, 0, 0, 0)") {
			this.visualCuesPresent = true;
		}

		if (geo.parentNode) {
			t=0
			for (var k=0;k<geo.parentNode.children.length;k++) {
				if ( (geo.parentNode.children[k]!=geo) ) {
					var sfc = parseInt(contentWindow.getComputedStyle(geo.parentNode.children[k],null).getPropertyValue("font-size")); 
					if (2*sfc < fc) 
						t++;
				}
			}
			if (t>0) 
				this.visualCuesPresent = true;
		}
		
	}
	
	this.insertBlock = function() {
		var block = document.createElement('div');
		block.innerHTML = "<span visited='true' style='opacity:1;color:black;font-size:12pt'>"+this.id+"</span>";
		block.setAttribute("class","block");
		block.setAttribute("visited","true");
		block.setAttribute("id",this.makeid());
		contentDocument.body.appendChild(block);
		return(block);
	}
	this.deleteBlock = function() {
		if (this.block) contentDocument.body.removeChild(this.block);
		this.block=undefined;
	}
	
}
