var square = function (spec) {
	var that = {};

	that.getColor = function ( ) {
		return spec.color;
	}

	return that;
}

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

function reverseColor(thisColor) {
	if (thisColor == 'light') {
		return 'dark';
	} else {
		return 'light';
	}
}