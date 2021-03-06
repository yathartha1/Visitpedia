function initiialize_viz2(Selected){
	var top101 = [];
	var top102 = [];
	document.getElementById('viz2b').innerHTML = "";
	document.getElementById('viz2c').innerHTML = "";
	document.getElementById('viz_2').innerHTML = "";
	$('#viz2').find('.chart_heading').remove()
	$("#viz_2").append("<h3>Google</h3>");
        $(document).on('click touch', '.series-segment', function (e) {
			console.log(e);
			var label = e.target.__data__.val;
			if(top101.includes(label) && top102.includes(label)){
				var color = e.target.attributes.style.textContent.split(';')[0];
				color = color.substr(color.indexOf('r'), color.length-1)
				word(label, color, ranks1, ranks2);
				$('#v3').css("display", "block");
		        $('html, body').animate({
		            scrollTop: $("#v3").offset().top
		        }, 10);
			}
			else{
				alert("Please select event common to both datasets");
			}
		 });
        $(function(){
		  $('.toggle').on('click', function(event){
		    event.preventDefault();
		    $(this).toggleClass('active');
		    if($('.toggle').hasClass('active')){
		    	$('#viz2').hide();
		    	$('#v3').css("margin-top", "40%");
		    	$('#viz2b').show();
		    	$('#viz2c').show();
		    	$('.chart_heading').show();
		    }
		    else{
		    	$('#viz2').show();
		    	$('#viz2b').hide();
		    	$('#viz2c').hide();
		    	$('#v3').css("margin-top", "25%");
		    	$('.chart_heading').hide();
		    }
		  });
		});
		$( document ).ready(function() {
		    var string = "?startDay="+Selected.startDay+"&endDay="+Selected.endDay+"&startMonth="+Selected.startMonth+"&endMonth="+Selected.endMonth+"&year="+Selected.year+"&dataset=RankWikiData.csv";
		    var string2 = "?startDay="+Selected.startDay+"&endDay="+Selected.endDay+"&startMonth="+Selected.startMonth+"&endMonth="+Selected.endMonth+"&year="+Selected.year+"&dataset=RankGoogleData.csv";
	        // $("#viz2b").insertBefore("<h3>Wikipedia</h3>");
	        // $("#viz2c").insertBefore("<h3>Google</h3>");
	        document.getElementById('viz2b').innerHTML = '<object id="lineChartFrame" data="Line graph/index-both.html'+string+'" width="80%" height="520"></object>';
	        document.getElementById('viz2c').innerHTML = '<object id="lineChartFrame" data="Line graph/index-both.html'+string2+'" width="80%" height="520"></object>';
	        $('#viz_2').after("<h3>Wikipedia</h3>");
		});
		var SelectedData = [];
		var counts = {};
		var ranks1 = {};
		//console.log(Selected.dataset);
		d3.csv("data/RankWikiData.csv", function(f){
			Array.prototype.forEach.call(f, child => {
				if(child[0] != "Title" && !child[0].startsWith('Special:') && child[0] != "404.php"&& !child[0].startsWith('User:') && !child[0].startsWith('File:')  && !child[0].startsWith('XXX') && !child[0].startsWith('Deaths') && !child[0].startsWith('List') && !child[0].startsWith('Template:')){
				  	var day = parseInt(child[2], 10),
					month = parseInt(child[3], 10),
					year = parseInt(child[4], 10),
					visitCount = parseInt(child[1], 10);

					if(year == Selected.year && month >= Selected.startMonth && month <= Selected.endMonth){
						if((month == Selected.startMonth && day < Selected.startDay) ||
							(month == Selected.endMonth && day > Selected.endDay)){
							//Ignore entries
						}
						else{
							counts[child[0]] = 1 + (counts[child[0]] || 0);
							ranks1[child[0]] = (ranks1[child[0]]|| 0 ) + visitCount;
							SelectedData.push(child);
						}
					}
				}
			});
			console.log(ranks1);
			var sortable = [];
			for (var key in counts) {
			    sortable.push([key, counts[key]]);
			}
			sortable.sort(function(a, b) {
			    return b[1] - a[1];
			});
			console.log(sortable);
			var topTen = sortable.slice(0, 10);
			topTen.forEach(function(el){top101.push(el[0])})
			function pushSinglePoint(point){
				var timeRange = [];
				var day = parseInt(point[2], 10),
					month = parseInt(point[3], 10),
					year = parseInt(point[4], 10);
				timeRange.push(new Date(year, month, day));
				timeRange.push(new Date(year, month, day+1));
				var obj = {
					"timeRange": timeRange,
					"val": point[0],
					"rank": point.Rank
				}
				return obj;
			}
			var eventList = [];
			Array.prototype.forEach.call(topTen, child => {
				var obj = {};
				obj.label = child[0];
				obj.data = new Array();
				eventList.push(obj);
			});
			Array.prototype.forEach.call(SelectedData, child => {
				eventList.some(function(el){
					if(el.label == child[0]){
						var dataPoint = {};
						dataPoint = pushSinglePoint(child);
						el.data.push(dataPoint);
					}
				});
			});
			console.log(eventList);
			var riverData = {};
			riverData.data = eventList;
			riverData.group = "Events";
			console.log(riverData);
			var data = [];
			data.push(riverData);
			TimelinesChart()
				.data(data)
				.maxLineHeight(20)
				.width(1024)
				.zQualitative(true)
				(document.getElementById('viz_2'));
		});
		var ranks2 = {};
		d3.csv("data/RankGoogleData.csv", function(f){
			Array.prototype.forEach.call(f, child => {
				if(child[0] != "Title" && !child[0].startsWith('Special:') && child[0] != "404.php"&& !child[0].startsWith('User:') && !child[0].startsWith('File:')  && !child[0].startsWith('XXX') && !child[0].startsWith('Deaths') && !child[0].startsWith('List') && !child[0].startsWith('Template:')){
				  	var day = parseInt(child[2], 10),
					month = parseInt(child[3], 10),
					year = parseInt(child[4], 10),
					visitCount = parseInt(child[1], 10);

					if(year == Selected.year && month >= Selected.startMonth && month <= Selected.endMonth){
						if((month == Selected.startMonth && day < Selected.startDay) ||
							(month == Selected.endMonth && day > Selected.endDay)){
							//Ignore entries
						}
						else{
							counts[child[0]] = 1 + (counts[child[0]] || 0);
							ranks2[child[0]] = (ranks2[child[0]]|| 0 ) + visitCount;
							SelectedData.push(child);
						}
					}
				}
			});
			console.log(ranks2);
			var sortable = [];
			for (var key in counts) {
			    sortable.push([key, counts[key]]);
			}
			sortable.sort(function(a, b) {
			    return b[1] - a[1];
			});
			console.log(sortable);
			var topTen2 = sortable.slice(0, 10);
			topTen2.forEach(function(el){top102.push(el[0])})
			function pushSinglePoint(point){
				var timeRange = [];
				var day = parseInt(point[2], 10),
					month = parseInt(point[3], 10),
					year = parseInt(point[4], 10);
				timeRange.push(new Date(year, month, day));
				timeRange.push(new Date(year, month, day+1));
				var obj = {
					"timeRange": timeRange,
					"val": point[0],
					"rank": point.Rank
				}
				return obj;
			}
			var eventList = [];
			Array.prototype.forEach.call(topTen2, child => {
				var obj = {};
				obj.label = child[0];
				obj.data = new Array();
				eventList.push(obj);
			});
			Array.prototype.forEach.call(SelectedData, child => {
				eventList.some(function(el){
					if(el.label == child[0]){
						var dataPoint = {};
						dataPoint = pushSinglePoint(child);
						el.data.push(dataPoint);
					}
				});
			});
			console.log(eventList);
			var riverData = {};
			riverData.data = eventList;
			riverData.group = "Events";
			console.log(riverData);
			var data = [];
			data.push(riverData);
			TimelinesChart()
				.data(data)
				.maxLineHeight(20)
				.zQualitative(true)
				.width(1024)
				(document.getElementById('viz_2'));
		});
}
