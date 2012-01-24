#!/usr/local/bin/node

require('datejs')
require('util')

var request = require('request'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    $ = require('jquery'),

    directory = 'wallpaper'
    old = directory + '/' + Date.parse('-month').toString('yyyy-MM'),
    path = directory + '/' + 'Current',

    debug = true

var uri = 'http://www.smashingmagazine.com/desktop-wallpaper-calendar-' + Date.today().toString('MMMM-yyyy')

if (debug) {
  console.log('Requesting ' + uri);
}

request({uri: uri}, function (error, r, html) {
  if (!error && r.statusCode == 200) {
    if (debug) {
      console.log('Moving ' + path + ' to ' + old)
    }

    fs.rename(path, old)

    if (debug) {
      console.log('Creating ' + path)
    }

    fs.mkdir(path)

    if (debug) {
      console.log('Scraping')
    }

    $('.post ul:contains("calendar")', html).each(function() {
      var wallpaper = $('li:contains("without calendar") a:last, li:contains("with calendar") a:last', this).attr('href')

      if (debug) {
        console.log(wallpaper)
      }

      var filename = url.parse(wallpaper).pathname.split('/').pop();
      var file = fs.createWriteStream(path + '/' + filename);

      var options = {
        host: url.parse(wallpaper).host,
        port: 80,
        path: url.parse(wallpaper).pathname
      }

      http.get(options, function(res) {
        res.on('data', function(data) {
          file.write(data);
        }).on('end', function() {
          file.end();
          console.log(filename + ' downloaded to ' + path);
        })
      })
    })
  }
})
