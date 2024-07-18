module Wired
  class Manager
    def self.mount(context, name, args={})
      component = build(context, name, args)

      id = SecureRandom.hex
      component.setId(id)

      component.mount

      html = component.render_layout
      state = component.serialized_state

      initialState = {
        data: state,
        refs: {
          id: id,
          name: name.underscore,
        },
      }

      injectWiredIntoHtml(html, initialState)
    end

    def self.fromState(context, state)
      name = state[:refs][:name]
      data = restore(state[:data])

      component = build(context, name, data)
      component.setId(state[:refs][:id])

      return component
    end

    def to_s
      @html
    end

    private

    def self.build(context, name, args)
      className = "#{name.camelcase}Component"
      componentClass = className.safe_constantize
      raise "component #{name} not found" unless componentClass

      return componentClass.new(context, args)
    end

    def self.restore(payload)
      state = {}
      payload.each do |var, data|
        data = [nil, data[0]] if data.size == 1 # rescue nil value  filtered from request

        value, meta = data
        # TODO: help
        obj = case meta[:type]
          when 'c'
            meta[:class].constantize.new(value) rescue value
          when 'i'
            value.to_i
          when 'f'
            value.to_f
          when 'd'
            Date.parse(value) rescue Date.new
          when 'dt'
            DateTime.parse(value) rescue DateTime.new
          else
            value
        end

        state[var] = obj
      end

      return state
    end

    def self.injectWiredIntoHtml(html, initialState)
      match = html.match(/<([a-zA-Z]*)/)
      raise 'No root tag for component' unless match

      rootTag = match[0]

      @html = html.sub(rootTag, "#{rootTag} wired:id='#{initialState[:refs][:id]}' wired:initial='#{initialState.to_json}'")
    end
  end
end