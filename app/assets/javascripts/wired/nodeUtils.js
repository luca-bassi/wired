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

  debounce(func, wait){
    var timeout
    return function () {
        var context = this, args = arguments
        var later = function () {
            timeout = null
            func.apply(context, args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
  },

  init(el, component){
    const acceptedEvents = ['click', 'input', 'change', 'submit']

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

      // remove previous instance
      if(el.domNode().directives['model']){
        el.removeEventListener(event, el.domNode().directives['model'])
        delete el.domNode().directives['model']
      }
      el.addEventListener(event, el.domNode().directives['model'] = function(e){
        const model = el.getWiredAttribute('model')
        const value = el.inputValue(component)

        component.requestUpdate({type: 'syncInput', data: {model, value}});
      })
    }

    // check generic events
    acceptedEvents.forEach(function(ename){
      if(el.hasWiredAttribute(ename)){
        // remove previous instance
        if(el.domNode().directives[ename]){
          el.removeEventListener(ename, el.domNode().directives[ename])
          delete el.domNode().directives[ename]
        }
        el.addEventListener(ename, el.domNode().directives[ename] = function(e){
          if(ename == 'submit'){ e.preventDefault(); } /* https://github.com/livewire/livewire/blob/main/js/directives/wire-wildcard.js#L12 */

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