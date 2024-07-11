import store from "./store"
import Alpine from 'alpinejs'

let callfunc
function setCallFunc(callback) {
  callfunc = callback
}

export function generateWiredObject(component, state){
  return new Proxy({}, {
    get(target, property) {
      if (property in state) {
        return state[property]
      }else{
        // function call
        return callfunc(component)(property)
      }
    },

    set(target, property, value) {
      if (property in state) {
        state[property] = value
      }

      return true
    },
  })
}

Alpine.magic('wired', (el, { cleanup }) => {
  let component

  return new Proxy({}, {
    get(target, property) {
        if(! component) component = store.closestComponent(el)

        // if (['$entangle', 'entangle'].includes(property)) {
        //   return generateEntangleFunction(component, cleanup)
        // }

        return component.$wired[property]
    },

    set(target, property, value) {
      if(! component) component = store.closestComponent(el)

      component.$wired[property] = value

      return true
    },
  })
})

setCallFunc((component) => (property) => (...params) => {
  component.requestUpdate({type: 'callMethod', data: {method: property, params}});
})