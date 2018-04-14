

getWidth = () => {
  return $(document.body).width();
}

getHeight = () => {
  return $(document.body).height();
}

updateSVG = () => {
    if (window.jQuery) {
        // jQuery is loaded
        width = +getWidth();
        height = +getHeight();
        svg.attr('width', width)
           .attr('height', height);
        reset();
        circle.transition(); // stops previous transition
        transition();

        pattern = Trianglify({
          height: height,
          width: width,
          cell_size: 10 + Math.round(Math.random()*200),
          variance: "10"});
        $('div.sketch').html(pattern.canvas());
    } else {
        // jQuery is not loaded
        setTimeout(updateSVG, 100);
    }
}

var svg = d3.select("svg"),//.on("touchmove mousemove", moved),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var n_sites = 75;
var sites = d3.range(n_sites)
    .map(function(d) { return [Math.random() * width, Math.random() * height]; });

reset = () => {
  sites = d3.range(n_sites)
      .map(function(d) { return [Math.random() * width, Math.random() * height]; });
  _spline_path.attr('d', _spline(sites));
  voronoi = d3.voronoi()
      .extent([[-1, -1], [width + 1, height + 1]])
}


var circle = svg.append("circle")
    .attr("r", 13)
    .attr('stroke', 'none')
    .attr('fill', 'none')
    .attr("transform", "translate(" + sites[0] + ")");
var _spline = d3.line()
    .curve(d3.curveCardinalClosed);
var _spline_path = svg.append("path")
    .data(sites)
    .attr("class", "line")
    .attr('stroke', 'none')
    .attr('fill', 'none')
    .attr("d", _spline(sites));

function transition() {
  circle.transition()
      .duration(180*1000)
      // .ease(d3.easeCubicInOut)
      // .ease(d3.easeSinInOut)
      .ease(d3.easeBounceInOut)
      // .ease(d3.easeElasticInOut)
      // .ease(d3.easeBackInOut)
      .attrTween("transform", translateAlong(_spline_path.node()))
      .on("end", transition);
}

// Returns an attrTween for translating along the specified path element.
// Notice how the transition is slow for the first quarter of the aniimation
// is fast for the second and third quarters and is slow again in the final quarter
// This is normal behavior for d3.transition()
function translateAlong(path) {
  var l = path.getTotalLength() * 2;
  return function(d, i, a) {
    return function(t) {
      if(t* l >= l/2){
          var p = path.getPointAtLength(l - (t*l))
      } else {
          var p = path.getPointAtLength(t * l);
      }
      sites[0] = [p.x, p.y];
      sites[n_sites-1] = [width-p.x, height-p.y];
      redraw();
      return "translate(" + p.x + "," + p.y + ")";
    };
  };
}

var voronoi = d3.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);

var polygon = svg.append("g")
    .attr("class", "polygons")
  .selectAll("path")
  .data(voronoi.polygons(sites))
  .enter().append("path")
    .call(redrawPolygon);

var link = svg.append("g")
    .attr("class", "links")
  .selectAll("line")
  .data(voronoi.links(sites))
  .enter().append("line")
    .call(redrawLink);

var site = svg.append("g")
    .attr("class", "sites")
  .selectAll("circle")
  .data(sites)
  .enter().append("circle")
    .attr("r", 2.5)
    .call(redrawSite);

function moved() {
  sites[0] = d3.mouse(this);
  redraw();
}

function redraw() {
  var diagram = voronoi(sites);
  polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
  link = link.data(diagram.links()), link.exit().remove();
  link = link.enter().append("line").merge(link).call(redrawLink);
  site = site.data(sites).call(redrawSite);
}

function redrawPolygon(polygon) {
  polygon
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
}

function redrawLink(link) {
  link
      .attr("x1", function(d) { return d.source[0]; })
      .attr("y1", function(d) { return d.source[1]; })
      .attr("x2", function(d) { return d.target[0]; })
      .attr("y2", function(d) { return d.target[1]; });
}

function redrawSite(site) {
  site
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; });
}

transition();
updateSVG();

var pattern = Trianglify({
  height: height,
  width: width,
  cell_size: 40,
  variance: "10"});
$('div.sketch').html(pattern.canvas());
