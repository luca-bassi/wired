# Wired
TODO: Short description and motivation.

## Usage
TODO: How to use my plugin.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "wired", git: "git@github.com:luca-bassi/wired.git"
```

And then execute:
```bash
$ bundle
```

Run the installer:
```bash
$ rails g wired:install
```

Finish by:
1. copy into your `config/application.rb`:
```ruby
config.autoload_paths << Rails.root.join('/app/components')
```
2. import the javascript part of the gem in your main js file:
```js
import 'wired'
```
3. source the update component route in `config/routes.rb`:
```ruby
mount Wired::Engine, at: '/wired'
```

You should remove **all** your Alpinejs imports and dependencies (from `package.json` or your main js files), wired ships with everything by default and it may lead to conflicts.

## TODOS
* view partials without `local_assigns`
* view variables with @
* ~~handle nested components~~
* ~~preserve alpine~~
* ~~model syntacjson (attr.subattr[key])~~
* ~~custom mount method for component~~
* directive modifiers like alpine
* ~~dispatch event component->view~~
* ~~redirect~~

and all the `TODO` you find in the source
