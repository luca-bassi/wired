import DOMItem from "./domItem"

export default {
  rootElementsWithNoParents(){
    const allEls = Array.from(document.querySelectorAll(`[wired\\:id]`))
    const onlyChildEls = Array.from(document.querySelectorAll(`[wired\\:id] [wired\\:id]`))
  
    return allEls.filter(el => ! onlyChildEls.includes(el)).map(el => new DOMItem(el))
  },

  csrfToken(){
    return document.head.querySelector('meta[name="csrf-token"]').content
  },

  init(el, component){
    const acceptedEvents = ['click', 'input', 'change']

    // model behavior
    if(el.hasWiredAttribute('model')){
      // no file uploads
      if (
        el.domNode().tagName.toLowerCase() === 'input' &&
        el.domNode().type === 'file'
      )
        return

      // set initial value
      el.setValueFromModel(component)
      // add event listener
      const event =
        el.domNode().tagName.toLowerCase() === 'select' ||
        ['checkbox', 'radio'].includes(el.domNode().type)
          ? 'change'
          : 'input'
      el.addEventListener(event, function(e){
        const el = new DOMItem(e.target)
        const model = el.getWiredAttribute('model')
        const value = el.inputValue(component)
        component.requestUpdate({type: 'syncInput', data: {model, value}});
      })
    }

    // check generic events
    acceptedEvents.forEach(function(ename){
      if(el.hasWiredAttribute(ename)){
        el.addEventListener(ename, function(e){
          let action = el.getWiredAttribute(ename);
          const { method, params } = wired.parseOutMethodAndParams(action)

          component.requestUpdate({type: 'callMethod', data: {method, params}});
        });
      }
    })
  },

  walk(startNode, callback){
    if (callback(startNode) === false) return

    let node = startNode.firstElementChild

    while (node) {
      this.walk(node, callback)
      node = node.nextElementSibling
    }
  }
}