// This I pasted from http://javascript.crockford.com/prototypal.html, which is apparently how things work in this world.
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		function F() {}
		F.prototype = o;
		return new F();
	};
}

// CLASSES I MEAN UM PROTOTYPES

var player = {
	piecesCount: function () {
		// This seems to be some kind of esoteric JS shit. What is 'this' in each context?
		var thisPlayer = this;
		return _.filter(pieces, function (piece) {
			if (piece.player == thisPlayer) {
				return piece;
			}
		}).length;
	}
}

var square = {
	htmlId: function () {
		return "square-" + this.yCoordinate + "-" + this.xCoordinate;
	},

	color: function () {
		if ((this.yCoordinate % 2) == 0) {
			if ((this.xCoordinate % 2) == 0) {
				return 'dark';
			}
		} else {
			if ((this.xCoordinate % 2) != 0) {
				return 'dark';
			}
		}
		return 'light';
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
	},

	movePieceTo: function (newSquare) {
		newSquare.piece = this.piece;
		this.piece = undefined;
	},

	canJumpTo: function (otherSquare) {
		if (otherSquare.color == 'light') {
			return false;
		}
		if (typeof otherSquare.piece !== 'undefined') {
			return false;
		}
		if (Math.abs(otherSquare.xCoordinate - this.xCoordinate) == 2) {
			if (Math.abs(otherSquare.yCoordinate - this.yCoordinate) == 2) {
				// This is a jumpable square.
				if (typeof this.jumpSquare(otherSquare).piece !== 'undefined') {
					if (this.jumpSquare(otherSquare).piece.player != this.piece.player) {
						return true;
					}
				}
			}
		}
		return false;
	},

	jumpSquare: function (otherSquare) {
		var xShift, yShift;
		if (otherSquare.xCoordinate < this.xCoordinate) {
			xShift = -1;
		} else {
			xShift = 1;
		}
		if (otherSquare.yCoordinate < this.yCoordinate) {
			yShift = -1;
		} else {
			yShift = 1;
		}
		console.log("x: " + xShift);
		console.log("y: " + yShift);
		return board.rows[this.yCoordinate + yShift][this.xCoordinate + xShift];
	},

	jumpPieceTo: function (otherSquare) {
		otherSquare.piece = this.piece;
		this.piece = undefined;
		pieces.removePiece(this.jumpSquare(otherSquare).piece);
		this.jumpSquare(otherSquare).piece = undefined;
	}
};

var turn = {
	draw: function () {
		var msg, playerColor;
		if (players[0].piecesCount() == 0) {
			playerColor = players[1].color;
			msg = players[1].color + " player has won!";
		} else if (players[1].piecesCount() == 0) {
			playerColor = players[0].color;
			msg = players[0].color + " player has won!";
		} else {
			playerColor = this.player.color;
			msg = this.player.color + " player's move.";
		}
		$('#notice').replaceWith("<div id=\"notice\" class=\"" + playerColor + "\">" + msg + "</div>");
		board.draw();
		scoreboard.draw();
	},

	selectSquare: function (newSquare) {
		if (typeof this.selectedSquare !== 'undefined') {
			$("#" + this.selectedSquare.htmlId()).addClass('dark');
			$("#" + this.selectedSquare.htmlId()).removeClass('selected');
		}
		this.selectedSquare = newSquare;
		$("#" + newSquare.htmlId()).removeClass('dark');
		$("#" + newSquare.htmlId()).addClass('selected');
	},

	nextPlayer: function () {
		// I don't think we need to account for a world with more than two players.
		if (this.player == players[0]) {
			return players[1];
		} else {
			return players[0];
		}
	}
}

// DOING THE SHITS

// Initialize the players.
var players = [ Object.create(player), Object.create(player) ];
players[0].color = 'black';
players[1].color = 'red';

// Initialize the board.
var board = { };
board.rows = [ ];
_.times(8, function (i) {
	board.rows[i] = [ ];
	_.times(8, function (ii) {
		board.rows[i][ii] = Object.create(square);
		board.rows[i][ii].xCoordinate = ii;
		board.rows[i][ii].yCoordinate =  i;
	});
});

board.draw = function () {
	var boardElement = "<table id=\"board\" cellspacing=\"0\" cellpadding=\"0\">";
	_.each(this.rows, function (row) {
		boardElement += "<tr>";
		_.each(row, function (rowSquare) {
			boardElement += "<td id=\"" + rowSquare.htmlId() + "\" class=\"" + rowSquare.color() + "\">";
			if (typeof rowSquare.piece !== "undefined") {
				boardElement += "<span class=\"" + rowSquare.piece.player.color + "\">&#x25C9;</span>";
			}
			boardElement += "</td>";
		});
		boardElement += "</tr>";
	});
	boardElement += "</table>";
	$('#board').replaceWith(boardElement);
	if ((players[0].piecesCount() != 0) && (players[1].piecesCount != 0)) {
		this.initClickEvents();
	}
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
							currentTurn.selectedSquare.movePieceTo(rowSquare);
							newTurn = Object.create(turn);
							newTurn.player = currentTurn.nextPlayer();
							currentTurn = newTurn;
							currentTurn.draw();
						} else if (currentTurn.selectedSquare.canJumpTo(rowSquare) == true) {
							currentTurn.selectedSquare.jumpPieceTo(rowSquare);
							newTurn = Object.create(turn);
							newTurn.player = currentTurn.nextPlayer();
							currentTurn = newTurn;
							currentTurn.draw();
						}
					}
				}
			});
		});
	});
}

// Initialize the pieces.
var pieces = [];
pieces.removePiece = function (piece) {
	var doomed = this.indexOf(piece);
	if (doomed != -1) {
		for (i=doomed; i < this.length; i++) {
			this[i] = this[i + 1];
		}
		this.length = this.length - 1;
	}
}
_.times(3, function (i) {
	_.times(board.rows[i].length, function(ii) {
		if (board.rows[i][ii].color() == 'dark') {
			board.rows[i][ii].piece = Object.create({});
			board.rows[i][ii].piece.player = players[0];
			pieces.push(board.rows[i][ii].piece);
		}
		var redmodifier = 5;
		if (board.rows[i+redmodifier][ii].color() == 'dark') {
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
	scoreboardElement += "<td>" + players[0].piecesCount() + "</td>";
	scoreboardElement += "</tr>";
	scoreboardElement += "<tr>";
	scoreboardElement += "<td class=\"red\">Red</td>";
	scoreboardElement += "<td>" + players[1].piecesCount() + "</td>";
	scoreboardElement += "</tr>";
	scoreboardElement += "</table>";

	$('#scoreboard').replaceWith(scoreboardElement);
}

currentTurn = Object.create(turn);
currentTurn.player = players[0];