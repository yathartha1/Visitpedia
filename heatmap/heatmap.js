var MONTH_LABEL = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
    ];

    var counter = -1;
    d3.csv("dataWiki.csv", function(error, data) {
        if (error) throw error;
        data.forEach(function(d) {
            d.Visit = +d.Visit;
            d.Month = +d.Month;
            d.Day = +d.Day;
            d.Year = +d.Year;
        });

        var nest2 = d3.nest()
            .key(function(d){ return d.Year; }).sortKeys(d3.ascending)
            .key(function(d){ return d.Month; })
            .key(function(d){ return d.Day; })
        .rollup(function(k){
            return d3.sum(k, function(d) {return (d.Visit)});
        })
        .entries(data);

        var selectedValue = null,
        selectedMonth = null;

    var svg = d3.select('svg');
    var width = +svg.attr('width'),
    height = +svg.attr('height'),
    outermostRadius = Math.min(width, height) / 2 - 50,
    blockLength = outermostRadius * 0.2,
    blockMargin = outermostRadius * 0.05,
    monthInnerRadius = outermostRadius - blockLength,
    padAngle = 0.02,
    cornerRadius = 6,
    monthLabelSize = 14,
    dayOuterRadius = monthInnerRadius - blockMargin,
    dayInnerRadius = dayOuterRadius - blockLength;

    var dataFiltered = nest2.filter(function (d){ return d.key == '2016'});
    heatmap();

    function heatmap(){

        d3.select("svg").append("div")

        .attr("id","btnDiv")
        .style('font-size','75%')
        .style("width","300px")
        .style("position","absolute")
        .style("left",width - 130)
        .style("top",height)

        var btn = d3.select("#btnDiv").selectAll("button").data(['Update'])

        btn = btn.enter().append("button").style("display","inline-block")

        btn.each(function (d) {
            this.innerText = d;
        })

        btn.on("click", updateData);

        var datavals = [2016,2017,2018];
        var slider = d3.sliderVertical()
        .min(2016)
        .max(2018)
        .ticks(2)
        .tickFormat(d3.format(''))
        .height(400)
        .marks(datavals)
        .default(dataFiltered[0].key)
        .on('onchange', val => {
            svg.selectAll("*").remove();
            dataFiltered = nest2.filter(function (d){ return d.key == val});
            heatmap();
        });

        var group = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + 60 + "," + 30 + ")");

        group.call(slider);

        var len = dataFiltered[0].values.length;

        var x = d3.scaleTime()
        .domain([new Date(dataFiltered[0].key,dataFiltered[0].values[0].key - 1, 1), new Date(dataFiltered[0].key, dataFiltered[0].values[len - 1].key , 0)])
        .rangeRound([10, height - 20]);

        svg.append("g")
        .attr("class", "axis axis--grid")
        .attr("transform", "translate(" + (width - 60) + "," + 0 + ")")
        .call(d3.axisRight(x)
            .ticks(d3.timeDay.every(1))
            .tickSize(-100)
            .tickFormat(function() { return null; }))
        .selectAll(".tick")
        .classed("tick--minor", function(d) { return d.getDay(); });

        svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + (width - 60) + "," + 0 + ")")
        .call(d3.axisRight(x)
            .ticks(d3.timeMonth.every(1))
            .tickPadding(0))
            .attr("text-anchor", null)
        .selectAll("text")
        .attr("x", 6);

        let brush = d3.brushY()
        .extent([[width - 160, 10], [width - 60, height - 20]])
        .on("brush", brushmove)
        .on("end", brushended)

        var gBrush = svg.append("g")
        .attr("class", "brush")
        .attr("fill", "#666")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.0)
        .attr("cursor", "ew-resize")
        .call(brush);

        var bSelect1 = gBrush.append("text")
                .text(function(d) { return d; })
                .attr("fill", "blue")
                .attr("id", "brush-label1")
                .attr("text-anchor", "end")
                .attr("x", width - 160)
                .attr("dy", ".20em")
                .style("letter-spacing", "1px");

        var bSelect2 = gBrush.append("text")
                .text(function(d) { return d; })
                .attr("fill", "blue")
                .attr("id", "brush-label2")
                .attr("text-anchor", "end")
                .attr("x", width - 160)
                .attr("dy", ".8em")
                .style("letter-spacing", "1px");

        var month1 = null;
        var month2 = null;
        var day1 = null;
        var day2 = null;

        function brushmove(){
            if (!d3.event.sourceEvent) return;
            if (!d3.event.selection) return;
            var d0 = d3.event.selection.map(x.invert),
                d1 = d0.map(d3.timeDay.round);

            if (d1[0] >= d1[1]) {
            d1[0] = d3.timeDay.floor(d0[0])
            d1[1] = d3.timeDay.offset(d1[0]);
            }

            if (d3.event.selection[1] - d3.event.selection[0] < 40) {
                d3.event.selection[1] = d3.event.selection[0] + 40;
                brush.move(gBrush,[d3.event.selection[0],d3.event.selection[1]]);
            }

            month1 = d1[0].getMonth();
            month2 = d1[1].getMonth();

            d1[0] = d1[0].getDate();
            d1[1] = d1[1].getDate();

            month1 = MONTH_LABEL[month1 + 1];
            month2 = MONTH_LABEL[month2 + 1]

            d3.select(this).select("#brush-label1")
                        .text([month1 + ' ' + d1[0]]);
            d3.select(this).select("#brush-label2")
                        .text([month2 + ' ' + d1[1]]);

            d3.select(this).select("#brush-label1")
                        .attr("y", d3.event.selection[0] - 5);
            d3.select(this).select("#brush-label2")
                        .attr("y", d3.event.selection[1] + 5);
        }

        function brushended() {
            if (!d3.event.sourceEvent) return;
            if (!d3.event.selection) {
                d3.select(this).select("#brush-label1")
                        .text([]);
                d3.select(this).select("#brush-label2")
                        .text([]);
                return;
            }
            var d0 = d3.event.selection.map(x.invert),
                d1 = d0.map(d3.timeDay.round);

            if (d1[0] >= d1[1]) {
            d1[0] = d3.timeDay.floor(d0[0]);
            d1[1] = d3.timeDay.offset(d1[0]);
            }

            month1 = d1[0].getMonth();
            month2 = d1[1].getMonth();

            d1[0] = d1[0].getDate();
            d1[1] = d1[1].getDate();

            day1 = d1[0];
            day2 = d1[1];
        }

        function updateData(){

            var Selected = {
                startMonth: month1,
                endMonth: month2,
                startDay: day1,
                endDay: day2,
                year: dataFiltered[0].key
            };

        }

        var monthColor = d3.scaleOrdinal()
        .domain(d3.range(12))
        .range(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);

        var heatColor = d3.scaleSequential(d3.interpolateYlOrRd).domain([1500000, 15000000]);

        svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate( " + width/4.5 +",10)");

        var legendLinear = d3.legendColor()
        .shapeWidth(100)
        .shapeHeight(10)
        .orient('horizontal')
        .scale(heatColor);

        svg.select(".legendLinear")
        .call(legendLinear);

        var monthArc = d3.arc()
        .padAngle(padAngle)
        .cornerRadius(cornerRadius)
        .innerRadius(monthInnerRadius)
        .outerRadius(outermostRadius);

        var monthTheta = d3.scaleLinear()
        .domain([0, dataFiltered[0].values.length])
        .range([0, Math.PI * 2]);

        var dayThetas = dataFiltered[0].values.map(function (d) {
        var angles = getMonthAngle(+d.key);
        var startRange = angles[0] + padAngle;
        var endRange = angles[1] - padAngle;
        return d3.scaleLinear()
            .domain([0, d.values.length])
            .range([startRange, endRange]);
        });

        var circle = svg.append('g').attr('class', 'circle')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

        var monthGroup = circle.selectAll('.month-group').data(dataFiltered[0].values)
        .enter().append('g')
        .attr('class', function (d) {
            return MONTH_LABEL[+d.key] + ' month-group';
        });

        var monthWrap = monthGroup.append('g')
        .datum(function (d) {
            return d;
        })
        .attr('class', 'month-wrap')
        .on('mouseover', function (d) {
            selectedMonth = d.key;
            counter = -1;
            updateCircle();
        })
        .on('mouseout', function () {
            selectedMonth = null;
            counter = -1;
            updateCircle();
        });

        var monthPath = monthWrap.append('path')
        .datum(function (d) {
            return d;
        })
        .attr('class', 'month')
        .attr('id', function (d) {
            return 'path-' + d.key;
        });

        var textTop = monthWrap.append("text")
        .attr("transform", function(d) { return "translate(" + monthArc.centroid(d) + ")"; })
        .attr("class", "textTop")
        .attr("dy", ".40em")
        .text("")
        .style("text-anchor", "middle");

        var textTop1 = monthWrap.append("text")
        .attr("transform", function(d) { return "translate(" + monthArc.centroid(d) + ")"; })
        .attr("class", "textTop")
        .attr("dy", ".50em")
        .text("")
        .style("text-anchor", "middle");

        var monthText = monthWrap.append('text')
        .datum(function (d) {
            return d;
        })
        .attr('class', 'month-label');

        var monthTextPath = monthText.append('textPath')
        .attr("class", "textpath");

        var dayGroup = monthGroup.append('g')
        .attr('class', 'day-group');

        counter = -1;
        updateCircle();

        function updateCircle() {
            monthPath
            .attr('fill', function (d) {
                return monthColor(d.key);
            })
            .attr('stroke', function() {
                return 'red';
            })
            .attr('stroke-width', function(d) {
                return selectedMonth === d.key ? 2 : 0;
            })
            .attr('d', function (d) {
                var angles = getMonthAngle(+d.key);
                return monthArc({
                    startAngle: angles[0],
                    endAngle: angles[1]
                })
            });
            monthText
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', monthLabelSize)
            .attr('x', function (d) {
                var angles = getMonthAngle(+d.key);
                var halfAngle = (angles[1] - angles[0]) / 2;
                return (halfAngle * outermostRadius) + (cornerRadius / 2);
            })
            .attr('dy', function (d) {
                return (blockLength / 2) + (monthLabelSize / 3);
            });
            monthTextPath
            .attr("xlink:href", function (d) {
                return '#path-' + d.key;
            })
            .text(function (d) {
                return MONTH_LABEL[+d.key]
            });

            var days = dayGroup.selectAll('.day')
            .data(function (d) {
                return d.values;
            })
            .on('mouseover', function (d) {
                selectedValue = d.value;
                counter = -1;
                textTop.text("Day " + d.key).attr("y", -10);
                textTop1.text("Visit Count " + d.value).attr("y", 10);
                updateCircle();
            })
            .on('mouseout', function () {
                selectedValue = null;
                textTop.text("").attr("y", -10);
                textTop1.text("").attr("y", 10);
                counter = -1;
                updateCircle();
            });
            days
            .enter()
            .append('path').attr('class', 'day')
            .merge(days)
            .attr('fill', function (d) {
                return heatColor(d.value)
            })
            .attr('d', function (d, i) {
                if (d.key == 1){
                    counter = counter + 1;
                }
                var month = counter;
                if(dayThetas[month] != undefined){
                var thetaScale = dayThetas[month];
                var selected = selectedValue === d.value;
                return d3.arc()({
                    innerRadius: selected ? 0 : dayInnerRadius,
                    outerRadius: selected ? dayOuterRadius + (blockMargin / 2) : dayOuterRadius,
                    startAngle: thetaScale(i),
                    endAngle: thetaScale(i + 1)
                });
            }
            })
        }
        function getMonthAngle(month) {
        var startAngle = monthTheta(month);
        var endAngle = monthTheta(month + 1);
        return [startAngle, endAngle];
        }
    }
    });
