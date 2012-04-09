// This I cribbed from http://javascript.crockford.com/prototypal.html, which is apparently how things work in this world.
// And yeah, it seems dumb to be calling Object.create({}) all over the place. I'm assuming those'll end up being genuine classes.
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

// Initialize the players.
var players = [ Object.create(player), Object.create(player) ];
players[0].color = 'black';
players[1].color = 'red';

// Initialize the board.
var board = { };
var thisColor = 'light';
board.rows = [ ];
_.times(8, function(i) {
	thisColor = reverseColor(thisColor);
	board.rows[i] = [ ];
	_.times(8, function(ii) {
		thisColor = reverseColor(thisColor);
		board.rows[i][ii] = Object.create({});
		board.rows[i][ii].color = thisColor;
	});
});

board.draw = function() {
	var boardElement = "<table id=\"board\" cellspacing=\"0\" cellpadding=\"0\">";
	_.each(board.rows, function(row) {
		boardElement += "<tr>";
		_.each(row, function(rowSquare) {
			boardElement += "<td class=\"" + rowSquare.color + "\">";
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

// Initialize the pieces. (I'll clean this up later.)
var pieces = [];
_.times(3, function(i) {
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
scoreboard.draw = function() {
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