namespace :js do
  desc "Minify javascript src for production environment"
  task :min => :environment do
    # list of files to minify
    libs = [
             'public/javascripts/admin.js'
           ]
    # paths to jsmin script and final minified file
    jsmin = '/mytools/jsmin.rb'
    final = 'public/javascripts/min-admin.js'

    # create single tmp js file
    tmp = Tempfile.open('all')
    libs.each {|lib| open(lib) {|f| tmp.write(f.read) } }
    tmp.rewind

    # minify file
    %x[ruby #{jsmin} < #{tmp.path} > #{final}]
    puts "\n#{final}"
  end
end

