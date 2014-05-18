var Machine = {
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
      states: [ machine.initialState ],
      tape: tape,
      index: 0,
      transitions: [],
      done: done,
      final: done && _.contains(machine.finalStates, machine.initialState)
    };
  },

  getTransitions: function(machine, state, input) {
    return _.where(machine.transitions, {
      from: state,
      input: input
    });
  },

  nextDescription: function(machine, description) {
    var input = description.tape.charAt(description.index);
    var transitions = _.chain(description.states)
      .map(function(state) {
        return Machine.getTransitions(machine, state, input);
      })
      .flatten()
      .value();

    if(_.isEmpty(transitions)) {
      var val = _.clone(description);
      val.done = true;
      return val;
    }
    else {
      var newStates = _.pluck(transitions, 'to');
      var newIndex = description.index + 1;
      var done = description.tape.length == newIndex;
      var final = done && !_.chain(machine.finalStates).intersection(newStates).isEmpty().value();
      return {
        states: newStates,
        tape: description.tape,
        index: newIndex,
        transitions: transitions,
        done: done,
        final: final
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
    machine.states.forEach(function(s) {
      var classes = {
        final: _.contains(machine.finalStates, s),
        current: _.contains(state.states, s)
      };
      g.addNode(s, { label: s, classes: classes});
    });
    machine.transitions.forEach(function(t) {
      var classes = {
        current: _.contains(state.transitions, t)
      };
      g.addEdge(t.from+'-'+t.input+'-'+t.to, t.from, t.to, { label: t.input, classes: classes });
    });
    return g;
  }
};
