# Install Transpiler

task :install_transpiler do
  if `which compile-modules`.empty?
    sh "npm install es6-module-transpiler -g"
  end
end

# Helpers

directory "browser/index-set"

def amd_module(filename)
  out_name = filename.sub(/\.js$/, '.amd.js')
  output = "browser/#{out_name}"
  input = "lib/#{filename}"

  file output => ["browser/index-set", input] do
    open output, "w" do |file|
      file.puts %x{compile-modules --type amd --anonymous -s < #{input}}
    end
  end

  output
end

def read(file)
  File.read(file)
end

def named_module(name, filename)
  name = name.match(/^(?:vendor\/)?(.*)\.js$/)[1]
  body = read(filename)
  body.sub(/define\(/, "define(#{name.inspect},")
end

modules = Dir.chdir "lib" do
  Dir["**/*.js"] - ["vendor/loader.js"]
end

# Build AMD Modules

amd_modules = modules.reduce({}) do |hash, mod|
  hash.merge mod => amd_module(mod)
end

browser_dependencies = ["browser/index-set"] + amd_modules.values

# Define Browser Build

file "browser/index-set.js" => browser_dependencies do
  output = []
  output << %|(function() {|
  output << read("lib/vendor/loader.js")

  amd_modules.each do |name, filename|
    output << named_module(name, filename)
  end

  output << %|window.IndexSet = require('index-set');|
    output << %|})();|

  open("browser/index-set.js", "w") do |file|
    file.puts output.join("\n")
  end
end

file "browser/index-set.all.js" => browser_dependencies do
  output = []

  amd_modules.each do |name, filename|
    output << named_module(name, filename)
  end

  open("browser/index-set.all.js", "w") do |file|
    file.puts output.join("\n")
  end
end

task :dist => [:install_transpiler, "browser/index-set.js", "browser/index-set.all.js"]

desc "compile index-set"
task :default => :dist

task :test do |t, args|
  require "rack"
  require "webrick"
  require "colored"

  unless system("which phantomjs > /dev/null 2>&1")
    abort "PhantomJS is not installed. Download from http://phantomjs.org"
  end

  server = fork do
    Rack::Server.start(:config    => "config.ru",
                       :Logger    => WEBrick::Log.new("/dev/null"),
                       :AccessLog => [],
                       :Port      => 9999)
  end

  success = true
  test_path = File.expand_path("../tests", __FILE__)
  cmd = "phantomjs #{test_path}/run-qunit.js \"http://localhost:9999/\""
  system(cmd)

  # A bit of a hack until we can figure this out on Travis
  tries = 0
  while tries < 3 && $?.exitstatus === 124
    tries += 1
    puts "\nTimed Out. Trying again...\n".yellow
    system(cmd)
  end

  success &&= $?.success?

  Process.kill(:SIGINT, server)
  Process.wait

  if success
    puts "\nTests Passed".green
  else
    puts "\nTests Failed".red
    exit(1)
  end
end

task :autotest do
  system("kicker -e 'rake dist; rake test'")
end
