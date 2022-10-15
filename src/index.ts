/**
 * observer callback for when a property changes on an ObservableObject
 */
export type ObjectObserver = (
  /** the value of the property that changed on the ObservableObject */
  value: string,

  /** the name of the property that changed on the ObservableObject */
  propertyChanged: PropertyKey,
  
  /** the containing object which had the change */
  object: object
) => void

// This line is needed because Proxy is not designed to be an extendable object
// hopefully this never comes back to bite us in the butt
// @ts-expect-error
Proxy.prototype = Proxy.prototype || Proxy.__proto__;

/**
 * @description An object which adding/changing/removing values fires and observer.
 * @param {observableObjectObserver} observer - An observer function that fires when an immediate or child property changes.
 * @param {object} [initialData] - Initialize ObservableObject with a POJO
 */
// @ts-expect-error
export class ObservableObject extends Proxy {
  constructor (observer: ObjectObserver, initialData = {}) {
    if (typeof observer !== 'function') {
      throw new Error (`new ObservableObject(<observer>, <[initialData]>) :: \`observer\` is a required callback, got "${observer}"`)
    }
    
    // recursively map through children to ensure we are listening to them if they change
    const baseObj = Array.isArray(initialData) ? initialData : Object.fromEntries(Object.entries(initialData).map(([key, value]) => {
      if (value instanceof Object && !(value instanceof Function)) {
        return [key, new ObservableObject(observer, value)]
      }
      return [key, value]
    }));
    
    super(baseObj, {
      get: function (obj: any, prop: PropertyKey): any {
        return obj[prop]
      },
      
      set: function (obj: any, prop: PropertyKey, value: any) {
        let old = obj[prop];
        if (old !== value) {
          obj[prop] = value;
          if (value instanceof Object && !(value instanceof Function)) {
            obj[prop] = new ObservableObject(observer, value)
          } else {
            obj[prop] = value;
          }
          observer(value, prop, obj)
        }
        return obj[prop];
      }
    });
  }
};
