// This I pasted from http://javascript.crockford.com/prototypal.html, which is apparently how things work in this world.
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		function F() {}
		F.prototype = o;
		return new F();
	};
}

function reverseColor(thisColor) {
	if (thisColor == 'light') {
		return 'dark';
	} else {
		return 'light';
	}
}

var player = {
	piecesCount: function () {
		_.filter(pieces, function (piece) {
			piece.player == this;
		}).length;
	}
}

var square = {
	htmlId: function () {
		return "square-" + this.yCoordinate + "-" + this.xCoordinate;
	},

	canMoveTo: function (otherSquare) {
		if (otherSquare.color == 'light') {
			return false;
		}
		if (typeof otherSquare.piece !== 'undefined') {
			return false;
		}
		if (Math.abs(otherSquare.xCoordinate - this.xCoordinate) == 1) {
			if (Math.abs(otherSquare.yCoordinate - this.yCoordinate) == 1) {
				return true;
			}
		}
		return false;
	}
};

// Initialize the players.
var players = [ Object.create(player), Object.create(player) ];
players[0].color = 'black';
players[1].color = 'red';

var turn = {
	draw: function () {
		return "<div id=\"notice\">" + this.player.color + " player's move.</div>";
	},

	selectSquare: function (newSquare) {
		if (typeof this.selectedSquare !== 'undefined') {
			$("#" + this.selectedSquare.htmlId()).addClass('dark');
			$("#" + this.selectedSquare.htmlId()).removeClass('selected');
		}
		this.selectedSquare = newSquare;
		$("#" + newSquare.htmlId()).removeClass('dark');
		$("#" + newSquare.htmlId()).addClass('selected');
	}
}

// Initialize the board.
var board = { };
var thisColor = 'light';
board.rows = [ ];
_.times(8, function (i) {
	thisColor = reverseColor(thisColor);
	board.rows[i] = [ ];
	_.times(8, function (ii) {
		thisColor = reverseColor(thisColor);
		board.rows[i][ii] = Object.create(square);
		board.rows[i][ii].color = thisColor;
		board.rows[i][ii].xCoordinate = ii;
		board.rows[i][ii].yCoordinate =  i;
	});
});

board.draw = function () {
	var boardElement = "<table id=\"board\" cellspacing=\"0\" cellpadding=\"0\">";
	_.each(this.rows, function (row) {
		boardElement += "<tr>";
		_.each(row, function (rowSquare) {
			boardElement += "<td id=\"" + rowSquare.htmlId() + "\" class=\"" + rowSquare.color + "\">";
			if (typeof rowSquare.piece !== "undefined") {
				boardElement += "<span class=\"" + rowSquare.piece.player.color + "\">&#x25C9;</span>";
			}
			boardElement += "</td>";
		});
		boardElement += "</tr>";
	});
	boardElement += "</table>";
	return boardElement;
}

board.initClickEvents = function () {
	_.each(this.rows, function (row) {
		_.each(row, function (rowSquare) {
			$("#"+rowSquare.htmlId()).click(function () {
				if (typeof rowSquare.piece !== "undefined") {
					if (rowSquare.piece.player == currentTurn.player) {
						currentTurn.selectSquare(rowSquare);
					}
				} else {
					if (typeof currentTurn.selectedSquare !== "undefined") {
						if (currentTurn.selectedSquare.canMoveTo(rowSquare) == true) {
							rowSquare.piece = currentTurn.selectedSquare.piece;
							currentTurn.selectedSquare.piece = undefined;
							$('#board').replaceWith(board.draw());
						}
					}
				}
			});
		});
	});
}

// Initialize the pieces. (I'll clean this up later.)
var pieces = [];
_.times(3, function (i) {
	_.times(board.rows[i].length, function(ii) {
		if (board.rows[i][ii].color == 'dark') {
			board.rows[i][ii].piece = Object.create({});
			board.rows[i][ii].piece.player = players[0];
			pieces.push(board.rows[i][ii].piece);
		}
		var redmodifier = 5;
		if (board.rows[i+redmodifier][ii].color == 'dark') {
			board.rows[i+redmodifier][ii].piece = Object.create({});
			board.rows[i+redmodifier][ii].piece.player = players[1];
			pieces.push(board.rows[i+redmodifier][ii].piece);
		}
	});
});

// Initialize the scoreboard.
var scoreboard = { };
scoreboard.draw = function () {
	var scoreboardElement = "<table id=\"scoreboard\" cellspacing=\"1\" cellpadding=\"0\">";
	scoreboardElement += "<tr>";
	scoreboardElement += "<th>Player</th>";
	scoreboardElement += "<th>Pieces</th>";
	scoreboardElement += "</tr>";
	scoreboardElement += "<tr>";
	scoreboardElement += "<td class=\"black\">Black</td>";
	scoreboardElement += "<td>12</td>";
	scoreboardElement += "</tr>";
	scoreboardElement += "<tr>";
	scoreboardElement += "<td class=\"red\">Red</td>";
	scoreboardElement += "<td>12</td>";
	scoreboardElement += "</tr>";
	scoreboardElement += "</table>";

	return scoreboardElement;
}

currentTurn = Object.create(turn);
currentTurn.player = players[0];