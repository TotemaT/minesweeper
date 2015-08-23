startGame = function(nbCol, nbRow, nbMines) {
	var board = {
		array: [],
		col: nbCol,
		row: nbRow,
		mines: nbMines,
		emptyCells: (nbCol * nbRow) - nbMines
	};

	emptyCellsFound = 0;
	placeMines(board);

	var size = Math.min($("#gameArea").width() / nbCol, 50);

	var container = $("<table>").css({
		margin: 'auto'
	});
	container.addClass('table-bordered');

	/* create table */
	for (var i = 0; i < nbRow; i++) {
		var row = $("<tr>");
		for (var j = 0; j < nbCol; j++) {
			var cell = $("<td>").addClass("board-cell").css({
				width: size,
				height: size
			});
			cell.html("<button class='btn btn-default btn-block btn-lng'></button>");
			var id = i * nbCol + j;
			cell.attr({
				id: id});
			var number = board.array[i][j];
			(function(number, cell) {
				cell.click(function() {
					if (gameStarted || cell.hasClass('flagged') || cell.hasClass('clicked')) {
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
						cell.html("<p class='text-center'><i class='glyphicon glyphicon-remove-sign'></i></p>");
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
					if (cell.hasClass('flagged')) {
						cell.removeClass('flagged');
						cell.html("<button class='btn btn-default btn-lng btn-block'></button>")
					} else {
						cell.addClass('flagged');
						cell.html("<p class='text-center'><i class='glyphicon glyphicon-flag'></i></p>");
					}
				});
			})(number, cell);
			row.append(cell);
		}
		container.append(row);
	}

	$("#menu").fadeOut('slow', function() {
		var well = $("<div>").addClass('well').attr('id', 'game');
		well.append(container);
		$("#gameArea").append(well).fadeIn('slow');
	});

};

placeMines = function(board) {
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

incrementBorderCells = function(board, row, col) {
	/* inc left col */
	if (col - 1 >= 0) {
		var tempCol = col - 1;
		incrementSideCells(board, row, tempCol);
	}
	/* inc right col */
	if (col + 1 < board.col) {
		var tempCol = col + 1;
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

incrementSideCells = function(board, row, col) {
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

handleEmptyCell = function(id, col, max) {
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

showModal = function(title, text, btnText) {
	$("#modal h3").text(title);
	$("#modal p").text(text);
	$("#modal button").text(btnText);
	$("#modal").modal();
};

showWinModal = function() {
	$("#modal button").removeClass('btn-warning').addClass('btn-success');
	return showModal("Win", "You beat the game! Let's try again, harder this time!", "Yay!");
};

showLossModal = function() {
	$("#modal button").removeClass('btn-success').addClass('btn-warning');
	return showModal("Loss", "Oh no, you lost. Maybe try an easier difficulty?", ":(");
};

$('#modal').on('hidden.bs.modal', function (e) {
	gameStarted = false;
	$("#game").fadeOut('slow', function() {
		$("#game").remove();
		$("#menu").fadeIn('slow');
	});
});

var gameStarted = false;
var emptyCellsFound = 0;
$("#btn_easy").on("click", function() {
	if (!gameStarted) {
		startGame(8, 8, 10);
	}
	gameStarted = true;
});
$("#btn_normal").on("click", function() {
	if (!gameStarted) {
		startGame(16, 16, 40);
	}
	gameStarted = true;
});
$("#btn_hard").on("click", function() {
	if (!gameStarted) {
		startGame(30, 16, 99);
	}
	gameStarted = true;
});
$("#modalBtn").click(function() {
	$("#modal").modal('hide');
});
$("#customForm").submit(function(event) {
	event.preventDefault();
	var cols = $("#nbCol").val();
	var rows = $("#nbRow").val();
	var mines = $("#nbMine").val();
	if (cols === 0) col = 8;
	if (rows === 0) row = 8;
	if (mines === 0) mines = 10;
	if (!gameStarted) {
		$("#customModal").modal('hide');
		startGame(rows, cols, mines);
	}
});