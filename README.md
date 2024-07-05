# Wired
TODO: Short description and motivation.

## Usage
This gem **replaces** the turbo ecosystem, you cannot use both at the same time (and you shouldn't want to)

A lot (all) of the ideas and behaviours are inspired by (copied from) Livewire.

You can create a new component with
```bash
$ rails g wired:new CamelCaseName
```
This will create a rails component `CamelCaseNameComponent` in `app/components/camel_case_name_component.rb`and a view file in `app/views/components/_camel_case_name.html.erb`.

To render your component in a page simply do
```html
<%== Wired::Manager.mount(self, 'CamelCaseName', *your_arguments={}) %>
```
You can treat the view file like a normal rails view (because it is), also you'll be able to use your arguments as instance variables inside your component.rb

With the current implementation, while you have to reference these as instance variables to use them in the rb, you have to remove the @ and treat them as locals inside your view file (`@var` becomes `var` inside the `views/components/_my_component.html.erb`)  
I dont like this either, but it's a wip.

### 1. Mount
To initialize variables you can use the mount method inside the component file:
```ruby
# app/components/form_component.rb
class FormComponent < Wired::BaseComponent

  def mount
    @fields = {}
    @relations = []
  end

  def render_layout
    render_in('components/form')
  end
end
```

This will run only once at initialization, before anything else. You might want to use it like this:
```html
<!-- your_view.html.erb -->
<%== Wired::Manager.mount(self, 'User', { id: params[:id] }) %>
```
```ruby
# app/components/user_component.rb
class UserComponent < Wired::BaseComponent

  def mount
    @user = User.find(@id)
  end

  # ...
end
```

### 2. Render
The method `render_layout` needs to be present and needs to contain the instruction `render_in(view)` to know which view file to render.

This method is run every time your component's state updates or one of its function gets called. You're free to do any elboration you might need before the `render_in` instruction, as well as to provide additional parameters to pass to your view (as locals):
``` rb
# app/components/example_component.rb

# ...

def render_layout
  items = User.all
  items = items.where("email ILIKE ?", "%#{@search}%") if @search.present?

  render_in('components/example', items: items)
end
```

Just be aware that this will run on every update.

### 3. Modeling
In alpine fashion you can bind inputs to component variables. Instead of using `x-model` use `wired:model`:
```html
<!-- app/views/components/_form.html.erb -->
<div>
  <input type="text" wired:model="fields['name']" placeholder="name">
  <input type="text" wired:model="fields.surname" placeholder="surname">
  <!-- ... -->
</div>
```
```ruby
# app/components/form_component.rb
class FormComponent < Wired::BaseComponent

  def mount
    @fields = {}
  end

  # ...
end
```
Here the component variable `@fields` will be updated live every time the two inputs are typed in.  Note the javascript syntax for the `wired:model` attribute

### 4. Actions
At this moment the only supported triggering actions are:
- input
- change
- click

For any of these you can attach the attribute `wired:action` to an html element to call a component function:
```html
<!-- app/views/components/_form.html.erb -->
<div>
  <input type="text" wired:model="fields['name']" placeholder="name">
  <input type="text" wired:model="fields.surname" placeholder="surname">
  <!-- ... --->
  <button type="button" wired:click="submit">submit</button>
</div>
```
```ruby
# app/components/form_component.rb
class FormComponent < Wired::BaseComponent
  def mount
    @fields = {}
  end

  def submit
    User.create(@fields)
    # ...
  end

  # ...
end
```
Clicking on the button will result in the execution of the `submit` function.

### 5. Redirect
You might want to redirect to a different page or controller after an action or update. To do so simply call the `redirect` function like so:
```ruby
# ...
def submit
  User.create(@fields)
  # ...
  redirect(users_path)
end
```

### 6. Dispatch
You also might want to trigger javascript events on your view as consequences of component actions. To do simply call the `dispatch` function like so:
```ruby
# ...
def delete
  user = User.find(@id)
  user.destroy
  # ...
  dispatch('user-deleted', {user: user})
end
```
This will dispatch a customEvent "user-deleted" with the details provided, which can be listened for like this:
```js
// main.js
window.addEventListener('user-deleted', function(e){
  alert(`deleted user: ${e.detail.user.surname} ${e.detail.user.name}`);
});
```

### 7. Nesting
It is possible to render components inside other components, just call the mount function:
```html
<!-- your_view.html.erb -->
<%== Wired::Manager.mount(self, 'Parent') %>
```
```html
<!-- app/views/components/_parent.html.erb -->
<div>
  <h1>I'm the parent</h1>

  <%== Wired::Manager.mount(self, 'Child') %>
</div>
```
```html
<!-- app/views/components/_child.html.erb -->
<div>
  <h1>And I'm the child</h1>

  <!-- ... --->
</div>
```
A few notes:
1. Only use this if the child **needs** wired functionalities, most times a normal rails partial will be sufficient
2. Currently there is no parent-children communication, they live independently to one another

### 8. Alpine
Wired, much like livewire, ships with alpinejs and all its plugins already enabled and it's designed to work seamlessly with it

## Installation
Add this line to your application's Gemfile:

```ruby
gem "wired", git: "https://github.com/luca-bassi/wired.git"
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
* entangle / $wired
* parent-children communication

and all the `TODO` you find in the source
