"use strict";

var gameStarted = false;
var emptyCellsFound = 0;
var firstCellClicked = false;
var timerId;
var board = {
    array: [],
    col: 0,
    row: 0,
    mines: 0,
    emptyCells: 0,
    flags: 0
};
var modalClicked = -1;

var startGame = function(nbCol, nbRow, nbMines) {
    board.array = [];
    board.col = nbCol;
    board.row = nbRow;
    board.mines = nbMines;
    board.emptyCells = (nbCol * nbRow) - nbMines;
    board.flags = nbMines;

    gameStarted = true;
    modalClicked = -1;
    firstCellClicked = false;
    emptyCellsFound = 0;
    placeMines();

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

            addClickListener(cell, number);
            addRightClickListener(cell);
            row.append(cell);
        }
        table.append(row);
    }

    showGame(table);
};

var placeMines = function() {
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
            incrementBorderCells(rowIndex, colIndex);
            minePlanted++;
        }
    }
};

var incrementBorderCells = function(row, col) {
    var tempCol;
    /* inc left col */
    if (col - 1 >= 0) {
        tempCol = col - 1;
        incrementSideCells(row, tempCol);
    }
    /* inc right col */
    if (col + 1 < board.col) {
        tempCol = col + 1;
        incrementSideCells(row, tempCol);
    }
    /* inc top and bottom row */
    if (row - 1 >= 0 && board.array[row - 1][col] != 9) {
        board.array[row - 1][col]++;
    }
    if (row + 1 < board.row && board.array[row + 1][col] != 9) {
        board.array[row + 1][col]++;
    }
};

var incrementSideCells = function(row, col) {
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

var showGame = function(table) {
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

var addClickListener = function(cell, number) {
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

var addRightClickListener = function(cell) {
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

var showModal = function(title, text) {
    $("#modal h3").text(title);
    $("#modal p").text(text);
    $("#modal").modal();
};

var showWinModal = function() {
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
    return showModal("Win!", text);
};

var showLossModal = function() {
    showMinesLeft();
    return showModal("Loss", "Oh no, you lost. Maybe try an easier difficulty?");
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

var showMinesLeft = function() {
   for (var i = 0; i < board.row; i++) {
    for (var j = 0; j < board.col; j++) {
        var id = i * board.col + j;
        var elt = $("#" + id);
        if (board.array[i][j] === 9) {
            if (elt.hasClass("flagged")) {
                elt.css("color", "green");
            } else {
                elt.css("color", "red").html("<p class='text-center'><i class='glyphicon glyphicon-fire'></i></p>");
            }
        } else {
            if (elt.hasClass("flagged")) {
                elt.css("color", "red");
            }
        }
    }
}
};

$("#modal").on("hide.bs.modal", function () {
    gameStarted = false;
    switch(modalClicked) {
        case 0:
        if (!gameStarted) {
            $("#board").children("table").remove();
            startGame(8, 8, 10);
        }
        break;
        case 1:
        if (!gameStarted) {
            $("#board").children("table").remove();
            startGame(16, 16, 40);
        }
        break;
        case 2:
        if (!gameStarted) {
            $("#board").children("table").remove();
            if (window.innerHeight < window.innerWidth) {
                startGame(30, 16, 99);
            } else {
                startGame(16, 30, 99);
            }
        }
        break;
        case 3:
        $("#customModal").modal();
        break;
        case 4:
        $("#game").fadeOut("slow", function() {
            $("#menu").fadeIn("slow");
        });
        break;
    }
});

$("#customModal").on("hide.bs.modal", function() {
    $("#board").children("table").remove();
});

$("#modal_easy").on("click", function() {
    modalClicked = 0;
    $("#modal").modal("hide");
});

$("#modal_normal").on("click", function() {
    modalClicked = 1;
    $("#modal").modal("hide");
});

$("#modal_hard").on("click", function() {
    modalClicked = 2;
    $("#modal").modal("hide");
});

$("#modal_custom").on("click", function() {
    modalClicked = 3;
    $("#modal").modal("hide");
});

$("#modal-back-menu").click(function() {
    modalClicked = 4;
    $("#modal").modal("hide");
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