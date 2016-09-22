(function(undefined) {
  var IMAGE = "http://s14.postimg.org/wainz42k1/conway_twitty.jpg";
  var DIRS = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  function createDOMCell() {
    var $cell = $("<div>")
      .addClass("cell")
      .append($("<img>").attr("src", IMAGE));

    return $cell.get(0);
  };

  function Cell() {
    this.el = createDOMCell();
    var that = this;
    $(this.el).click(function() { that.set(!that.alive); });
    this.set(false);
  };

  Cell.prototype.on = function() {
    $(this.el).addClass("alive");
    this.alive = true;
  };

  Cell.prototype.off = function() {
    $(this.el).removeClass("alive");
    this.alive = false;
  };

  Cell.prototype.set = function(state) {
    if (state)
      this.on();
    else
      this.off();
  };

  function traverse(grid, width, height, cellCallback, rowCallback) {
    for (var i = 0; i < width; i++) {
      var row = grid[i];
      var rowRet = rowCallback ? rowCallback(row, i, grid) : undefined;
      if (cellCallback) {
        for (var j = 0; j < height; j++) {
          cellCallback(row[j], i, j, row, rowRet, grid);
        }
      }
    }
  };

  function createCellGrid(width, height, generator) {
    var grid = [];
    for (var i = 0; i < width; i++) {
      var row = [];
      grid.push(row);
      for (var j = 0; j < height; j++) {
        row.push(generator(i, j));
      }
    }

    return grid;
  };

  function populationCount(grid, i, j) {
    var total = 0;
    for (var x = 0; x < DIRS.length; x++) {
      var offset = DIRS[x];
      var row = grid[i + offset[0]];
      if (row)
        total += row[j + offset[1]];
    }

    return total;
  }

  function computeState(rules, grid, i, j) {
    var onoff = grid[i][j] ? "1": "0";
    var key = onoff + populationCount(grid, i, j);
    var outcome = rules[key];
    if (outcome == undefined)
      outcome = rules[onoff];

    return outcome || false;
  }

  function Conway(rules, size, iv) {
    this.rules = rules;
    this.width = size[0];
    this.height = size[1];
    iv = iv || {};
    this.grid = createCellGrid(this.width, this.height, function(i, j) {
      var cell = new Cell;
      var row = iv[i];
      if (row && row[j])
        cell.set(true);

      return cell;
    });
  };

  Conway.prototype.clear = function() {
    traverse(this.grid, this.width, this.height,
        function(cell) { cell.off(); });
  };

  Conway.prototype.randomize = function() {
    traverse(this.grid, this.width, this.height,
        function(cell) {
          var rnd = Math.floor(Math.random() * 2);
          cell.set(rnd == 1);
        });
  };

  Conway.prototype.generateDOM = function(root) {
    var $root = $(root);
    traverse(this.grid, this.width, this.height,
        function(val, i, j, row, rowRet, grid) {
          rowRet.append(val.el);
        },
        function() {
          return $("<div>").addClass("row").appendTo($root);
        });
  };

  Conway.prototype.step = function(root) {
    var domGrid = this.grid;
    var rules = this.rules;
    var scratch = createCellGrid(this.width, this.height, function(i, j) {
      return domGrid[i][j].alive;
    });

    traverse(scratch, this.width, this.height,
        function(val, i, j, row, rowRet, grid) {
          domGrid[i][j].set(computeState(rules, grid, i, j));
        });
  };

  // game settings
  var SIZE = [25, 25];
  var RULES = {
    "10": false,
    "11": false,
    "12": true,
    "13": true,
    "03": true
  };

  var IV = {0: {0: true}};
  var INTERVAL = 1000;

  // setup the 'game'
  $(function() {
    // initialize game
    var conway = new Conway(RULES, SIZE, IV);
    conway.generateDOM($("#grid"));

    var intervalHandle = undefined;

    //setup event listeners
    $("#clear").click(function() { conway.clear(); });
    $("#randomize").click(function() { conway.randomize(); });
    $("#playpause").click(function() {
      if (intervalHandle == undefined) {
        $(this).text("pause");
        intervalHandle = setInterval(function() { conway.step(); }, INTERVAL);
      } else {
        $(this).text("play");
        clearInterval(intervalHandle);
      }
    });
  });

})();
