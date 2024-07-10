module Wired
  class Manager
    def self.mount(context, name, args={})
      component = build(context, name, args)

      id = SecureRandom.hex
      component.setId(id)

      component.mount

      html = component.render_layout

      initialState = {
        data: component.state,
        refs: {
          id: id,
          name: name.underscore,
        },
      }

      injectWiredIntoHtml(html, initialState)
    end

    def self.fromState(context, state)
      name = state[:refs][:name]
      data = state[:data]

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

    def self.injectWiredIntoHtml(html, initialState)
      match = html.match(/<([a-zA-Z]*)/)
      raise 'No root tag for component' unless match

      rootTag = match[0]

      @html = html.sub(rootTag, "#{rootTag} wired:id='#{initialState[:refs][:id]}' wired:initial='#{initialState.to_json}'")
    end
  end
end