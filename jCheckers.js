// This I cribbed from http://javascript.crockford.com/prototypal.html, which is apparently how things work in this world.
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

// Initialize the players.
var players = [ Object.create({}), Object.create({}) ];
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
				boardElement += "<span class=\"piece_" + rowSquare.piece.player.color + "\">&#x25C9;</span>";
			}
			boardElement += "</td>";
		});
		boardElement += "</tr>";
	});
	boardElement += "</table>";
	return boardElement;
}

// Initialize the pieces. (I'll clean this up later.)
_.times(3, function(i) {
	_.times(board.rows[i].length, function(ii) {
		if (board.rows[i][ii].color == 'dark') {
			board.rows[i][ii].piece = Object.create({});
			board.rows[i][ii].piece.player = players[0];
		}
		var redmodifier = 5;
		if (board.rows[i+redmodifier][ii].color == 'dark') {
			board.rows[i+redmodifier][ii].piece = Object.create({});
			board.rows[i+redmodifier][ii].piece.player = players[1];
		}
	});
});

// Initialize the scoreboard.
var scoreboard = { };
scoreboard.draw = function() {
	return "";
}