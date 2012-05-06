#-------------------
# Constants
#-------------------

BLACK = 'b'

RED = 'r'

KING = 'k'

WIDTH = 8

HEIGHT = 8


#-------------------
# Helpers
#-------------------
abs = Math.abs

color = (pos) -> if pos.x % 2 == pos.y % 2 then 'dark' else 'light'

team = (cell) -> (if cell[0] == RED then RED else BLACK) if cell?

isKing = (cell) -> cell[1] == KING if cell?

alternate = (team) -> if team == BLACK then RED else BLACK

copy = (board) -> ((cell for cell in row) for row in board)

concat = (xs) -> Array.prototype.concat.apply([], xs)

sum = (xs) -> _.reduce xs, ((a, b) -> a + b), 0

average = (xs) -> sum(xs) / xs.length

tail = (xs) -> xs.slice 1

max = (xs, key=((x) -> x)) ->
  return if xs.length == 0
  best = null
  for x in xs
    val = key x
    if (not best?) or (val > best.val)
      best = {x, val}
  best.x

cons = (val, seq) ->
  seq = seq.slice 0
  seq.unshift val
  seq

# Cartesian product
product = (args...) ->
  return [] if args.length == 0
  return ([x] for x in args[0]) if args.length == 1
  concat (cons(x, ys) for x in args[0] for ys in product.apply(@, tail(args)))

score = (player, board=game.board) ->
  _.filter(concat(board), (cell) -> team(cell) == player).length


#-------------------
# Core game logic
#-------------------
move = (board, start, dest) ->
  cell = board[start.y][start.x]
  [dx, dy] = [abs(dest.x - start.x), abs(dest.y - start.y)]
  validDirection = (isKing(cell)                               or
                    (team(cell) == RED   and dest.y < start.y) or
                    (team(cell) == BLACK and dest.y > start.y))
  return null if not (start.y >= 0                     and
                      dest.y  >= 0                     and
                      start.x >= 0                     and
                      dest.x  >= 0                     and
                      start.y <  HEIGHT                and
                      dest.y  <  HEIGHT                and
                      start.x <  WIDTH                 and
                      dest.x  <  WIDTH                 and
                      color(dest) == 'dark'            and
                      dx == dy                         and
                      dx < 3                           and
                      dy < 3                           and
                      not team(board[dest.y][dest.x])? and
                      validDirection)

  isJump = dx == 2 and dy == 2
  [jx, jy] = [(start.x + dest.x) / 2, (start.y + dest.y) / 2]
  return null if isJump and team(board[jy][jx]) != alternate(team(cell))

  shouldKing = (dest.y == (HEIGHT - 1) and team(cell) == BLACK) or
               (dest.y == 0            and team(cell) == RED  )
  cell = cell + KING if shouldKing and not isKing cell

  board = copy(board) # So we don't mutate the original board
  board[dest.y][dest.x] = cell
  board[start.y][start.x] = undefined
  board[jy][jx] = undefined if isJump
  board


#-------------------
# AI
#-------------------
ai_move = ->
  nextTurn max enumerateMoves(RED), (b) -> average outcomes b

heuristic = (board) ->
  score(RED, board) - score(BLACK, board)

outcomes = (board, player=BLACK, depth=3) ->
  return [heuristic(board)] if depth == 0
  moves = enumerateMoves player, board
  return [heuristic(board) * Math.pow(3, depth)] if moves.length == 0
  concat(outcomes(m, alternate(player), depth - 1) for m in moves)

# For every board position, try to move and jump in every direction.
enumerateMoves = (player, board=game.board) ->
  moves = []
  for [y, x] in product [0...HEIGHT], [0...WIDTH]
    if team(board[y][x]) == player
      for [d, i, j] in product [2, 1], [-1, 1], [-1, 1]
        m = move board, {y, x}, {y: y + (d * i), x: x + (d * j)}
        moves.push m if m?
  moves


#-------------------
# UI
#-------------------
select = (y, x) ->
  $('#board .dark').removeClass 'selected'
  return game.selection = null unless y? and x?
  game.selection = {y, x}
  $("#cell#{y}-#{x}").addClass 'selected'

makeBoardTable = ->
  table = "<table id='board' cellspacing='0' cellpadding='0'>"
  for y in [0...HEIGHT]
    table += "<tr>"
    for x in [0...WIDTH]
      table += "<td id='cell#{y}-#{x}' class='#{color({y, x})}'></td>"
    table += "</tr>"
  $(table + "</table>")

renderBoard = ->
  return unless game.board?
  for row, y in game.board
    for cell, x in row
      $cell = $ "#cell#{y}-#{x}"
      if cell?
        cls = if team(cell) == RED then 'red' else 'black'
        piece = if isKing(cell) then '&#x265B;' else '&#x25C9;'
        $cell.html "<span class='#{cls}'>#{piece}</span>"
      else
        $cell.empty()

renderScore = ->
  $('#blackScore').text score BLACK
  $('#redScore').text score RED

renderStatus = ->
  blackMoves = enumerateMoves BLACK
  redMoves = enumerateMoves RED
  if score(BLACK) == 0 or blackMoves.length == 0
    msg = "Red player wins!"
    cls = 'red'
  else if score(RED) == 0 or redMoves.length == 0
    msg = "Black player wins!"
    cls = 'black'
  else if game.player == RED
    msg = "Red player's turn (Thinking...)"
    cls = 'red'
  else if game.player == BLACK
    msg = "Black player's turn"
    cls = 'black'
  $('#notice').removeClass('red black').addClass(cls).text(msg)

render = ->
  renderBoard()
  renderScore()
  renderStatus()

nextTurn = (board) ->
  game.player = alternate game.player
  game.board = board
  select null, null
  render()
  _.defer(ai_move) if game.player == RED

bindClickHandlers = ->
  for row, y in game.board
    for cell, x in row
      do (y, x) ->
        $("#cell#{y}-#{x}").click ->
          if team(game.board[y][x]) == game.player
            select y, x
          else if game.selection?
            board = move game.board, game.selection, {y, x}
            nextTurn board if board?


#-------------------
# Initialization
#-------------------
initPlayer = (board, player) ->
  for [y, x] in product [0...3], [0...WIDTH]
    y = if player == RED then (HEIGHT - 1 - y) else y
    if color({y, x}) == 'dark'
      board[y][x] = player

initBoard = -> ((undefined for x in [0...WIDTH]) for y in [0...HEIGHT])

initGame = ->
  board = initBoard()
  initPlayer board, BLACK
  initPlayer board, RED
  {board: board, player: BLACK, selection: null}

game = initGame()

$ ->
  $('#board').replaceWith makeBoardTable()
  bindClickHandlers()
  render()
