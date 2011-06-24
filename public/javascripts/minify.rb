#!/usr/bin/ruby

require 'rubygems'
require 'jsmin'

input = ARGV[0]
output = ARGV[1]

if output.nil?
  puts "usage: ./minify.rb <src.js> <dst.js>\n"
  exit
end

src = open(input).readlines 
dst = open(output,'w')

dst.write( JSMin.minify(src) )
dst.close

puts "#{input} was minified to #{output}"
