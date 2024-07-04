Wired::Engine.routes.draw do
  post ':name/update', to: 'updates#update'
end
