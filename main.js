function getData(getDataCallBack) {
  $.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', function(data) {
    var data = data.features;
    getDataCallBack(data);
  });
}

f = function(data) {
  const meteorites = data.filter(x => x.geometry != null);
 
  // width and height
  var w = 960;
  var h = 500;
  var color = d3.scaleThreshold()
    .domain([0.1, 100000, 20000000])
    .range(["red", "yellow", "violet", "#99ff99"]);
  //Define path generator
  var projection = d3.geoMercator().scale(130).translate([
    w / 2,
    h / 1.5
  ]);
  var path = d3.geoPath().projection(projection);
  //create SVG element
  var svg = d3.select("#root").append("svg").attr("width", w).attr("height", h).append("g").attr("class", "map");
  d3.select("#root").attr("align", "center");
  //create tooltip
  var tool_tip = d3.tip().attr("class", "d3-tip").offset([-8, 0]).html(function(d) {
    return "Name: " + d.properties.name + "<br>" + "Mass: " + d.properties.mass + "<br>" + "Fall: " + d.properties.fall + "<br>" + "Year: " + d.properties.year + "<br>" + "nameType: " + d.properties.nametype
                    + "<br>" + "Reclat: " + d.properties.reclat;
  });
  svg.call(tool_tip);
  //create a world map - this method was based on an online D3 example (http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f)
  //on 1 Feb, 2018
  d3.json(countries, function(json) {
    svg.selectAll("path").data(countries.features).enter().append("path").attr("d", path).style("fill", "#c3d9ee").style("stroke", "white");
  });
  //create circles representing the meteorites on the world map
  d3.json(meteorites, function(json) {
    svg.selectAll("circle").data(meteorites).enter().append("circle").attr("cx", function(d) {
      return projection([
        d.geometry.coordinates[0], d.geometry.coordinates[1]
      ])[0];
    }).attr("cy", function(d) {
      return projection([
        d.geometry.coordinates[0], d.geometry.coordinates[1]
      ])[1];
    }).attr("r", function(d) { //the circle area is correlated with the mass of the meteorites
      switch (d.properties.mass) {
        case parseInt(d.properties.mass) < 100000:
          return 3 + Math.sqrt(parseInt(d.properties.mass) * 0.0001);
          break;
        case parseInt(d.properties.mass) > 20000000:
          return -25 + Math.sqrt(parseInt(d.properties.mass) * 0.0001);
          break;
        default:
          return Math.sqrt(parseInt(d.properties.mass) * 0.0001);
          break;
      }
    }).style("fill", function(d) { //the circle color is correlated with the mass of the meteorites
      return color(parseInt(d.properties.mass));
    }).style("stroke", "#00e600").style("stroke-width", 0.3).style("opacity", 0.75).on("mouseover", tool_tip.show).on("mouseout", tool_tip.hide);
  });
}

getData(f);
