import store from "./store"

export default class DOMItem {
  constructor(el){
    this.el = el
  }

  domNode(){
    return this.el
  }

  isSameNode(el){
    if (typeof el.domNode === 'function') {
      return this.el.isSameNode(el.domNode())
    }

    return this.el.isSameNode(el)
  }

  isComponentRoot() {
    return this.el.hasAttribute('wired:id')
  }

  hasWiredAttribute(attribute) {
    return this.el.hasAttribute(`wired:${attribute}`)
  }

  getWiredAttribute(attr){
    return this.el.getAttribute(`wired:${attr}`)
  }

  removeWiredAttribute(attr){
    return this.el.removeAttribute(`wired:${attr}`)
  }

  addEventListener() {
    return this.el.addEventListener(...arguments)
  }

  /* preso paro paro da lw1 */
  inputValue(component){
    if (this.el.type === 'checkbox') {
      const modelName = this.getWiredAttribute('model')
      var modelValue = component.get(modelName)

      if (Array.isArray(modelValue)) {
        if (this.el.checked) {
          modelValue = modelValue.includes(this.el.value)
            ? modelValue
            : modelValue.concat(this.el.value)
        } else {
          modelValue = modelValue.filter(
            item => item !== this.el.value
          )
        }

        return modelValue
      }

      if (this.el.checked) {
        return this.el.getAttribute('value') || true
      } else {
        return false
      }
    } else if (this.el.tagName === 'SELECT' && this.el.multiple) {
      return Array.from(this.el.options)
                  .filter(option => option.selected)
                  .map(option => {
                      return option.value || option.text
                  })
    }

    return this.el.value
  }

  setValueFromModel(component){
    const modelName = this.getWiredAttribute('model')
    const modelValue = component.get(modelName)

    // undefined is nop
    if (modelValue === undefined) return

    this.setValue(modelValue)
  }

  setValue(value){
    if (this.el.type === 'radio') {
      this.el.checked = this.el.value == value
    } else if (this.el.type === 'checkbox') {
      if (Array.isArray(value)) {
        // I'm purposely not using Array.includes here because it's
        // strict, and because of Numeric/String mis-casting, I
        // want the "includes" to be "fuzzy".
        let valueFound = false
        value.forEach(val => {
          if (val == this.el.value) {
            valueFound = true
          }
        })

        this.el.checked = valueFound
      } else {
        this.el.checked = !!value
      }
    } else if (this.el.tagName === 'SELECT') {
        this.updateSelect(value)
    } else {
        this.el.value = value
    }
  }

  updateSelect(value) {
    const arrayWrappedValue = [].concat(value).map(value => {
      return value + ''
    })

    Array.from(this.el.options).forEach(option => {
      option.selected = arrayWrappedValue.includes(option.value)
    })
  }

  /* https://github.com/livewire/livewire/blob/main/js/morph.js */
  /* https://github.com/livewire/livewire/blob/1.x/js/component/index.js#L272 */
  morphHTML(component, html){
    let wrapperTag = this.el.parentElement
        // If the root element is a "tr", we need the wrapper to be a "table"...
        ? this.el.parentElement.tagName.toLowerCase()
        : 'div'
    let wrapper = document.createElement(wrapperTag) // placeholder for content
    wrapper.innerHTML = html

    let parentComponent = store.closestComponent(this.el.parentElement)
    parentComponent && (wrapper.__wired = parentComponent)

    let to = wrapper.firstElementChild
    to.__wired = component

    Alpine.morph(this.el, to, {
      updating: (el, toEl, childrenOnly, skip) => {
        if (typeof el.hasAttribute !== 'function') return

        // Children will update themselves.
        if (el.hasAttribute('wired:id') && el.getAttribute('wired:id') !== component.id) return skip()

        if (el.hasAttribute('wired:id')){
          toEl.__wired = component
          toEl.setAttribute('wired:id', component.id)
        }
        // if(Alpine.$data(el)){
        //   window.Alpine.cloneNode(el, toEl) // should clone x-data
        // }
      }
    })
  }
}