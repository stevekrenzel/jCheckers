var BLACK, HEIGHT, KING, RED, WIDTH, abs, ai_move, alternate, average, bindClickHandlers, color, concat, cons, copy, enumerateMoves, game, heuristic, initBoard, initGame, initPlayer, isKing, makeBoardTable, max, move, nextTurn, outcomes, product, render, renderBoard, renderScore, renderStatus, score, select, sum, tail, team,
  __slice = Array.prototype.slice;

BLACK = 'b';

RED = 'r';

KING = 'k';

WIDTH = 8;

HEIGHT = 8;

abs = Math.abs;

color = function(pos) {
  if (pos.x % 2 === pos.y % 2) {
    return 'dark';
  } else {
    return 'light';
  }
};

team = function(cell) {
  if (cell != null) {
    if (cell[0] === RED) {
      return RED;
    } else {
      return BLACK;
    }
  }
};

isKing = function(cell) {
  if (cell != null) return cell[1] === KING;
};

alternate = function(team) {
  if (team === BLACK) {
    return RED;
  } else {
    return BLACK;
  }
};

copy = function(board) {
  var cell, row, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = board.length; _i < _len; _i++) {
    row = board[_i];
    _results.push((function() {
      var _j, _len2, _results2;
      _results2 = [];
      for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
        cell = row[_j];
        _results2.push(cell);
      }
      return _results2;
    })());
  }
  return _results;
};

concat = function(xs) {
  return Array.prototype.concat.apply([], xs);
};

sum = function(xs) {
  return _.reduce(xs, (function(a, b) {
    return a + b;
  }), 0);
};

average = function(xs) {
  return sum(xs) / xs.length;
};

tail = function(xs) {
  return xs.slice(1);
};

max = function(xs, key) {
  var best, val, x, _i, _len;
  if (key == null) {
    key = (function(x) {
      return x;
    });
  }
  if (xs.length === 0) return;
  best = null;
  for (_i = 0, _len = xs.length; _i < _len; _i++) {
    x = xs[_i];
    val = key(x);
    if ((!(best != null)) || (val > best.val)) {
      best = {
        x: x,
        val: val
      };
    }
  }
  return best.x;
};

cons = function(val, seq) {
  seq = seq.slice(0);
  seq.unshift(val);
  return seq;
};

product = function() {
  var args, x, ys;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (args.length === 0) return [];
  if (args.length === 1) {
    return (function() {
      var _i, _len, _ref, _results;
      _ref = args[0];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        _results.push([x]);
      }
      return _results;
    })();
  }
  return concat((function() {
    var _i, _len, _ref, _results;
    _ref = product.apply(this, tail(args));
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ys = _ref[_i];
      _results.push((function() {
        var _j, _len2, _ref2, _results2;
        _ref2 = args[0];
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          x = _ref2[_j];
          _results2.push(cons(x, ys));
        }
        return _results2;
      })());
    }
    return _results;
  }).call(this));
};

score = function(player, board) {
  if (board == null) board = game.board;
  return _.filter(concat(board), function(cell) {
    return team(cell) === player;
  }).length;
};

move = function(board, start, dest) {
  var cell, dx, dy, isJump, jx, jy, shouldKing, validDirection, _ref, _ref2;
  cell = board[start.y][start.x];
  _ref = [abs(dest.x - start.x), abs(dest.y - start.y)], dx = _ref[0], dy = _ref[1];
  validDirection = isKing(cell) || (team(cell) === RED && dest.y < start.y) || (team(cell) === BLACK && dest.y > start.y);
  if (!(start.y >= 0 && dest.y >= 0 && start.x >= 0 && dest.x >= 0 && start.y < HEIGHT && dest.y < HEIGHT && start.x < WIDTH && dest.x < WIDTH && color(dest) === 'dark' && dx === dy && dx < 3 && dy < 3 && !(team(board[dest.y][dest.x]) != null) && validDirection)) {
    return null;
  }
  isJump = dx === 2 && dy === 2;
  _ref2 = [(start.x + dest.x) / 2, (start.y + dest.y) / 2], jx = _ref2[0], jy = _ref2[1];
  if (isJump && team(board[jy][jx]) !== alternate(team(cell))) return null;
  shouldKing = (dest.y === (HEIGHT - 1) && team(cell) === BLACK) || (dest.y === 0 && team(cell) === RED);
  if (shouldKing && !isKing(cell)) cell = cell + KING;
  board = copy(board);
  board[dest.y][dest.x] = cell;
  board[start.y][start.x] = void 0;
  if (isJump) board[jy][jx] = void 0;
  return board;
};

ai_move = function() {
  return nextTurn(max(enumerateMoves(RED), function(b) {
    return average(outcomes(b));
  }));
};

heuristic = function(board) {
  return score(RED, board) - score(BLACK, board);
};

outcomes = function(board, player, depth) {
  var m, moves;
  if (player == null) player = BLACK;
  if (depth == null) depth = 3;
  if (depth === 0) return [heuristic(board)];
  moves = enumerateMoves(player, board);
  if (moves.length === 0) return [heuristic(board) * Math.pow(3, depth)];
  return concat((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = moves.length; _i < _len; _i++) {
      m = moves[_i];
      _results.push(outcomes(m, alternate(player), depth - 1));
    }
    return _results;
  })());
};

enumerateMoves = function(player, board) {
  var d, i, j, m, moves, x, y, _i, _j, _k, _l, _len, _len2, _ref, _ref2, _ref3, _ref4, _results, _results2;
  if (board == null) board = game.board;
  moves = [];
  _ref = product((function() {
    _results = [];
    for (var _j = 0; 0 <= HEIGHT ? _j < HEIGHT : _j > HEIGHT; 0 <= HEIGHT ? _j++ : _j--){ _results.push(_j); }
    return _results;
  }).apply(this), (function() {
    _results2 = [];
    for (var _k = 0; 0 <= WIDTH ? _k < WIDTH : _k > WIDTH; 0 <= WIDTH ? _k++ : _k--){ _results2.push(_k); }
    return _results2;
  }).apply(this));
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    _ref2 = _ref[_i], y = _ref2[0], x = _ref2[1];
    if (team(board[y][x]) === player) {
      _ref3 = product([2, 1], [-1, 1], [-1, 1]);
      for (_l = 0, _len2 = _ref3.length; _l < _len2; _l++) {
        _ref4 = _ref3[_l], d = _ref4[0], i = _ref4[1], j = _ref4[2];
        m = move(board, {
          y: y,
          x: x
        }, {
          y: y + (d * i),
          x: x + (d * j)
        });
        if (m != null) moves.push(m);
      }
    }
  }
  return moves;
};

select = function(y, x) {
  $('#board .dark').removeClass('selected');
  if (!((y != null) && (x != null))) return game.selection = null;
  game.selection = {
    y: y,
    x: x
  };
  return $("#cell" + y + "-" + x).addClass('selected');
};

makeBoardTable = function() {
  var table, x, y;
  table = "<table id='board' cellspacing='0' cellpadding='0'>";
  for (y = 0; 0 <= HEIGHT ? y < HEIGHT : y > HEIGHT; 0 <= HEIGHT ? y++ : y--) {
    table += "<tr>";
    for (x = 0; 0 <= WIDTH ? x < WIDTH : x > WIDTH; 0 <= WIDTH ? x++ : x--) {
      table += "<td id='cell" + y + "-" + x + "' class='" + (color({
        y: y,
        x: x
      })) + "'></td>";
    }
    table += "</tr>";
  }
  return $(table + "</table>");
};

renderBoard = function() {
  var $cell, cell, cls, piece, row, x, y, _len, _ref, _results;
  if (game.board == null) return;
  _ref = game.board;
  _results = [];
  for (y = 0, _len = _ref.length; y < _len; y++) {
    row = _ref[y];
    _results.push((function() {
      var _len2, _results2;
      _results2 = [];
      for (x = 0, _len2 = row.length; x < _len2; x++) {
        cell = row[x];
        $cell = $("#cell" + y + "-" + x);
        if (cell != null) {
          cls = team(cell) === RED ? 'red' : 'black';
          piece = isKing(cell) ? '&#x265B;' : '&#x25C9;';
          _results2.push($cell.html("<span class='" + cls + "'>" + piece + "</span>"));
        } else {
          _results2.push($cell.empty());
        }
      }
      return _results2;
    })());
  }
  return _results;
};

renderScore = function() {
  $('#blackScore').text(score(BLACK));
  return $('#redScore').text(score(RED));
};

renderStatus = function() {
  var blackMoves, cls, msg, redMoves;
  blackMoves = enumerateMoves(BLACK);
  redMoves = enumerateMoves(RED);
  if (score(BLACK) === 0 || blackMoves.length === 0) {
    msg = "Red player wins!";
    cls = 'red';
  } else if (score(RED) === 0 || redMoves.length === 0) {
    msg = "Black player wins!";
    cls = 'black';
  } else if (game.player === RED) {
    msg = "Red player's turn (Thinking...)";
    cls = 'red';
  } else if (game.player === BLACK) {
    msg = "Black player's turn";
    cls = 'black';
  }
  return $('#notice').removeClass('red black').addClass(cls).text(msg);
};

render = function() {
  renderBoard();
  renderScore();
  return renderStatus();
};

nextTurn = function(board) {
  game.player = alternate(game.player);
  game.board = board;
  select(null, null);
  render();
  if (game.player === RED) return _.defer(ai_move);
};

bindClickHandlers = function() {
  var cell, row, x, y, _len, _ref, _results;
  _ref = game.board;
  _results = [];
  for (y = 0, _len = _ref.length; y < _len; y++) {
    row = _ref[y];
    _results.push((function() {
      var _len2, _results2;
      _results2 = [];
      for (x = 0, _len2 = row.length; x < _len2; x++) {
        cell = row[x];
        _results2.push((function(y, x) {
          return $("#cell" + y + "-" + x).click(function() {
            var board;
            if (team(game.board[y][x]) === game.player) {
              return select(y, x);
            } else if (game.selection != null) {
              board = move(game.board, game.selection, {
                y: y,
                x: x
              });
              if (board != null) return nextTurn(board);
            }
          });
        })(y, x));
      }
      return _results2;
    })());
  }
  return _results;
};

initPlayer = function(board, player) {
  var x, y, _i, _j, _len, _ref, _ref2, _results, _results2;
  _ref = product([0, 1, 2], (function() {
    _results2 = [];
    for (var _j = 0; 0 <= WIDTH ? _j < WIDTH : _j > WIDTH; 0 <= WIDTH ? _j++ : _j--){ _results2.push(_j); }
    return _results2;
  }).apply(this));
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    _ref2 = _ref[_i], y = _ref2[0], x = _ref2[1];
    y = player === RED ? HEIGHT - 1 - y : y;
    if (color({
      y: y,
      x: x
    }) === 'dark') {
      _results.push(board[y][x] = player);
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

initBoard = function() {
  var x, y, _results;
  _results = [];
  for (y = 0; 0 <= HEIGHT ? y < HEIGHT : y > HEIGHT; 0 <= HEIGHT ? y++ : y--) {
    _results.push((function() {
      var _results2;
      _results2 = [];
      for (x = 0; 0 <= WIDTH ? x < WIDTH : x > WIDTH; 0 <= WIDTH ? x++ : x--) {
        _results2.push(void 0);
      }
      return _results2;
    })());
  }
  return _results;
};

initGame = function() {
  var board;
  board = initBoard();
  initPlayer(board, BLACK);
  initPlayer(board, RED);
  return {
    board: board,
    player: BLACK,
    selection: null
  };
};

game = initGame();

$(function() {
  $('#board').replaceWith(makeBoardTable());
  bindClickHandlers();
  return render();
});
