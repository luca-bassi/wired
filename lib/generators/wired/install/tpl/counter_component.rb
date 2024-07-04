class CounterComponent < Wired::BaseComponent

  def mount
    @total = 0
  end

  def add
    @total += 1
  end

  def render_layout
    render_in('components/counter')
  end
end