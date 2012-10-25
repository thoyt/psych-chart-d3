
var pc = new function() {

  var CtoF = function(x){ return x * 9 / 5 + 32 }

  this.margin = 40
  this.rbmargin = 60
  this.width = 700
  this.height = 500
  this.db_min = 10
  this.db_max = 36

  this.db_extent = [this.db_min, this.db_max]
  this.db_scale = d3.scale.linear()
                    .range([this.margin,this.width - this.rbmargin])
                    .domain(this.db_extent)


  this.db_extent_F = [CtoF(this.db_min), CtoF(this.db_max)]
  this.db_scale_F = d3.scale.linear()
                    .range([this.margin,this.width - this.rbmargin])
                    .domain(this.db_extent_F)
                  
  this.hr_extent = [0, 30]
  this.hr_scale = d3.scale.linear()
                    .range([this.height - this.rbmargin, this.rbmargin])
                    .domain(this.hr_extent)

  this.pline = d3.svg.line()
                 .x(function(d){return this.db_scale(d.db)})
                 .y(function(d){return this.hr_scale(1000 * d.hr)})

  this.drawChart = function(data) {
	
	  console.log(data)
    var db_axis = d3.svg.axis().scale(pc.db_scale)
    var db_axis_F = d3.svg.axis().scale(pc.db_scale_F)
    var hr_axis = d3.svg.axis().scale(pc.hr_scale).orient("right")

    var line = d3.svg.line()
                 .x(function(d){return pc.db_scale(d.db)})
                 .y(function(d){return pc.hr_scale(1000 * d.hr)})
                 .interpolate('cardinal')

    var dpoly = data.rh100.concat({"db":9, "hr": 0.03})

    d3.select("body")
      .append("svg")
	.attr("class", "chart")
        .attr("width", pc.width)
        .attr("height", pc.height)

    d3.select("svg")
    .append("rect")
      .attr("width", pc.width - pc.margin - pc.rbmargin)
      .attr("height", pc.height - pc.margin - pc.rbmargin-20)
      .attr("class", "chartbg")
      .attr("transform", "translate(" + pc.margin + "," + pc.rbmargin + ")")

    d3.select("svg")
      .append("defs")
      .append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", pc.width - pc.margin - pc.rbmargin)
        .attr("height", pc.height - pc.margin - pc.rbmargin-20)
        .attr("transform", "translate(" + pc.margin + "," + pc.rbmargin + ")")

    d3.select("svg")
      .append("path")
        .attr("d", line(dpoly)) 
        .attr("class", "w")

    d3.select("svg")
      .append("path")
        .attr("d", line(data.rh100))
        .attr("class", "rh100")
        .attr("clip-path", "url(#clip)")

    for (var key in data){
      if (key=="rh100") continue
      d3.select("svg")
        .append("path")
          .attr("d", line(data[key]))
          .attr("class", "rhline")
          .attr("clip-path", "url(#clip)")
    }

    d3.select("svg")
      .append("g")
        .attr("class", "db axis")
        .attr("id", "db-axis-C")
        .attr("transform", "translate(0," + (pc.height - pc.rbmargin) + ")")
        .call(db_axis)

    d3.select("svg")
      .append("g")
         .attr("class", "db axis")
         .attr("id", "db-axis-F")
         .attr("opacity", "0")
         .attr("transform", "translate(0," + (pc.height - pc.rbmargin) + ")")
         .call(db_axis_F)

    d3.select("svg")
      .append("g")
        .attr("class", "hr axis")
        .attr("transform", "translate(" + (pc.width - pc.rbmargin) + ",0)")
        .call(hr_axis)

    d3.select("#db-axis-C")
      .append("text")
        .text("Drybulb Temperature [°C]")
          .attr("id", "db-unit")
          .attr("x", (pc.width / 2) - 1.9 * pc.margin)
          .attr("y", pc.rbmargin / 1.3)

    d3.select("#db-axis-F")
      .append("text")
        .text("Drybulb Temperature [°F]")
          .attr("id", "db-unit")
          .attr("x", (pc.width / 2) - 1.9 * pc.margin)
          .attr("y", pc.rbmargin / 1.3)

    d3.select(".hr.axis")
      .append("text")
        .attr("id", "hr-text")
        .attr("transform", "rotate (-90, -43, 0) translate(-360,90)")
      .append("tspan")
        .text("Humidity Ratio [g")
        .attr("id", "hr-unit0")

    d3.select("#hr-text")
      .append("tspan")
        .text("w")
        .style("baseline-shift", "sub")

    d3.select("#hr-text")
      .append("tspan")
        .text(" / kg")
        .attr("id", "hr-unit1")

    d3.select("#hr-text")
      .append("tspan")
        .text("da")
        .style("baseline-shift", "sub")

    d3.select("#hr-text")
      .append("tspan")
        .text("]")
  }

  this.drawComfortRegion = function(data){

    d3.select("svg")
      .append("path")
        .attr("clip-path", "url(#clip)")
        .attr("d", pc.pline(data) + "Z") 
        .attr("class", "comfortzone")

  }

  this.redrawComfortRegion = function(data){

    d3.select("path.comfortzone")
      .attr("d", pc.pline(data) + "Z")

  }

  this.drawPoint = function(data){

    d3.select("svg")
      .append("circle")
        .attr("class", "outer")
        .attr("r", 12)

    d3.select("svg")
      .append("circle")
        .attr("class", "inner")
        .attr("r", 2)

    d3.selectAll("circle")
      .attr("cx", pc.db_scale(data[0].db))
      .attr("cy", pc.hr_scale(1000 * data[0].hr))

  }

  this.redrawPoint = function(data) {

    d3.selectAll("circle")
      .attr("cx", pc.db_scale(data[0].db))
      .attr("cy", pc.hr_scale(1000 * data[0].hr))

  }

  this.getHumRatio = function(db, rh) {
    return psy.humratio(psy.PROP.Patm, rh * psy.satpress(db) / 100)
  }

  this.findComfortBoundary = function(d, pmvlimit) {
    var boundary = []
  
    function solve(rh, target){
      var epsilon = 0.001
      var a = 0
      var b = 100
      var fn = function(db){
        return pmvElevatedAirspeed(db, d.tr, d.vel, rh, d.met, d.clo, d.wme)[0][0]
      }
      t = psy.bisect(a, b, fn, epsilon, target)
      return {"db": t, "hr": pc.getHumRatio(t,rh)}
    }

    for (rh = 0; rh <= 100; rh += 10){
      boundary.push(solve(rh, -pmvlimit))
    }
    while (true){
      t += 0.5
      boundary.push({"db": t, "hr": pc.getHumRatio(t,100)})
      if (pmvElevatedAirspeed(t, d.tr, d.vel, rh, d.met, d.clo, d.wme)[0][0] > pmvlimit) break
    }
    for (rh = 100; rh >= 0; rh -= 10){
      boundary.push(solve(rh, pmvlimit))
    }
    return boundary
  }

  this.setupChart = function(d){
    d3.json('data/rh-curves.json', pc.drawChart)
    var json = [{"db": d.ta, "hr": pc.getHumRatio(d.ta, d.rh)}]
    var b = pc.findComfortBoundary(d,0.5)
    setTimeout(function(){pc.drawComfortRegion(b)}, 10)
    setTimeout(function(){pc.drawPoint(json)}, 10)
  }

  this.toggleUnits = function(isCelsius) {
  
    if (isCelsius){
      d3.select("#db-axis-C").attr("opacity", "100")
      d3.select("#db-axis-F").attr("opacity", "0")
      document.getElementById('hr-unit0').textContent = "Humidity Ratio [g"
      document.getElementById('hr-unit1').textContent = "/ kg"
    }else{
      d3.select("#db-axis-C").attr("opacity", "0")
      d3.select("#db-axis-F").attr("opacity", "100")
      document.getElementById('hr-unit0').textContent = "Humidity Ratio [lb"
      document.getElementById('hr-unit1').textContent = "/ klb"
    }
  
  }

}
