var startGame = function(nbCol, nbRow, nbMines) {
	var board = {
		array: [],
		col: nbCol,
		row: nbRow,
		mines: nbMines,
		emptyCells: (nbCol * nbRow) - nbMines,
		flags: nbMines
	};

	gameStarted = true;
	emptyCellsFound = 0;
	placeMines(board);

	var size = Math.min($("#gameArea").width() / nbCol, 50);

	var table = $("<table>").css({
		margin: 'auto'
	});
	table.addClass('table-bordered');

	/* create table */
	for (var i = 0; i < nbRow; i++) {
		var row = $("<tr>");
		for (var j = 0; j < nbCol; j++) {
			var cell = $("<td>").addClass("board-cell").css({
				width: size,
				height: size
			});
			cell.html("<button class='btn btn-default btn-block'></button>");
			var id = i * nbCol + j;
			cell.attr({
				id: id});
			var number = board.array[i][j];
			(function(number, cell) {
				cell.click(function() {
					if (!gameStarted || cell.hasClass('flagged') || cell.hasClass('clicked')) {
						return;
					}
					cell.addClass('clicked');
					switch(number) {
						case 0:
						cell.html("");
						emptyCellsFound++;
						if (emptyCellsFound === board.emptyCells) {
							showWinModal();
						}
						handleEmptyCell(cell.attr("id"), nbCol, nbRow*nbCol);
						break;
						case 9:
						cell.html("<p class='text-center'><i class='glyphicon glyphicon-fire'></i></p>");
						showLossModal();
						break;
						default:
						emptyCellsFound++;
						cell.html("<p class='text-center'>" + number + "</p>");
						if (emptyCellsFound === board.emptyCells) {
							showWinModal();
						}
						break;
					}
				});
				cell.on("contextmenu", function(event) {
					event.preventDefault();
					if (!cell.hasClass('clicked')) {
						if (cell.hasClass('flagged')) {
							cell.removeClass('flagged');
							cell.html("<button class='btn btn-default btn-lng btn-block'></button>");
							board.flags++;
						} else if (board.flags > 0) {
							cell.addClass('flagged');
							cell.children().html("<p class='text-center'><i class='glyphicon glyphicon-flag'></i></p>");
							board.flags--;
						}
					}
					$("#flagsLeft").text(board.flags);
				});
			})(number, cell);
			row.append(cell);
		}
		table.append(row);
	}

	$("#menu").fadeOut('slow', function() {
		$("#board").append(table);
		$("#minesTotal").text(board.mines);
		$("#flagsLeft").text(board.mines);
		$("#gameArea").append($("#game"));
		$("#game").fadeIn('slow');
	});
};

var placeMines = function(board) {
	/* initialise board */
	for (var i = 0; i < board.row; i++) {
		board.array[i] = [];
		for (var j = 0; j < board.col; j++) {
			board.array[i][j] = 0;
		}
	}
	/* add mines and numbers around it */
	var minePlanted = 0;
	while (minePlanted < board.mines) {
		var colIndex =  Math.floor((Math.random() * board.col));
		var rowIndex =  Math.floor((Math.random() * board.row));
		if(board.array[rowIndex][colIndex] != 9) {
			board.array[rowIndex][colIndex] = 9;
			incrementBorderCells(board, rowIndex, colIndex);
			minePlanted++;
		}
	}
};

var incrementBorderCells = function(board, row, col) {
	var tempCol;
	/* inc left col */
	if (col - 1 >= 0) {
		tempCol = col - 1;
		incrementSideCells(board, row, tempCol);
	}
	/* inc right col */
	if (col + 1 < board.col) {
		tempCol = col + 1;
		incrementSideCells(board, row, tempCol);
	}
	/* inc top and bottom row */
	if (row - 1 >= 0 && board.array[row - 1][col] != 9) {
		board.array[row - 1][col]++;
	}
	if (row + 1 < board.row && board.array[row + 1][col] != 9) {
		board.array[row + 1][col]++;
	}
};

var incrementSideCells = function(board, row, col) {
	if (board.array[row][col] != 9) {
		board.array[row][col]++;
	}
	if (row - 1 >= 0 && board.array[row - 1][col] != 9) {
		board.array[row - 1][col]++;
	}
	if (row + 1 < board.row && board.array[row + 1][col] !=9) {
		board.array[row + 1][col]++;
	}
};

var handleEmptyCell = function(id, col, max) {
	var cells = [];
	if (id % col === 0) {
		/* fist cell of a line */
		cells[0] = parseInt(id) + 1;
		cells[1] = parseInt(id) + col;
		cells[2] = parseInt(id) + col + 1;
		if (id !== 0) {
			/* not the very first cell */
			cells[3] = parseInt(id) - col;
			cells[4] = parseInt(id) - col + 1;
		}
	} else if ((parseInt(id) + 1) % col === 0) {
		/* last cell of a line */
		cells[0] = parseInt(id) - 1;
		cells[1] = parseInt(id) - col;
		cells[2] = parseInt(id) - col - 1;
		if (id !== max) {
			/* not the very last cell */
			cells[3] = parseInt(id) + col;
			cells[4] = parseInt(id) + col -1;
		}
	} else {
		cells[0] = parseInt(id) - col;
		cells[1] = parseInt(id) - col + 1;
		cells[2] = parseInt(id) + 1;
		cells[3] = parseInt(id) + col + 1;
		cells[4] = parseInt(id) + col;
		cells[5] = parseInt(id) + col -1;
		cells[6] = parseInt(id) - 1;
		cells[7] = parseInt(id) - col - 1;
	}
	for (var i = 0; i < cells.length; i++) {
		$("#" + cells[i]).click();
	}
};

var showModal = function(title, text, btnText) {
	$("#modal h3").text(title);
	$("#modal p").text(text);
	$("#modal button").text(btnText);
	$("#modal").modal();
};

var showWinModal = function() {
	$("#modal button").removeClass('btn-warning').addClass('btn-success');
	return showModal("Win", "You beat the game! Let's try again, harder this time!", "Yay!");
};

var showLossModal = function() {
	$("#modal button").removeClass('btn-success').addClass('btn-warning');
	return showModal("Loss", "Oh no, you lost. Maybe try an easier difficulty?", ":(");
};

$('#modal').on('hidden.bs.modal', function () {
	gameStarted = false;
	$("#game").fadeOut('slow', function() {
		$("#game").hide();
		$("#board").children('table').remove();
		$("#menu").fadeIn('slow');
	});
});

var gameStarted = false;
var emptyCellsFound = 0;
$("#btn_easy").on("click", function() {
	if (!gameStarted) {
		startGame(8, 8, 10);
	}
});
$("#btn_normal").on("click", function() {
	if (!gameStarted) {
		startGame(16, 16, 40);
	}
});
$("#btn_hard").on("click", function() {
	if (!gameStarted) {
		if (window.innerHeight < window.innerWidth) {
			startGame(30, 16, 99);
		} else {
			startGame(16, 30, 99);
		}
	}
});
$("#modalBtn").click(function() {
	$("#modal").modal('hide');
});
$("#customForm").submit(function(event) {
	event.preventDefault();
	var cols = parseInt($("#nbCol").val());
	var rows = parseInt($("#nbRow").val());
	var mines = parseInt($("#nbMine").val());
	if (cols === 0) cols = 8;
	if (rows === 0) rows = 8;
	if (mines === 0) mines = 10;
	if (!gameStarted) {
		$("#customModal").modal('hide');
		startGame(cols, rows, mines);
	}
});

$(window).on("beforeunload", function() {
	if (gameStarted) {
		return "Do you really wanna quit the game?";
	}
});

$(function() {
	$("#game").hide();
});