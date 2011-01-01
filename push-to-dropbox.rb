#!/usr/bin ruby

require 'rubygems'
require 'dropbox'
require 'open-uri'

# STEP 1: Authorize the user
session = Dropbox::Session.new('KEY', 'SECRET', {
  :authorizing_user => 'EMAIL',
  :authorizing_password => 'PASSWORD',
})

session.mode = :dropbox
session.authorize!

# STEP 2: Play!
last_month = DateTime::now() << 1

path = 'Wallpaper/Monthly/Current'
session.rename path, last_month.strftime('%Y-%m')
session.mkdir path

ARGV.each do|wallpaper|
  filename = File.basename wallpaper
  session.upload open(wallpaper), path, :as => filename
end
