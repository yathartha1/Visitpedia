function initiialize_viz2(Selected){
        $(document).on('click touch', '.series-segment', function (e) {
			console.log(e.target.__data__.val);
			var label = e.target.__data__.val;
			word(label);
			$('#v3').css("display", "block");
	        $('html, body').animate({
	            scrollTop: $("#v3").offset().top
	        }, 1000);
		 });
        $(function(){
		  $('.toggle').on('click', function(event){
		    event.preventDefault();
		    $(this).toggleClass('active');
		    if($('.toggle').hasClass('active')){
		    	$('#viz2').hide();
		    	$('#viz2b').show();
		    }
		    else{
		    	$('#viz2').show();
		    	$('#viz2b').hide();
		    }
		  });
		});
		$( document ).ready(function() {
		    var string = "?startDay="+Selected.startDay+"&endDay="+Selected.endDay+"&startMonth="+Selected.startMonth+"&endMonth="+Selected.endMonth+"&year="+Selected.year;
	        document.getElementById('viz2b').innerHTML = '<object id="lineChartFrame" data="Line graph/index.html'+string+'" width="80%" height="520"></object>';
		});
		var SelectedData = [];
		var counts = {};
		var ranks = {};
		console.log(Selected.dataset);
		d3.csv("data/"+Selected.dataset, function(f){
			//if (error) throw error;
			//console.log(f);
			Array.prototype.forEach.call(f, child => {
			  //console.log(child);
				if(child[0] != "Title" && !child[0].startsWith('Special:') && child[0] != "404.php"&& !child[0].startsWith('User:') && !child[0].startsWith('File:')  && !child[0].startsWith('XXX') && !child[0].startsWith('Deaths') && !child[0].startsWith('List') && !child[0].startsWith('Template:')){
				  	var day = parseInt(child[2], 10),
					month = parseInt(child[3], 10),
					year = parseInt(child[4], 10);

					if(year == Selected.year && month >= Selected.startMonth && month <= Selected.endMonth){
						if((month == Selected.startMonth && day < Selected.startDay) ||
							(month == Selected.endMonth && day > Selected.endDay)){
							//Ignore entries
						}
						else{
							SelectedData.push(child);
							counts[child[0]] = 1 + (counts[child[0]] || 0);
							var details = {};
							details.day = day;
							details.month = month;
							details.year = year;
							details.rank = child.rank;
							//ranks.push([child[0], object);
						}
					}
				}
			});
			//console.log(counts);
			var sortable = [];
			for (var key in counts) {
			    sortable.push([key, counts[key]]);
			}
			sortable.sort(function(a, b) {
			    return b[1] - a[1];
			});
			//Object.keys(counts).sort(function(a, b) {return -(counts[a] - counts[b])});
			console.log(sortable);
			var topTen = sortable.slice(0, 10);
			//console.log(topTen);
			//var singleWord = [];
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
				//console.log(obj);
				return obj;
			}
			var eventList = [];
			Array.prototype.forEach.call(topTen, child => {
				var obj = {};
				obj.label = child[0];
				obj.data = new Array();
				eventList.push(obj);
			});
			//console.log(eventList);
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
				(document.getElementById('viz_2'));

		});
}
