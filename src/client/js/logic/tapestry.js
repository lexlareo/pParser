/**
 * Tapestry class to manage state and trigger callbacks when state changes.
 * Exports a Tapestry class with methods to:
 * - Add state variables
 * - Set state variable values
 * - Get state variable values
 * - Register callbacks to be triggered when state variables change
 * - Unregister previously registered callbacks
 */
export class Tapestry {
  constructor() {
    this.vars = {};
  }
  add(name, value) {
    this.vars[name] = { value: value, hooks: [] };
  }
  s;
  set(name, value = null) {
    if (name in this.vars) {
      this.vars[name].value = value;
      this.callHooks(name);
    }
  }
  get(name) {
    if (name in this.vars) {
      return this.vars[name].value;
    }
    return null;
  }
  callHooks(name) {
    const varObj = this.vars[name];
    varObj.hooks.forEach((hook) => {
      hook.cb(varObj.value, varObj.node);
    });
  }
  /**
   * Registers a callback to be triggered when the state variable with the given name changes.
   * The callback will receive the new value and the nodeObj passed here.
   * An optional id can be passed to replace an existing hook instead of adding a new one.
   */
  hook = (name, cb, nodeObj, id) => {
    // nodeObj is used if we need to invoke any method associated to the nodeObj, passing it as a second parameter
    const varObj = this.vars[name].hooks;
    const hookID = id ? this.findHook(varObj, id) : null;
    if (hookID) {
      hookID.cb = cb;
    } else {
      varObj.push({ cb: cb, nodeObj: nodeObj, id: id });
    }
  };
  unhook = (name, cb) => {
    const varObj = this.vars[name];
    varObj.hooks = varObj.hooks.filter((hook) => hook.cb !== cb);
  };
  clearHooks = (name) => {
    const varObj = this.vars[name];
    varObj.hooks = [];
  };

  findHook = (array, value) => {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === value) {
        return array[i];
      }
    }
    return null;
  };
}
