var Parser = (function(Machine) {
  var seq = Parsimmon.seq;
  var regex = Parsimmon.regex;
  var string = Parsimmon.string;
  var optWhitespace = Parsimmon.optWhitespace;
  var lazy = Parsimmon.lazy;

  function lexeme(p) { return p.skip(optWhitespace); }
  function literal(l) { return lexeme(string(l)); }
  function assignTo(l) {
    return literal(l).then(literal('='));
  }

  var lparen = literal('(');
  var rparen = literal(')');
  var lbrace = literal('{');
  var rbrace = literal('}');
  var arrow = literal('->');
  var comma = literal(',');

  var id = lexeme(regex(/[a-z_]\w*/i));
  var epsilon = literal(Machine.EPSILON_CHAR);
  var symbol = lexeme(regex(/\w/)).or(epsilon);

  var idSet = lbrace.then(id.skip(comma.atMost(1)).many()).skip(rbrace);
  var idPlus = id.map(function(res) { return [res]; }).or(idSet);

  var transition = seq(id.skip(comma), symbol.skip(arrow), idPlus).map(function(result) {
    return result[2].map(function(to) {
      return {
        from: result[0],
        input: result[1],
        to: to
      };
    });
  });

  return seq(
    assignTo('S').then(id),
    assignTo('F').then(idPlus),
    assignTo('T').then(lbrace).then(transition.many()).skip(rbrace)
  ).map(function(result) {
    return Machine.create(result[0], result[1], _.flatten(result[2]));
  });
})(Machine);
