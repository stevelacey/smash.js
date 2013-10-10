#!/usr/bin/node

require('datejs')
require('util')

var request = require('request'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    $ = require('jquery'),

    domain = 'http://www.smashingmagazine.com',

    slug = 'desktop-wallpaper-calendar-' + Date.today().toString('MMMM-yyyy').toLowerCase(),
    slugs = [slug],

    directory = __dirname + '/' + 'wallpaper',
    old = directory + '/' + Date.parse('-month').toString('yyyy-MM'),
    path = directory + '/' + 'Current',

    debug = true
;

// Seasonal

switch (parseInt(Date.today().toString('M'))) {
  case 3:
  case 4:
    slugs[slugs.length] = slug + '-easter';
    break;

  case 10:
    slugs[slugs.length] = slug + '-halloween';
    break;

  case 12:
    slugs[slugs.length] = slug + '-christmas';
}

// Go

for (var i = 0; i < slugs.length; i++) {
  var slug = slugs[i];

  var uri = domain + '/' + slug;

  if (slug.indexOf('calendars') === -1) {
    slugs[slugs.length] = slug.replace('calendar', 'calendars');
  }

  if (slug.indexOf('wallpapers') === -1) {
    slugs[slugs.length] = slug.replace('wallpaper', 'wallpapers');
  }

  if (slug.indexOf('edition') === -1) {
    slugs[slugs.length] = slug + '-edition';
  }

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

      $.extend($.expr[':'], {
        'containsi': function(elem, i, match, array) {
          return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
        }
      });

      $('.post ul:containsi("calendar"):has(li:containsi("with"))', html).each(function() {
        var wallpaper = $('li:containsi("without calendar") a:last, li:containsi("with calendar") a:last', this).attr('href')

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
}
