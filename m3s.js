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
  
  board.swap();
  
  var matches = board.findMatches();
  
  if(matches.length == 0)
  {
    // didn't make any matches; revert.
	board.swap();
	takingInput = true;
	board.setHighlightColor('yellow');
	board.redraw();
  }
  else
  {
	swap2();
  }
};

/** 2. Check for matches */
const swap2 = function()
{
  var matches = board.findMatches();
  board.removeSquares(matches);
  var numEliminated = matches.length;
  board.redraw();
  
  score += numEliminated * (numEliminated + 1) / 2;
  scoreDiv.innerHTML = score;
  
  if(numEliminated > 0)
  {	
	setTimeout(swap3, MATCHDELAY);
  }
  else
  {
	takingInput = true;
	board.setHighlightColor('yellow');
	board.redraw();
  }
};

/** 3. Drop any suspended squares */
const swap3 = function()
{
  var dropped = board.drop();
  var refilled = board.refillTop();
  board.redraw();
  
  if(dropped || refilled)
  {
	  setTimeout(swap3, DROPDELAY);
  }
  else
  {
	  setTimeout(swap2, DROPDELAY);
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