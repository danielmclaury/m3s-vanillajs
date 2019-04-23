const GAMELENGTH = 180;

const ROWS = 12;
const COLS = 8;

const MATCHDELAY = 500;
const DROPDELAY = 200;

const ACTIVEHIGHLIGHT = 'yellow';
const INACTIVEHIGHLIGHT = 'grey';

const MATCHCOLOR = 'yellow';
const BLANKCOLOR = 'white';

const GAMEOVERTEXT = "Time's Up!";
const GAMEOVERCOLOR = 'white';
const GAMEOVEROUTLINE = 'black';
const GAMEOVERFONT = '48px Impact';

var board;
var scoreDiv, score;
var highScoreDiv, highScore;
var timeDiv, timeRemaining;
var takingInput, begun;
var respawnCounter;

const init = function()
{
  scoreDiv = document.getElementById('score');
  highScoreDiv = document.getElementById('highscore');
  timeDiv = document.getElementById('time');
	
  var canvas = document.getElementById('m3s');
  board = new M3SBoard(canvas, ROWS, COLS);
  
  document.onkeydown = keyDownHandler;
  
  highScore = 0;
  
  start();
};

const start = function()
{
  timeRemaining = GAMELENGTH;	

  board.setSquareColors([
      'pink', 'violet', 'aquamarine', 'orange', 'lightgreen'
  ]);
  
  board.setHighlightColor(ACTIVEHIGHLIGHT);
  
  board.newGrid();
  board.redraw();
  
  score = 0;
  updateScore();
  
  takingInput = true;
  begun = false;
  
  tick();
};

const tick = function()
{
	if(begun)
	{
	  timeRemaining = Math.max(0, timeRemaining - 1);
	}
	
	timeDiv.innerHTML = Math.floor(timeRemaining/60).toString() 
	+ ":" + (timeRemaining % 60).toString().padStart(2, '0');	
	
	if(timeRemaining == 0)
	{
	  gameover();
	}
	else
	{
	  setTimeout(tick, 1000);
	}
}

const updateScore = function()
{
	scoreDiv.innerHTML = score;
	
	if(score > highScore)
	{
		highScore = score;
		highScoreDiv.innerHTML = score;
	}
}

const gameover = function()
{
  if(! takingInput)
  {
    // Time's up, but we're still making pairs from dropped pieces.
	// Check back again later.
	
	setTimeout(gameover, 50);
	return;
  }
	
  var canvas = document.getElementById('m3s');
  var context = canvas.getContext("2d");
    
  context.font = GAMEOVERFONT;
  context.textAlign = "center";
  context.fillStyle = GAMEOVERCOLOR;
  context.strokeStyle = GAMEOVEROUTLINE;
  context.strokeText(GAMEOVERTEXT, canvas.width/2, canvas.height/2);
  context.fillText(GAMEOVERTEXT, canvas.width/2, canvas.height/2);
  
  respawnCounter = 3;
  
  setTimeout(gameover2, 2000);
};

const gameover2 = function()
{
	board.redraw();
	
	var canvas = document.getElementById('m3s');
    var context = canvas.getContext("2d");

    context.font = GAMEOVERFONT;
    context.textAlign = "center";
    context.fillStyle = GAMEOVERCOLOR;
    context.strokeStyle = GAMEOVEROUTLINE;
    context.strokeText(respawnCounter.toString(), canvas.width/2, canvas.height/2);
    context.fillText(respawnCounter.toString(), canvas.width/2, canvas.height/2);
	
	respawnCounter--;
	
	if(respawnCounter > 0)
	{
	  setTimeout(gameover2, 1000);
	}
	else
	{
	  setTimeout(start, 1000);
	}
};

/** 1. (Not reentrant) Attempt swap; if it doesn't eliminate anything, revert. */
const swap1 = function()
{
  takingInput = false;
  board.setHighlightColor(INACTIVEHIGHLIGHT);
  
  board.swap();
  
  var matches = board.findMatches();
  
  if(matches.length == 0)
  {
    // didn't make any matches; revert.
	board.swap();
	takingInput = true;
	board.setHighlightColor(ACTIVEHIGHLIGHT);
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
  board.setBackgroundColor(MATCHCOLOR);
  board.redraw();
  board.setBackgroundColor(BLANKCOLOR);
  
  score += numEliminated * (numEliminated + 1) / 2;
  updateScore();
  
  if(numEliminated > 0)
  {	
	setTimeout(swap3, MATCHDELAY);
  }
  else
  {
	takingInput = true;
	board.setHighlightColor(ACTIVEHIGHLIGHT);
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
  if(timeRemaining == 0) return;
  
  begun = true;
	
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