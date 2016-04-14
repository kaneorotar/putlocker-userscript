// ==UserScript==
// @name         Putlocker Navigation Buttons
// @namespace    http://rotar.tk/
// @version      0.1
// @description  Add navigation buttons (previous,next) under putlocker tvshow videos.
// @author       Rotar
// @match        http://putlocker.is/watch*
// @grant        none
// @downloadURL  https://github.com/kaneorotar/putlocker-userscript/raw/master/putlocker-navi.user.js
// ==/UserScript==

(function() {
	'use strict';
	var curl = window.location.href;
	var vals = /watch-([a-z]*)-tvshow(-season-([0-9]{1,2})-episode-([0-9]{1,2}))?-online/.exec(curl);
	var se = 0, ep = 0;
	var iurl = curl.replace(/-season-([0-9]{1,2})-episode-([0-9]{1,2})/,"");
	var retries = 3;

	var list = {
		seasons: [],
		season: function(){
			return this.seasons.length-1;
		},
		episode: function(season){
			return this.seasons[season];
		},
		next: function(season,episode){
			if((episode+1)>this.episode(season)){
				if((season+1)>this.season()){
					return null;
				}else{
					return [season+1,1];
				}
			}else{
				return [season,episode+1];
			}
		},
		previous: function(season,episode){
			if((episode-1)<1){
				if((season-1)<1){
					return null;
				}else{
					return [season-1,this.episode(season-1)];
				}
			}else{
				return [season,episode-1];
			}
		}
	};

	if(typeof(vals[2])!="undefined"){//on an episode page
		se = parseInt(vals[3]);
		ep = parseInt(vals[4]);

		var contentbox = document.getElementsByClassName("content-box")[0];
		var msgdiv = document.getElementsByClassName("message")[0];

		var navi = document.createElement("div");
		navi.id = "navi_box";
		navi.style.height = "40px";
		navi.style.position = "relative";
		navi.style.textAlign = "center";
		navi.style.fontFamily = "Arial";
		navi.style.fontSize = "22px";
		navi.style.marginTop = "-5px";
		navi.style.display = "None";

		var prev = document.createElement("a");
		prev.id = "prev_btn";
		prev.style.borderRadius = "4px";
		prev.style.position = "absolute";
		prev.style.left = "5px";
		prev.style.padding = "5px";
		prev.style.fontWeight = "bold";
		prev.style.backgroundImage = "-webkit-linear-gradient(top,#18db03 0%,#2a7a54 100%)";
		prev.style.color = "#EEEEEE";
		prev.style.cursor = "pointer";
		prev.innerHTML = "PREVIOUS";
		prev.style.display = "None";
		navi.appendChild(prev);

		var next = document.createElement("a");
		next.id = "next_btn";
		next.style.borderRadius = "4px";
		next.style.position = "absolute";
		next.style.right = "5px";
		next.style.padding = "5px";
		next.style.fontWeight = "bold";
		next.style.backgroundImage = "-webkit-linear-gradient(top,#18db03 0%,#2a7a54 100%)";
		next.style.color = "#EEEEEE";
		next.style.cursor = "pointer";
		next.innerHTML = "NEXT";
		next.style.display = "None";
		navi.appendChild(next);

		contentbox.insertBefore(navi,msgdiv);
		getIndex(iurl);
	}

	function validate(elem){
		var result;
		if(elem.innerHTML.toLowerCase().substr(0,4)=="prev"){
			result = list.previous(se,ep);
		}else{
			result = list.next(se,ep);
		}
		if(result){
			var nurl = window.location.href.replace("-season-"+se+"-episode-"+ep,"-season-"+result[0]+"-episode-"+result[1]);
			elem.href = nurl;
			if(result[0]<se){
				elem.innerHTML = "PREVIOUS SEASON";
			}else if(result[0]>se){
				elem.innerHTML = "NEXT SEASON";
			}
			elem.style.display = "block";
			navi.style.display = "block";
		}
	}

	function getIndex(lurl){
		var responseb;
		var xhr = new XMLHttpRequest();
		xhr.onloadend = function() {
			if (xhr.status == 200 || xhr.status == 304) {
				responseb = xhr.responseText;
				var dp = new DOMParser();
				var rdom = dp.parseFromString(responseb,'text/html');
				console.log("Index Successfully Fetched");

				var icontentbox = rdom.getElementsByClassName("content-box")[0];
				var tbs = icontentbox.getElementsByTagName("table");
				for(var i=0; i<(tbs.length-5); i++){//put number of episodes for each season into list.seasons
					list.seasons[i+1]=tbs[2+i].childNodes[0].childNodes.length;
				}
				validate(prev);
				validate(next);
			}else{
				console.log("[Request Error] Index fetching failed.");
				retries--;
				if(retries>=0){
					console.log("[Request Error] Retrying in 3 seconds");
					setTimeOut(function(){
						console.log("Fetching Index...");
						getIndex(lurl);
					},3000);
				}
			}
		};

		xhr.open('GET', lurl, true);
		xhr.send(null);
	}
})();