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
            objectClass = meta[:class].constantize
            raise StandardError.new("Invalid property class: #{meta[:class]}") unless objectClass.superclass.name == 'ApplicationRecord'

            # try retrieve results by query
            # 1. array: collection -> where id
            # 2. hash: id -> find else new by params
            value.is_a?(Array) ? objectClass.where(id: value.map{|r| r[:id]}) : (value[:id].present? ? objectClass.find(value[:id]) : objectClass.new(value))
          when 'i'
            value.to_i
          when 'f'
            value.to_f
          when 'd'
            Date.parse(value)# rescue Date.new
          when 'dt'
            DateTime.parse(value)# rescue DateTime.new
          else
            value # no need to cast
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