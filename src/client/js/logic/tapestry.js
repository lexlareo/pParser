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
  hook = (name, cb, nodeObj) => {
    // nodeObj is used if we need to invoke any method associated to the nodeObj, passing it as a second parameter
    const varObj = this.vars[name].hooks;
    varObj.push({
      cb: cb,
      node: nodeObj,
    });
  };
  unhook = (name, cb) => {
    const varObj = this.vars[name];
    varObj.hooks = varObj.hooks.filter((hook) => hook.cb !== cb);
  };
  clearHooks = (name) => {
    const varObj = this.vars[name];
    varObj.hooks = [];
  };
}
