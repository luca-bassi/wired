class UpdatesController < ApplicationController

  def update
    state = request.parameters[:state].deep_symbolize_keys
    updates = request.parameters[:updates]

    component = Wired::Manager.fromState(self, state)

    updates.each do |update|
      if update[:type] == 'syncInput'
        input = update[:data]
        model = input[:model]
        value = input[:value]

        component.updateModel(model, value)
      elsif update[:type] == 'callMethod'
        call = update[:data]
        callMethod = call[:method]
        callArgs = call[:params] || []
    
        component.send(callMethod, *callArgs)
      end
    end

    html = component.render_layout
    stateData = component.state
    redirectTo = component.redirect_to
    eventQueue = component.event_queue

    render json: {
      html: html,
      redirectTo: redirectTo,
      eventQueue: eventQueue,
      state: {
        data: stateData,
        refs: state[:refs] # forward references from req
      }
    }
  end
end