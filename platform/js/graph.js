function myGraph(el) {
  var self = this;
  var nodes = [];
  var links = [];

  var classMap = {
      'edgeserver'   :"server",
      'appserver'    :"server",
      'dbserver'     :"server",
      'slavedbserver':"server",
      'cacheserver'  :"server",
      'fileserver'   :"server",
      'newrelic'     :"server",
      'indexserver'  :"server",
      'codeserver'   :"server"
  };

  var _types = ['edgeserver', 'appserver', 'dbserver', 'slavedbserver', 'cacheserver', 'fileserver', 'newrelic', 'indexserver', 'codeserver'];

  self._events = {
      'node.selected'  :[],
      'node.unselected':[]
  }

  this.registerEvent = function(event, cb){
      self._events[event].push(cb);
  }

  this._triggerEvent = function(event, target){
      var e = {
          "name": event,
          "node": target
      };
      var listeners = self._events[event];
      $.each(listeners, function(i, cb){
          cb(e);
      });
  }

  // Add and remove elements on the graph object
  this.addNode = function (node) {
      if(node.type == "edgeserver"){
          node.fixed = true;
          node.x = w/2;
          node.y = 50;
      }
      else if(node.type == "newrelic"){
          node.fixed = true;
          node.x = 100;
          node.y = 275;
      }
      else if(node.type == "codeserver"){
          node.fixed = true;
          node.x = 100;
          node.y = 150;
      }
      nodes.push(node);
      update();
  }

  this.removeNode = function (id) {
      var i = 0;
      var n = findNode(id);
      while (i < links.length) {
          if ((links[i]['source'] == n) || (links[i]['target'] == n)){
              links.splice(i, 1);
          }
          else{
              i++;
          }
      }
      nodes.splice(findNodeIndex(id), 1);
      update();
  }

  this.addLink = function (source, target){
    if (findNode(source) && findNode(target)) {
      links.push({"source": findNode(source), "target": findNode(target)});
      update();
    }
  }

  var findNode = function(id){
    var toReturn = false;
    $.each(nodes, function(i, obj){
      if (obj.id == id) {
        toReturn = obj;
      }
    });
    return toReturn;
  }

  var findNodeIndex = function(id){
    for (var i in nodes) { if (nodes[i]["id"] === id) return i};
  }

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  // set up the D3 visualisation in the specified element
  var w = $(el).innerWidth(),
      h = $(el).innerHeight(),
      r = 36, // Circle radius.
      st = 50,
      bgcolor = 0,
      sw = 5,
      fill = "#FFF";
      //sc = "";

  //var vis = this.vis = d3.select(el).append("svg:svg")
//        .attr("width", w)
//        .attr("height", h)
//        .attr("stroke", st)
//        .attr("background", bgcolor)
//        .attr("fill", fill)
//        .attr("stroke-width", sw);
      //.attr("class", sc);

  var svg = d3.select(el).append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("stroke", st)
    .attr("background", bgcolor)
    .attr("fill", fill)
    .attr("stroke-width", sw);
  var chartLayer = svg.append("g").classed("chartLayer", true)
    .attr("width", w)
    .attr("height", h);

  // Remember the node that is selected.
  var selectedNode = false;

//    var force = d3.force()
//        //.chargeDistance(.10000)
//        //.alpha(0)
//        .gravity(1)
//        .friction(.7)
//        .linkStrength(function(d){
//            if (d.target.type == "newrelic" || d.target.type == "codeserver"){
//                return 0;
//            }
//            return 1;
//        })
//        .distance(function(d){
//            //var dist = 10 + (10*d.source.links.length)
//            //return dist;
//            if(d.target.type == "codeserver" || d.target.type == "newrelic" || d.source.type == "codeserver" || d.source.type == "newrelic"){
//                return w/2;
//            }
//            if(d.source.links.length > 5 || d.target.type == "appserver"){
//                return 150;
//            }
//            return 150;
//        })//Could be a function
//        .charge(function(d){
//            if(d.type == "appserver"){
//                return -20000;
//            }
//            else if(d.type=="newrelic" || d.type=="codeserver"){
//                return 0;
//            }
//            return -20000;
//        })//Could be a function
//        .size([w, h]);
  
  //var links = [];
  //var links = d3.forceLink(links).id(function(d) { return d.index });

  var simulation = d3.forceSimulation(nodes)
    .force("collide", d3.forceCollide( function(d){ return d.r + 8 }).iterations(16) )
    .force("link", d3.forceLink(links).id(function(d) { return d.index }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
      return d.radius;
    }))
    .force("y", d3.forceY(0))
    .force("x", d3.forceX(0))
    .on("tick", ticked);
  
  var linkGroup = svg.append("g").classed("linkGroup", true).selectAll(".link");
  var nodeGroup = svg.append("g").classed("nodeGroup", true).selectAll(".node");

 //var nodes = simulation.nodes();
//  console.log(nodes);
//    links = links.links();

  svg.on("click", function(){
      if (d3.event.defaultPrevented) return;
      if (selectedNode) {
        self._triggerEvent("node.unselected", selectedNode);
        selectedNode = false;
        activate();
      }
      d3.event.stopPropagation();
  });

  var ticked = function() {
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    node.attr("cx", function(d) { return d.x = Math.max(r, Math.min(w - r, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(r, Math.min(h - r, d.y)); });

    nodes.forEach(function(d, i){
      /** CONFIG: Set default y-axis placement for nodes. */
      if (d.type == "appserver") {
        d.y = 100;
      }
      else if (d.type == "dbserver" || d.type == "fileserver" || d.type == "cacheserver" || d.type == "indexserver") {
        d.y = 250;
      }
      else if (d.type == "slavedbserver") { d.y = 400; }
    });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }

  //var activate;
  var update = function() {
    // Apply the general update pattern to the nodes.
    nodeGroup = nodeGroup.data(nodes);
    nodeGroup.exit().remove();
    nodeGroup = nodeGroup.enter().append("g")
      .attr('class', 'node')
      //.attr("fill", function(d) { return color(d.id); })
      .attr("r", 8)
      .merge(nodeGroup);

    // Apply the general update pattern to the links.
    linkGroup = linkGroup.data(links);
    linkGroup.exit().remove();
    linkGroup = linkGroup.enter().append("line").merge(linkGroup);

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
/*
    var link = svg.append("g")
      .attr("class", "linkGroup1")
      .selectAll("line")
      //.data(links, function(d) { return d.source.id + "-" + d.target.id; })
      .data(links)
      .enter()
      .append("line")
      .attr("class", function(l) {
        classes = ["link"];
        if (l.target.type == "newrelic" || l.target.type=="codeserver") {
          classes.push("dashed");
        }
        return classes.join(" ");
      })
*/
    //console.log(nodeGroup);
      //Draw the nodes
      var node = d3.selectAll("g.node")
      //var node = nodeGroup.nodes().forEach( function(d,i) {
        .attr("class", function(d) { return "node " + d.type + " " + App.env; })
        .data(nodes, function(d) { return d.id;})
        .on("click", function(d) {
          if (d3.event.defaultPrevented) return; // ignore drag.
          nodeGroup.selectAll("g.node").attr("stroke", "#EFD01B");
          nodeGroup.selectAll("g.node").attr("background", "#FFF");
          nodeGroup.selectAll("g.node").attr("fill", "#FFF");
          nodeGroup.selectAll("g.node").attr("stroke-width", 0);
          if(selectedNode.id == d.id){
            //Unselect if selected node is already selected, duh!
            selectedNode = false;
            self._triggerEvent("node.unselected",d);
          }
          else {
            selectedNode = d;
            d3.select(this).attr("stroke", "#EFD01B");
            d3.select(this).attr("stroke-width", 4);
            d3.select(this).attr("background", "#FFF");
            d3.select(this).attr("fill", "#FFF");
            //d3.select(this).attr("class", "svgClass");
            self._triggerEvent("node.selected", d);
          }

          activate();//force.resume();//update();
          d3.event.stopPropagation();
        })
//      });

//      var nodeEnter = node.enter().insert("g")
//          .attr("class", function(d){ return "node " + d.type + " " + App.env; })
          //.call(force.drag);

      // Drop-shadow borrowed from https://jsfiddle.net/thatOneGuy/0nv4ck58/1/
      var circleShadow = d3.selectAll("g.node").append("circle")
          .attr("class", "nodeBlur")
          .attr("r", 30)
          .style("fill", 'black');

      var circle = d3.selectAll("g.node").append("circle")
          .attr("class", "bgCircle")
          .attr("r", r);

      d3.selectAll("g.node").append("circle")
          .attr("class", function(d){ return "server " + d.type; })
          .attr("r", r);

      d3.selectAll("g.node").append("image")
          .attr("xlink:href", function(d){ return "img/" + d.type + ".svg"; })
          .attr("class", "icon")
          .attr("x", -22).attr("y", -22)
          .attr("width", 44).attr("height", 44);

      // @todo. So much code repeatition! Gross! This can be made into a
      // func, but sloppy last-min fix was deployed here.
      if (App.env == 'elite' || App.env == 'elitemax') {
          var bigservers = ['fileserver', 'dbserver', 'slavedbserver'];
          bigservers.forEach(function(item, index, array) {
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .bgCircle").attr("r", 56);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .nodeBlur").attr("r", 53);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .server").attr("r", 56);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .icon").attr("width", 82).attr("height", 82).attr("x", -41).attr("y", -41);
          });
      }
      else if (App.env == 'performancexl') {
          var bigservers = ['fileserver', 'dbserver', 'slavedbserver'];
          bigservers.forEach(function(item, index, array) {
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .bgCircle").attr("r", 51);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .nodeBlur").attr("r", 48);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .server").attr("r", 51);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .icon").attr("width", 74).attr("height", 74).attr("x", -37).attr("y", -37);
          });
      }
      else if (App.env == 'performancelarge') {
          var bigservers = ['fileserver', 'dbserver', 'slavedbserver'];
          bigservers.forEach(function(item, index, array) {
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .bgCircle").attr("r", 46);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .nodeBlur").attr("r", 43);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .server").attr("r", 46);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .icon").attr("width", 64).attr("height", 64).attr("x", -32).attr("y", -32);
          });
      }
      else if (App.env == 'performancemedium') {
          var bigservers = ['fileserver', 'dbserver', 'slavedbserver'];
          bigservers.forEach(function(item, index, array) {
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .bgCircle").attr("r", 41);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .nodeBlur").attr("r", 38);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .server").attr("r", 41);
            nodeGroup.selectAll("g.node." + App.env + "." + item + " .icon").attr("width", 54).attr("height", 54).attr("x", -27).attr("y", -27);
          });
      }
  }

  //Activate Links and Nodes based on node selection - called be event handlerss.
  var activate = function() {
    //Highlight pertinent links
    //Sorry about the verbosity of this... I guess I am too tired to get this right without typing it out.
    var targetsOrSources = [];
    link.classed("active", function(d) {
      var active = false;
      if (d.target.id == selectedNode.id) {active = true; }
      if (d.source.id == selectedNode.id) {active = true; }
      if (active) {
        if (d.target.id != selectedNode.id) {
          targetsOrSources.push(d.target);
        }
        if (d.source.id != selectedNode.id) {
          targetsOrSources.push(d.source);
        }
      }
      return active;
    });
    node.classed("inactive", function(n) {
      //No selection, bail.
      if (!selectedNode) {
        return false;
      }
      if (targetsOrSources.indexOf(n) > -1) {
        return false;
      }
      if (n.id == selectedNode.id){
        return false;
      }
      return true;
    });
  }

  // Make it all go
  update();
}
