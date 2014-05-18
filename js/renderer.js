var GraphRenderer = (function() {
  /* copied and modified from dagre-d3 */
  function isComposite(g, u) {
    return 'children' in g && g.children(u).length;
  }

  function addTextLabel(label, root, labelCols, labelCut) {
    if (labelCut === undefined) labelCut = "false";
    labelCut = (labelCut.toString().toLowerCase() === "true");

    var node = root
      .append('text')
      .attr('text-anchor', 'left');

    node
      .append('tspan')
      .attr('dy', '1em')
      .attr('x', '1')
      .text(label);
  }

  function addLabel(node, root, marginX, marginY) {
    // Add the circle first so that it appears behind the label
    var label = node.label;
    var circle = root.append('circle');
    var labelSvg = root.append('g');

    addTextLabel(label,
                 labelSvg,
                 Math.floor(node.labelCols),
                 node.labelCut);

    var bbox = root.node().getBBox();

    labelSvg.attr('transform',
               'translate(' + (-bbox.width / 2) + ',' + (-bbox.height / 2) + ')');

    var radius = Math.max(bbox.width + 2 * marginX, bbox.height + 2 * marginY) / 2;

    circle
      .attr('r', radius)
      .attr('cx', 0)
      .attr('cy', 0);
  }

  function defaultDrawNodes(g, root) {
    var nodes = g.nodes().filter(function(u) { return !isComposite(g, u); });

    var svgNodes = root
      .selectAll('g.node')
      .classed('enter', false)
      .data(nodes, function(u) { return u; });

    svgNodes.selectAll('*').remove();

    svgNodes
      .enter()
        .append('g')
          .style('opacity', 0)
          .attr('class', 'node enter');

    svgNodes.each(function(u) { addLabel(g.node(u), d3.select(this), 10, 10); });

    // add styling
    svgNodes.each(function(u) { d3.select(this).classed(g.node(u).classes); });

    this._transition(svgNodes.exit())
        .style('opacity', 0)
        .remove();

    return svgNodes;
  }
  /* end copy */

  return function() {
    var renderer = new dagreD3.Renderer();
    // use circles for nodes
    renderer.drawNodes(defaultDrawNodes);
    // add styling
    var oldDrawEdgePaths = renderer.drawEdgePaths();
    renderer.drawEdgePaths(function(graph, root) {
      var svgEdgePaths = oldDrawEdgePaths(graph, root);
      svgEdgePaths.each(function(u) { d3.select(this).classed(graph.edge(u).classes); });
      return svgEdgePaths;
    });
    return renderer;
  }
})();
