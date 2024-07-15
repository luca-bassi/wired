module Wired
  class BaseComponent < ActionView::Base
    # include Rails.application.routes.url_helpers
    # def default_url_options
    #   Rails.application.config.action_mailer.default_url_options
    # end

    attr_accessor :__id
    attr_accessor :__event_queue
    attr_accessor :__redirect_to

    def initialize(context, args)
      args.each do |k,v|
        instance_variable_set("@#{k}", v) # uso @ dentro componente
      end

      self.__event_queue = []

      super(context.lookup_context, state, nil)
    end

    def compiled_method_container
      self.class
    end

    def view(layout, locals={})
      view_renderer.render(self, { template: layout, locals: locals })
    end

    ### utility stuff

    def setId(id)
      self.__id = id
    end

    def state
      instance_values.reject{|k,v| k.in?(reserved_vars) }
    end

    def mount
      # noop
    end

    def redirect(url)
      self.__redirect_to = url
    end

    def redirect_to
      self.__redirect_to
    end

    def dispatch(event, data=nil)
      self.__event_queue << { event: event, data: data }
    end

    def event_queue
      self.__event_queue
    end

    def updateModel(name, value)
      parts = name.split('[').map{|k| k.gsub(/['"\]]/, '').split('.')}.flatten

      if parts.size > 1
        endValue = value
        value = {}

        parts.each_with_index do |part, i|
          if i > 0
            if(parts.size == i+1)
              value[part] = endValue
            else
              value[part] = {}
            end
          end
        end
      end

      currentVal = instance_variable_get(:"@#{parts[0]}")
      newVal = value.is_a?(Hash) ? currentVal.deep_merge(value.deep_symbolize_keys) : value

      instance_variable_set(:"@#{parts[0]}", newVal)
    end

    private

    def reserved_vars
      %w[
        _config
        lookup_context
        view_renderer
        current_template
        _assigns
        _controller
        _request
        _default_form_builder
        _routes
        view_flow
        output_buffer
        virtual_path
        __id
        __event_queue
        __redirect_to
      ]
    end
  end

  # always compile template views before render
  # this because we reinitialize components to update their state
  # and that makes the already compiled view method not present for the class
  # kinda ugly maybe but it works for now
  module AlwaysCompile
    def compile!(_view)
      @compiled = false if Rails.env.development?
      super
    end
  end
  ActionView::Template.prepend(AlwaysCompile)
end