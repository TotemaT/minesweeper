"use strict";

var gameStarted = false;
var emptyCellsFound = 0;
var firstCellClicked = false;
var timerId;

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
    firstCellClicked = false;
    emptyCellsFound = 0;
    placeMines(board);

    var size = Math.min($("#gameArea").width() / nbCol, 50);

    var table = $("<table>").css({
        margin: "auto"
    });
    table.addClass("table-bordered");

    /* create table */
    for (var i = 0; i < nbRow; i++) {
        var row = $("<tr>");
        for (var j = 0; j < nbCol; j++) {
            var cell = $("<td>").addClass("board-cell").css({
                width: size,
                height: size
            });
            var id = i * nbCol + j;
            cell.attr({
                id: id});
            var number = board.array[i][j];

            addClickListener(cell, board, number);
            addRightClickListener(cell, board);
            row.append(cell);
        }
        table.append(row);
    }

    showGame(board, table);
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

var showGame = function(board, table) {
    $("#menu").fadeOut("slow", function() {
        $("#board").append(table);
        $("#minesTotal").text(board.mines);
        $("#flagsLeft").text(board.mines);
        $("#timerMinutes").text("00");
        $("#timerSeconds").text("00");
        $("#gameArea").append($("#game"));
        $("#game").fadeIn("slow");
    });
};

var addClickListener = function(cell, board, number) {
    cell.on("click", function() {
        if (!gameStarted || cell.hasClass("flagged") || cell.hasClass("clicked")) {
            return;
        }
        if (!firstCellClicked) {
            timerId = window.setInterval(startTimer, 1000);
            firstCellClicked = true;
        }
        cell.addClass("clicked");
        switch(number) {
            case 0:
            cell.html("");
            emptyCellsFound++;
            if (emptyCellsFound === board.emptyCells) {
                clearInterval(timerId);
                showWinModal();
            }
            handleEmptyCell(cell.attr("id"), board.col, board.row * board.col);
            break;
            case 9:
            cell.html("<p class='text-center'><i class='glyphicon glyphicon-fire'></i></p>");
            clearInterval(timerId);
            showLossModal();
            break;
            default:
            emptyCellsFound++;
            cell.html("<p class='text-center'>" + number + "</p>");
            if (emptyCellsFound === board.emptyCells) {
                clearInterval(timerId);
                showWinModal();
            }
            break;
        }
    });
};

var addRightClickListener = function(cell, board) {
    cell.on("contextmenu", function(event) {
        event.preventDefault();
        if (!cell.hasClass("clicked")) {
            if (cell.hasClass("flagged")) {
                cell.removeClass("flagged");
                cell.html("");
                board.flags++;
            } else if (board.flags > 0) {
                cell.addClass("flagged");
                cell.html("<p class='text-center'><i class='glyphicon glyphicon-flag'></i></p>");
                board.flags--;
            }
        }
        $("#flagsLeft").text(board.flags);
    });
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
    $("#modal button").removeClass("btn-warning").addClass("btn-success");
    var text = "You beat the game in";
    var minutes = parseInt($("#timerMinutes").text());
    var seconds = parseInt($("#timerSeconds").text());
    if (minutes === 1) {
        text += " 1 minute";
    } else if (minutes > 1) {
        text += " " + minutes + " minutes";
    }
    if (minutes >= 1) {
        text += " and";
    }
    if (seconds === 1) {
        text += " 1 second";
    } else if (seconds > 1) {
        text += " " + seconds + " seconds";
    }
   text +=  "! Let's try again, harder this time!";
    return showModal("Win!", text, "Yay!");
};

var showLossModal = function() {
    $("#modal button").removeClass("btn-success").addClass("btn-warning");
    return showModal("Loss", "Oh no, you lost. Maybe try an easier difficulty?", ":(");
};

var startTimer = function() {
    var secondsElt = $("#timerSeconds");
    if (parseInt(secondsElt.text()) === 59) {
        var minutesElt = $("#timerMinutes");
        minutesElt.text(("0" + (parseInt(minutesElt.text()) + 1)).slice(-2));
        secondsElt.text("00");
    } else {
        secondsElt.text(("0" + (parseInt(secondsElt.text()) + 1)).slice(-2));
    }
};

$("#modal").on("hidden.bs.modal", function () {
    gameStarted = false;
    $("#game").fadeOut("slow", function() {
        $("#game").hide();
        $("#board").children("table").remove();
        $("#menu").fadeIn("slow");
    });
});

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
    $("#modal").modal("hide");
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
        $("#customModal").modal("hide");
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