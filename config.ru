require 'colored'
root   = File.dirname(__FILE__)
tests  = File.expand_path("tests",   root)
source = File.expand_path("browser", root)

run Proc.new { |env|
  path = Rack::Utils.unescape(env['PATH_INFO'])

  if path == '/'
    file = File.read(File.join(tests, "index.html"))
    [200, {'Content-Type' => 'text/html'}, [file]]
  elsif path == '/browser/index-set.js'
    file = File.read(File.join(source, 'index-set.js'))
    [200, {'Content-Type' => 'text/javascript'}, [file]]
  else
    Rack::Directory.new(tests).call(env)
  end
}
