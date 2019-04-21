const MATCHDELAY = 200;
const DROPDELAY = 200;

var board;
var scoreDiv, score;
var takingInput;

const init = function()
{
  scoreDiv = document.getElementById('score');
	
  var canvas = document.getElementById('m3s');
  board = new M3SBoard(canvas, 12, 8);
  
  document.onkeydown = keyDownHandler;
  
  start();
};

const start = function()
{
  board.setSquareColors([
      'pink', 'violet', 'aquamarine', 'orange'
  ]);
  
  board.setHighlightColor('yellow');
  
  board.newGrid();
  board.redraw();
  
  score = 0;
  
  takingInput = true;  
};

/** 1. (Not reentrant) Attempt swap; if it doesn't eliminate anything, revert. */
const swap1 = function()
{
  takingInput = false;
  board.setHighlightColor('grey');
  
  var numEliminated = board.attemptSwap();
  board.redraw();
  
  if(numEliminated == 0)
  {
    takingInput = true;
	board.setHighlightColor('yellow');
	board.redraw();
	return;
  }
  
  score += numEliminated * (numEliminated + 1) / 2;
  scoreDiv.innerHTML = score;
  
  setTimeout(swap2, MATCHDELAY);
};

/** 2. Drop any suspended squares */
const swap2 = function()
{
  var dropped = board.drop();
  var refilled = board.refillTop();
  board.redraw();
  
  if(dropped || refilled)
  {
	  setTimeout(swap2, DROPDELAY);
  }
  else
  {
	  setTimeout(swap3, DROPDELAY);
  }
};

/** 3. Check for matches */
const swap3 = function()
{
  var numEliminated = board.eliminateMatches();
  board.redraw();
  
  score += numEliminated * (numEliminated + 1) / 2;
  scoreDiv.innerHTML = score;
  
  if(numEliminated > 0)
  {	
	setTimeout(swap2, MATCHDELAY);
  }
  else
  {
	takingInput = true;
	board.setHighlightColor('yellow');
	board.redraw();
  }
};

const keyDownHandler = function(e)
{	
  switch(e.key)
  {
    case 'ArrowLeft':
	case 'A':
	case 'a':
	  board.moveSelection(0, -1);
	  board.redraw();
	  break;
	  
	case 'ArrowRight':
    case 'D':
    case 'd':
      board.moveSelection(0, 1);
	  board.redraw();
      break;

    case "ArrowUp":
    case "W":
    case "w":
      board.moveSelection(-1, 0);
	  board.redraw();
	  break;

    case "ArrowDown":
    case "S":
    case "s":
      board.moveSelection(1, 0);
	  board.redraw();
	  break;
	  
	case " ":
	  if(takingInput) { swap1(); }
	  break;
	  
	case "r":
      board.redraw();	
  }
};