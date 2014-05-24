var Machine = {
  EPSILON_CHAR: '~',

  create: function(initialState, finalStates, transitions) {
    var alphabet = _.chain(transitions).pluck('input').uniq().value();
    var states = [initialState].concat(finalStates);
    states = states.concat(_.chain(transitions).map(function(t) { return [t.from, t.to] }).flatten().value());
    states = _.uniq(states);
    return {
      alphabet: alphabet,
      states: states,
      initialState: initialState,
      finalStates: finalStates,
      transitions: transitions
    };
  },

  createTransition: function(from, input, to) {
    return {
      from: from,
      input: input,
      to: to
    };
  },

  initialDescription: function(machine, tape) {
    var done = tape.length == 0;
    return {
      tape: tape,
      index: 0,
      done: done,
      final: done && _.contains(machine.finalStates, machine.initialState),
      states: [
        { state: machine.initialState, transition: null }
      ]
    };
  },

  getTransitions: function(machine, state, input) {
    return _.filter(machine.transitions, function(t) {
      return t.from == state && (t.input == Machine.EPSILON_CHAR || t.input == input);
    });
  },

  nextDescription: function(machine, description) {
    var input = description.tape.charAt(description.index);
    var newStates = _.chain(description.states)
      .map(function(state) {
        return Machine.getTransitions(machine, state.state, input).map(function(t) {
          return {
            state: t.to,
            transition: t
          };
        });
      })
      .flatten()
      .value();

    if(_.isEmpty(newStates)) {
      var val = _.clone(description);
      val.done = true;
      return val;
    }
    else {
      var newIndex = description.index + 1;
      var done = description.tape.length == newIndex;
      var final = done && !_.chain(machine.finalStates).intersection(_.pluck(newStates, 'state')).isEmpty().value();
      return {
        tape: description.tape,
        index: newIndex,
        done: done,
        final: final,
        states: newStates
      };
    }
  },

  MAX_ITERATIONS: 10000,

  run: function(machine, tape) {
    var history = [];
    var count = 0;
    var state = Machine.initialDescription(machine, tape);
    while(state !== undefined) {
      history.push(state);
      state = Machine.nextDescription(machine, state);

      if(++count >= Machine.MAX_ITERATIONS) {
        state.broken = true;
        break;
      }
    }
    return history;
  },

  accept: function(machine, tape) {
    var states = Machine.run(machine, tape);
    if(states.length > 0) {
      return _.last(states).final;
    }
    else {
      return false;
    }
  },

  toGraph: function(machine, state) {
    var g = new dagreD3.Digraph();
    var currentStates = _.chain(state.states).pluck('state');
    var currentTransitions = _.chain(state.states).pluck('transition');
    machine.states.forEach(function(s) {
      var classes = {
        final: _.contains(machine.finalStates, s),
        current: currentStates.contains(s).value()
      };
      g.addNode(s, { label: s, classes: classes});
    });
    machine.transitions.forEach(function(t) {
      var label = t.input;
      if(label == Machine.EPSILON_CHAR) {
        label = "\u03B5";
      }
      var classes = {
        current: currentTransitions.contains(t).value()
      };
      g.addEdge(t.from+'-'+t.input+'-'+t.to, t.from, t.to, { label: label, classes: classes });
    });
    return g;
  }
};
