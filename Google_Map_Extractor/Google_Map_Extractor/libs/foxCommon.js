const FoxCommon = {
	
	onUrlChange_last_url_saved : "",
	
	downloadAs:{
		keyToColumnHeader : (text)=>{
			text = text.replace(/\_+/g," ");
			text = text.charAt(0).toUpperCase() + text.slice(1);
			return text;
		},
		CSV: function(JSONData, fileName="data", lableList=[]) {
			/*If JSONData is not an object then JSON.parse will parse the JSON string in an Object*/	    
			let arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
			
			/*let CSV = 'sep=,' + '\r\n\n';*/	    
			let CSV = '';
			
			/*This condition will generate the Label/Header*/	    
			if (lableList.length) {
				let row = "";
				lableList.length ? lableList : Object.keys(arrData[0]);
				lableList.forEach((eachLabel)=>{
					eachLabel = FoxCommon.downloadAs.keyToColumnHeader(eachLabel);
					row += eachLabel + ',';
				});
				
				row = row.slice(0, -1);				
				/*append Label row with line break*/	        
				CSV += row + '\r\n';
			}
			
			/*1st loop is to extract each row*/	    
			for (let i = 0; i < arrData.length; i++) {
				let row = "";
				
				/*2nd loop will extract each column and convert it in string comma-seprated*/	
				lableList.forEach((eachLabel, index)=>{
					let eachColumn = arrData[i][eachLabel];
					eachColumn = eachColumn ? eachColumn : ""; 
					console.log(`${index}: eachLabel: ${eachLabel} | eachcolumn: ${eachColumn}`);
					if(eachLabel === 'cid'){
						eachColumn = `https://maps.google.com/?cid=${eachColumn}`;
					}
					row += '"' + eachColumn.toString().replace(/["]/gi, "'") + '",';
				});      
				
				row.slice(0, row.length - 1);
				
				/*add a line break after each row*/	        
				CSV += row + '\r\n';
			}
			
			if (CSV == '') {        
				alert("Invalid data");
				return;
			}   
			
			/*this will remove the blank-spaces from the title and replace it with an underscore*/	    
			fileName = fileName.replace(/ /g,"_");   
			
			function saveData(CSVString, fileName) {
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				
				var blob = new Blob([CSVString], {type: "text/csv;charset=utf-8"});
				url = window.URL.createObjectURL(blob);
				a.href = url;
				a.download = fileName;
				a.click();
				window.URL.revokeObjectURL(url);
			};
			
			saveData(CSV, fileName+'.csv');
		},
		
		text :(data,fileName)=>{
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.style = "display: none";
			var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
			url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName+".txt";
			a.click();
			window.URL.revokeObjectURL(url);
		},
	},
	
	getTabUrl : ()=>{
		return window.location.href;
	},
	
	scroll:{
		toBottom:(time=FoxCommon.randBetween(2000,4000),callback)=>{
			$('html,body').animate({scrollTop:$(document).height()}, time);
			if (typeof callback==="function") { 
				setTimeout(()=>{
					callback();
				},time)
			}
		},
		toTop:(time=FoxCommon.randBetween(2000,4000),callback)=>{
			$('html,body').animate({scrollTop:-$(document).height()}, time);
			if (typeof callback==="function") { 
				setTimeout(()=>{
					callback();
				},time)
			}
		},
		to:(heightFromTop=1000,time= 1000,callback)=>{
			$('html,body').animate({scrollTop:heightFromTop}, time);
			if (typeof callback==="function") { 
				setTimeout(()=>{
					callback();
				},time)
			}
		},
		element:function(selector,options){
			if (typeof options==="undefined") {options={};}
			if (options.time==undefined) {options.time=500;}
			if (options.scrollWhat==undefined) {options.scrollWhat="html, body";}
			if (options.topOffset==undefined) {options.topOffset=50;}
			
			var selectedCollection = $(selector);
			
			/*IMPORTANT*/
			/*Pages Get scrolled to left even if the leftOffset is set to zero 
			so eleminating the leftOffset parameter compeletly if not required(undefined)*/
			if (options.topOffset && options.leftOffset==undefined) {
				selectedCollection.each(function(){
					var position = $(this).offset();
					position.top -= options.topOffset;
					$(options.scrollWhat).animate({
						scrollTop: position.top,
					},options.time);
				});
			}else if(options.leftOffset && options.topOffset==undefined){
				selectedCollection.each(function(){
					var position = $(this).offset();
					position.left -= options.leftOffset;
					$(options.scrollWhat).animate({
						scrollLeft: position.left,
					},options.time);
				});
			}else{
				selectedCollection.each(function(){
					var position = $(this).offset();
					position.top -= options.topOffset;
					position.left -= options.leftOffset;
					$(options.scrollWhat).animate({
						scrollTop: position.top,
						scrollLeft: position.left
					},options.time);
				});
			}
			/*IMPORTANT*/
			
		},
	},
	
	randBetween:(min, max)=>{ 
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	
	/*Endode and Decode*/
	de:(text)=>{
		return atob(atob(atob(text)));
	},
	
	en:(text)=>{
		return btoa(btoa(btoa(text)));
	},
	
	toWord:(number)=>{
		return ["zero","one","two","three","four","five","six","seven","eight","nine","ten"][number];
	},
	
	randomString: ()=>{
		return Math.random().toString(36).substring(2)
	},
	
	onUrlChange: (callback,timeout=1000)=>{
		setInterval(()=>{
			if(location.href!=FoxCommon.onUrlChange_last_url_saved){
				FoxCommon.onUrlChange_last_url_saved = location.href;
				callback();
			}
		},timeout);
	},
	
	isLast : (list,element)=>{
		if(list[list.length-1]===element){
			return true;
		}
		return false;
	},
	generateUUID : ()=> { 
		// Public Domain/MIT
		var d = new Date().getTime();//Timestamp
		var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16;//random number between 0 and 16
			if(d > 0){//Use timestamp until depleted
				r = (d + r)%16 | 0;
				d = Math.floor(d/16);
			} else {//Use microseconds since page-load if supported
				r = (d2 + r)%16 | 0;
				d2 = Math.floor(d2/16);
			}
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	},
	getKeyFromMap: function(index) {
		return {
			"keyword":"Keyword",
			"location":"Location",
			"company_name":"Company Name",
			"website":"website",
			"phone":"phone",
			"email_1":"email_1",
			"email_2":"email_2",
			"email_3":"email_3",
			"address":"address",            
			"city":"city",
			"state":"state",
			"pincode":"pincode",
			"rating_count":"rating_count",
			"review":"review",
			"cid":"cid",
		} [index] || index;
	},
	
};

const $fc = FoxCommon;