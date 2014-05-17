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

  var Runner = React.createClass({
    getInitialState: function() {
      return this.init(this.props);
    },
    init: function(props) {
      return M.initialState(props.machine, props.tape);
    },
    reset: function() {
      this.setState(this.getInitialState());
    },
    step: function() {
      this.setState(M.nextState(this.props.machine, this.state));
    },
    componentWillReceiveProps: function(nextProps) {
      this.setState(this.init(nextProps));
    },
    render: function() {
      return (
        <div>
          <p>Current state: {this.state.state}</p>
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
      return {machine: undefined, tape: ''};
    },
    load: function(e) {
      e.preventDefault();
      var t = M.createTransition;
      var machine = eval(this.refs.machine.getDOMNode().value);
      this.setState({machine: machine, tape: this.refs.tape.getDOMNode().value});
    },
    render: function() {
      return (
        <div>
        <form onSubmit={this.load}>
          <input type="text" ref="tape" />
          <textarea ref="machine"></textarea>
          <input type="submit" value="Load" />
        </form>
        <div>
          {this.state.machine ? (<Runner machine={this.state.machine} tape={this.state.tape} />) : 'Machine not ready'}
        </div>
        </div>
      );
    }
  });

  var tape = React.renderComponent(
    <App />,
    document.getElementById('content')
  );
})(DFA);