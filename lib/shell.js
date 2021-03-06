// Generated by CoffeeScript 1.6.3
(function() {
  var Adapter, Robot, Shell, TextMessage, chalk, cline, fs, historyPath, historySize, readline, stream, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  fs = require('fs');

  readline = require('readline');

  stream = require('stream');

  cline = require('cline');

  chalk = require('chalk');

  Robot = require('../robot');

  Adapter = require('../adapter');

  TextMessage = require('../message').TextMessage;

  historySize = process.env.HUBOT_SHELL_HISTSIZE != null ? parseInt(process.env.HUBOT_SHELL_HISTSIZE) : 1024;

  historyPath = ".hubot_history";

  Shell = (function(_super) {
    __extends(Shell, _super);

    function Shell() {
      _ref = Shell.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Shell.prototype.send = function() {
      var envelope, str, strings, _i, _len, _results;
      envelope = arguments[0], strings = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _results = [];
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        str = strings[_i];
        _results.push(console.log(chalk.green.bold("" + str)));
      }
      return _results;
    };

    Shell.prototype.emote = function() {
      var envelope, str, strings, _i, _len, _results;
      envelope = arguments[0], strings = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _results = [];
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        str = strings[_i];
        _results.push(this.send(envelope, "* " + str));
      }
      return _results;
    };

    Shell.prototype.reply = function() {
      var envelope, strings;
      envelope = arguments[0], strings = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      strings = strings.map(function(s) {
        return "" + envelope.user.name + ": " + s;
      });
      return this.send.apply(this, [envelope].concat(__slice.call(strings)));
    };

    Shell.prototype.run = function() {
      var _this = this;
      this.buildCli();
      return this.loadHistory(function(history) {
        _this.cli.history(history);
        _this.cli.interact("" + _this.robot.name + "> ");
        return _this.emit('connected');
      });
    };

    Shell.prototype.shutdown = function() {
      this.robot.shutdown();
      return process.exit(0);
    };

    Shell.prototype.buildCli = function() {
      var _this = this;
      this.cli = cline();
      this.cli.command('*', function(input) {
        var user, userId, userName;
        userId = parseInt(process.env.HUBOT_SHELL_USER_ID || '1');
        userName = process.env.HUBOT_SHELL_USER_NAME || 'Shell';
        user = _this.robot.brain.userForId(userId, {
          name: userName,
          room: 'Shell'
        });
        return _this.receive(new TextMessage(user, input, 'messageId'));
      });
      this.cli.command('history', function() {
        var item, _i, _len, _ref1, _results;
        _ref1 = _this.cli.history();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          item = _ref1[_i];
          _results.push(console.log(item));
        }
        return _results;
      });
      this.cli.on('history', function(item) {
        if (item.length > 0 && item !== 'exit' && item !== 'history') {
          return fs.appendFile(historyPath, "" + item + "\n", function(err) {
            if (err) {
              return _this.robot.emit('error', err);
            }
          });
        }
      });
      return this.cli.on('close', function() {
        var history, item, outstream, startIndex, _i, _len;
        history = _this.cli.history();
        if (history.length > historySize) {
          startIndex = history.length - historySize;
          history = history.reverse().splice(startIndex, historySize);
          outstream = fs.createWriteStream(historyPath);
          outstream.on('finish', function() {
            return _this.shutdown();
          });
          for (_i = 0, _len = history.length; _i < _len; _i++) {
            item = history[_i];
            outstream.write("" + item + "\n");
          }
          return outstream.end(function() {
            return _this.shutdown();
          });
        } else {
          return _this.shutdown();
        }
      });
    };

    Shell.prototype.loadHistory = function(callback) {
      return fs.exists(historyPath, function(exists) {
        var instream, items, outstream, rl;
        if (exists) {
          instream = fs.createReadStream(historyPath);
          outstream = new stream;
          outstream.readable = true;
          outstream.writable = true;
          items = [];
          rl = readline.createInterface({
            input: instream,
            output: outstream,
            terminal: false
          });
          rl.on('line', function(line) {
            line = line.trim();
            if (line.length > 0) {
              return items.push(line);
            }
          });
          return rl.on('close', function() {
            return callback(items);
          });
        } else {
          return callback([]);
        }
      });
    };

    return Shell;

  })(Adapter);

  exports.use = function(robot) {
    return new Shell(robot);
  };

}).call(this);
