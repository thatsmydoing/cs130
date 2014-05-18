var DFA = {
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

  initialState: function(dfa, tape) {
    var done = tape.length == 0;
    return {
      state: dfa.initialState,
      tape: tape,
      index: 0,
      transition: null,
      done: done,
      final: done && _.contains(dfa.finalStates, dfa.initialState)
    };
  },

  getTransition: function(dfa, state) {
    return _.findWhere(dfa.transitions, {
      from: state.state,
      input: state.tape.charAt(state.index)
    });
  },

  nextState: function(dfa, state) {
    var transition = DFA.getTransition(dfa, state);
    if(transition === undefined) {
      var val = _.clone(state);
      val.done = true;
      return val;
    }
    else {
      var newState = transition.to;
      var newIndex = state.index + 1;
      var done = state.tape.length == newIndex;
      var final = done && _.contains(dfa.finalStates, newState);
      return {
        state: newState,
        tape: state.tape,
        index: newIndex,
        transition: transition,
        done: done,
        final: final
      };
    }
  },

  MAX_ITERATIONS: 10000,

  run: function(dfa, tape) {
    var history = [];
    var count = 0;
    var state = DFA.initialState(dfa, tape);
    while(state !== undefined) {
      history.push(state);
      state = DFA.nextState(dfa, state);

      if(++count >= DFA.MAX_ITERATIONS) {
        state.broken = true;
        break;
      }
    }
    return history;
  },

  accept: function(dfa, tape) {
    var states = DFA.run(dfa, tape);
    if(states.length > 0) {
      return _.last(states).final;
    }
    else {
      return false;
    }
  },

  toGraph: function(dfa, state) {
    var g = new dagreD3.Digraph();
    dfa.states.forEach(function(s) {
      var classes = {
        final: _.contains(dfa.finalStates, s),
        current: s == state.state
      };
      g.addNode(s, { label: s, classes: classes});
    });
    dfa.transitions.forEach(function(t) {
      var classes = {
        current: t == state.transition
      };
      g.addEdge(t.from+'-'+t.input+'-'+t.to, t.from, t.to, { label: t.input, classes: classes });
    });
    return g;
  }
};
