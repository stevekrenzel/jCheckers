var square = function (spec) {
	var that = {};
	var piece;

	that.getColor = function ( ) {
		return spec.color;
	}

	that.setPiece = function (newPiece) {
		piece = newPiece;
	}

	that.getPiece = function ( ) {
		return piece || undefined;
	}

	return that;
}

var piece = function (spec) {
	var that = {};

	that.getPlayer = function ( ) {
		return spec.player;
	}

	return that;
}

var player = function (spec) {
	var that = {};

	that.getColor = function ( ) {
		return spec.color;
	}

	return that;
}

function reverseColor(thisColor) {
	if (thisColor == 'light') {
		return 'dark';
	} else {
		return 'light';
	}
}

// Initialize the board.
var board = { };
board.rows = [ ];
var thisColor = 'light';
for (i=0; i<8; i++) {
	thisColor = reverseColor(thisColor);
	board.rows[i] = [ ];
	for (ii=0; ii<8; ii++) {
		thisColor = reverseColor(thisColor);
		board.rows[i][ii] = square({color: thisColor});
	}
}

// Initialize the players.
var players = [ player({color: 'black'}), player({color: 'red'}) ];

// Initialize the pieces. (I'll clean this up later.)
for (i=0; i<3; i++) {
	for (ii=0; ii<board.rows[i].length; ii++) {
		if (board.rows[i][ii].getColor() == 'dark') {
			board.rows[i][ii].setPiece( piece({player: players[0]}) );
		}
	}
}
for (i = (board.rows.length - 1); i > (board.rows.length - 4); i--) {
	for (ii=0; ii<board.rows[i].length; ii++) {
		if (board.rows[i][ii].getColor() == 'dark') {
			board.rows[i][ii].setPiece( piece({player: players[1]}) );
		}
	}
}