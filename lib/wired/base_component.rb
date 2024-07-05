module Wired
  class BaseComponent < ActionView::Base
    attr_accessor :__id
    attr_accessor :__original_view_context

    attr_accessor :__event_queue
    attr_accessor :__redirect_to

    def initialize(args)
      args.each do |k,v|
        instance_variable_set("@#{k}", v) # uso @ dentro componente
      end

      mount

      self.__event_queue = []
    end

    ### utility stuff

    def setId(id)
      self.__id = id
    end

    def state_variables
      instance_variables - reserved_vars
    end

    def state
      # devo passarli alla vista/js senza @
      # todo farlo in modo più carino
      state_variables.map{|v| [v[1..-1], instance_variable_get(v)]}.to_h.symbolize_keys
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

    ### rendering stuff

    def setViewContext(vc)
      self.__original_view_context = vc
    end

    def render_in(layout, locals={})
      locals = state.merge(locals)
      __original_view_context.render(layout, locals)
    end

    private

    def reserved_vars
      [:@__id, :@__original_view_context, :@__event_queue, :@__redirect_to]
    end
  end
end