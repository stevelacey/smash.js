var sys     = require('sys'),
    request = require('request'),
    fs      = require('fs'),
    url     = require('url'),
    $       = require('jquery'),
    exec    = require('child_process').exec,
    util    = require('util'),
    date    = new Date(),
    wallpaper = []

Date.prototype.getMonthName = function() {
  var m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return m[this.getMonth()];
}

request({uri: 'http://www.smashingmagazine.com/desktop-wallpaper-calendar-' + date.getMonthName() + '-' + date.getFullYear()}, function (error, r, html) {
  if(!error && r.statusCode == 200) {
    $('.post .entry ul:contains("calendar")', html).each(function() {
      wallpaper[wallpaper.length] = '"' + $('li:contains("without calendar") a:last, li:contains("with calendar") a:last', this).attr('href') + '"';
    })

    exec('ruby push-to-dropbox.rb ' + wallpaper.join(' '), function (error, stdout, stderr) {
      util.print('stdout: ' + stdout);
      util.print('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  }
})
