Wired::Engine.routes do
  post '/wired/:name/update', to: 'updates#update'
end
