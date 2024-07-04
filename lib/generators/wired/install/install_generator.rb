module Wired
  class InstallGenerator < Rails::Generators::Base
    source_root File.expand_path("./tpl", __dir__)

    def init
      puts("[1/3] Installing JS package")
      run("yarn add https://github.com/luca-bassi/wired")

      puts('[2/3] Creating required folders')
      Dir.mkdir('app/components') unless Dir.exist?('app/components')
      Dir.mkdir('app/views/components') unless Dir.exist?('app/views/components')

      puts('[3/3] Copying example files')
      copy_file "_counter.html.erb", "app/views/components/_counter.html.erb"
      copy_file "counter_component.rb", "app/components/counter_component.rb"

      puts "*** FINISHED ***"
    end
  end
end