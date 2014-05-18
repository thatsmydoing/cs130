/** @jsx React.DOM */
(function(M) {
  var Cell = React.createClass({
    render: function() {
      return <pre className={'cell'+(this.props.selected ? ' selected' : '')}>{this.props.children}</pre>
    }
  });

  var Tape = React.createClass({
    render: function() {
      var self = this;
      var children = this.props.children.split("").map(function(c, index) {
        return <Cell selected={index == self.props.selected} key={index}>{c}</Cell>
      });
      return <div>{children}</div>
    }
  });

  var Graph = React.createClass({
    componentDidMount: function() {
      this.renderer = new GraphRenderer();
      var g = M.toGraph(this.props.machine, this.props.description);
      this.drawGraph(g);
    },
    componentWillReceiveProps: function(nextProps) {
      var g = M.toGraph(nextProps.machine, nextProps.description);
      this.drawGraph(g);
    },
    drawGraph: function(g) {
      var layout = this.renderer.run(g, d3.select(this.refs.canvas.getDOMNode()));
      d3.select(this.getDOMNode())
        .attr("width", layout.graph().width + 40)
        .attr("height", layout.graph().height + 40);
    },
    render: function() {
      return (
        <svg width="20" height="20">
          <g transform="translate(20, 20)" ref="canvas" />
        </svg>
      );
    }
  });

  var Runner = React.createClass({
    getInitialState: function() {
      return this.init(this.props);
    },
    init: function(props) {
      return M.initialDescription(props.machine, props.tape);
    },
    reset: function() {
      this.setState(this.getInitialState());
    },
    step: function() {
      this.setState(M.nextDescription(this.props.machine, this.state));
    },
    componentWillReceiveProps: function(nextProps) {
      this.setState(this.init(nextProps));
    },
    render: function() {
      return (
        <div>
          <Graph machine={this.props.machine} description={this.state} />
          {this.state.done ?
            <p>{this.state.final ? 'Accepted!' : 'Not accepted.'}</p>
          : ''}
          <Tape selected={this.state.index}>{this.state.tape}</Tape>
          <button disabled={this.state.done} onClick={this.step}>Step</button>
          <button onClick={this.reset}>Reset</button>
        </div>
      );
    }
  });

  var App = React.createClass({
    getInitialState: function() {
      var t = M.createTransition;
      var definition = "Machine.create('q1', ['q2'], [\n"+
        "t('q1', '0', 'q2'),\n"+
        "t('q1', '1', 'q2'),\n"+
        "t('q1', '0', 'q3'),\n"+
        "t('q2', '1', 'q3'),\n"+
        "t('q3', '0', 'q1')\n"+
        "]);";

      var machine = eval(definition);
      return {definition: definition, machine: machine, tape: '0100001'};
    },
    load: function(e) {
      e.preventDefault();
      var t = M.createTransition;
      var definition = this.refs.machine.getDOMNode().value;
      var machine = eval(definition);
      this.setState({machine: machine, tape: this.refs.tape.getDOMNode().value});
    },
    render: function() {
      return (
        <div>
        <form onSubmit={this.load}>
          <input type="text" ref="tape" defaultValue={this.state.tape} />
          <textarea ref="machine">{this.state.definition}</textarea>
          <input type="submit" value="Load" />
        </form>
        {this.state.machine ? (
          <div>
          <Runner machine={this.state.machine} tape={this.state.tape} />
          </div>
        ) : 'Machine not ready'}
        </div>
      );
    }
  });

  var tape = React.renderComponent(
    <App />,
    document.getElementById('content')
  );
})(Machine);
