class M3SBoard
{
  constructor(canvas, rows, cols)
  {
	  this._canvas = canvas;
	  this._context = canvas.getContext("2d");
	  
	  this._rows = rows;
	  this._cols = cols;
	  
	  this._dx = canvas.width / cols;
	  this._dy = canvas.height / rows;
	  	  	  
	  this._highlightPosition = [3, 4];
	  
	  this._backgroundColor = "white";
	  
	  this._HIGHLIGHTCOLOR = "yellow";
  }
  
  setBackgroundColor(color)
  {
    this._backgroundColor = color;
  }
  
  /** Provide a list of colors to use for the squares */
  setSquareColors(colors)
  {
	  this._squareColors = colors;
  }
  
  /** Set the color of the highlight box */
  setHighlightColor(color)
  {
	  this._HIGHLIGHTCOLOR = color;
  }
  
  /** Create a new grid full of random colors */
  newGrid()
  {
    this._grid = [];
    for(var row = 0; row < this._rows; row++)
    {
      var nextRow = [];
      for(var col = 0; col < this._cols; col++)
      {
        nextRow.push(this._getRandomColor());	
      }
      this._grid.push(nextRow);
    }
	
	var matches = [];
	do
	{
		this.removeSquares(matches);
		this._refillGrid();
		matches = this.findMatches();
	}
	while(matches.length > 0);
  }
  
  /** (private) picks a random color from those available */
  _getRandomColor()
  {
    return this._squareColors[Math.floor(Math.random() * this._squareColors.length)];
  }
  
  /** redraw board */
  redraw()
  {
    this._redrawGrid();
	this._highlight(this._highlightPosition);
  }
  
  /** (private) redraws the grid */
  _redrawGrid()
  {
	this._context.fillStyle = this._backgroundColor;
	this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
	
	for(var row = 0; row < this._rows; row++)
	{
      for(var col = 0; col < this._cols; col++)
      {
		if(this._grid[row][col] != null)
		{
          this._context.fillStyle = this._grid[row][col];
          this._context.fillRect(col * this._dx, row * this._dy, this._dx, this._dy);
		}
      }
    }
  }
  
  /** (private) highlights (r, c) and (r, c+1) */
  _highlight(p)
  {  
    var r, c;
	
	[r, c] = p;
  
    this._context.strokeStyle = this._HIGHLIGHTCOLOR;
	this._context.lineWidth = 5;
	  
	this._context.beginPath();
	this._context.moveTo(c       * this._dx, r       * this._dy);
	this._context.lineTo((c + 2) * this._dx, r       * this._dy);
	this._context.lineTo((c + 2) * this._dx, (r + 1) * this._dy);
	this._context.lineTo(c       * this._dx, (r + 1) * this._dy);
	this._context.lineTo(c       * this._dx, r       * this._dy);
	this._context.stroke();
  }
  
  /** Moves the selection over by the specified number of rows
      and/or columns */
  moveSelection(dr, dc)
  {
    var r, c;

    [r, c] = this._highlightPosition;

    r += dr; c += dc;

    if(r < 0 || r >= this._rows || c < 0 || c + 1 >= this._cols)
	{
	  return;
	}

    this._highlightPosition = [r, c];
  }
  
  getPosition()
  {
	  return this._highlightPosition;
  }
  
  /** Swaps the two selected pieces. */
  swap(pos)
  {
	  var r, c;
	  
	  [r, c] = pos;
	  
	  var temp = this._grid[r][c];
	  this._grid[r][c] = this._grid[r][c+1];
	  this._grid[r][c+1] = temp;	  
  }
  
  eliminateMatches()
  {
	  var matched = this.findMatches();
	  
	  this.removeSquares(matched);
	  
	  return matched.length;
  }
  
  removeSquares(squares)
  {
    for(var i = 0; i < squares.length; i++)
	{
	  var r, c;
	  
	  [r, c] = squares[i];
	  
	  this._grid[r][c] = null;
	}
  }
  
  findMatches()
  {
	var matched = new Set();
	  
    for(var row = 0; row < this._rows; row++)
    {
      for(var col = 1; col + 1 < this._cols; col++)
	  {
		if(this._grid[row][col] == null) continue;
		  
	    if(this._grid[row][col] == this._grid[row][col - 1]
		&& this._grid[row][col] == this._grid[row][col + 1])
		{
			matched.add([row, col - 1]);
			matched.add([row, col]);
			matched.add([row, col + 1]);
		}
	  }
    }
	
	for(var row = 1; row + 1 < this._rows; row++)
    {
      for(var col = 0; col < this._cols; col++)
	  {
		if(this._grid[row][col] == null) continue;
		  
	    if(this._grid[row][col] == this._grid[row - 1][col]
		&& this._grid[row][col] == this._grid[row + 1][col])
		{
			matched.add([row - 1, col]);
			matched.add([row    , col]);
			matched.add([row + 1, col]);
		}
	  }
    }
	
	return Array.from(matched);
  }
  
  drop()
  {
	var dropped = false;  
	  
	for(var col = 0; col < this._cols; col++)
	{
	  for(var row = this._rows - 2; row >= 0; row--)
	  {  
		 if(   this._grid[row    ][col] != null 
		    && this._grid[row + 1][col] == null)
		{
		  dropped = true;
		  this._grid[row + 1][col] = this._grid[row][col];
		  this._grid[row    ][col] = null;
		}	
	  }
	}

	return dropped;
  }
  
  _refillGrid()
  {
    for(var row = 0; row < this._rows; row++)
	{
	  for(var col = 0; col < this._cols; col++)
	  {
		if(this._grid[row][col] == null)
		{
	      this._grid[row][col] = this._getRandomColor();
		}
	  }
	}
  }
  
  refillTop()
  {
	var refilled = false;
	  
	for(var col = 0; col < this._cols; col++)
	{
		if(this._grid[0][col] == null)
		{
		  refilled = true;
	      this._grid[0][col] = this._getRandomColor();
		}
	}
	
	return refilled;
  }
}
