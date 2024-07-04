import store from './store'
import nodeUtils from './nodeUtils';
import DOMItem from './domItem';

export default class Component {
  constructor(el){
    el.domNode().__wired = this
    this.id = el.getWiredAttribute("id")
    this.state = JSON.parse(this.extractState())
    // useful attrs
    this.name = this.state.refs.name

    this.init();
  }

  extractState(){
    const value = this.el.getWiredAttribute('initial')
    this.el.removeWiredAttribute('initial')
    return value
  }

  init() {
    this.walk(
      el => { nodeUtils.init(el, this) },
      el => { store.addComponent(new Component(el)) }
    )
  }

  requestUpdate(payload){
    console.log('updating', payload, this)
    fetch(`/wired/${this.name}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html, application/xhtml+xml',
        'X-CSRF-TOKEN': nodeUtils.csrfToken(),
      },
      body: JSON.stringify({
        update: payload,
        state: this.state
      })
    }).then((r) => r.json())
    .then((response) => {
      const state = response.state
      const thisComponent = store.getComponent(state.refs.id)
      thisComponent.handleResponse(response)
      console.log('updated', this, thisComponent.state)
    }).catch((err) => {
      console.log('UPDATE ERROR', err);
    })
  }

  handleResponse(response){
    this.state = response.state

    if(response.redirectTo){
      window.location.href = response.redirectTo
      return
    }

    this.el.morphHTML(this, response.html)

    /* https://github.com/livewire/livewire/blob/1.x/js/component/index.js#L188 */
    if(response.eventQueue.length){
      response.eventQueue.forEach(event => {
        const data = event.data ? event.data : {}
        const e = new CustomEvent(event.event, {
            bubbles: true,
            detail: data,
        })
        console.log('dispatching event', e)
        this.el.domNode().dispatchEvent(e)
      })
    }
  }

  walk(callbackDefault, callbackForNewComponent) {
    nodeUtils.walk(this.el.domNode(), node => {
        const el = new DOMItem(node)

        if (el.isSameNode(this.el)) {
            callbackDefault(el)
            return
        }

        if (el.isComponentRoot()) {
            callbackForNewComponent(el)
            return false
        }

        if (callbackDefault(el) === false) {
          return false
        }
    })
  }

  /* https://github.com/livewire/livewire/blob/1.x/js/component/index.js#L84 */
  get(name) {
    // The .split() stuff is to support dot-notation.
    return name
      .split('.')
      .reduce(
          (carry, dotSeperatedSegment) => carry[dotSeperatedSegment],
          this.state.data
      )
  }

  get el(){
    return new DOMItem(document.querySelector(`[wired\\:id="${this.id}"]`))
  }
}