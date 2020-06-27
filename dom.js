
// Lets define what 'application' mean:
function application(...elements) {
  // simply append everything to the body tag.
  elements.forEach(function add(element) {
    document.body.appendChild(element);
  });
}

// Now to the other helper functions input and button
function element(
  type,
  attributes = {}, ...elements) {
  const element = document.createElement(type);


  Object.entries(attributes).forEach(function add_attribute(entry) {
    let [key, value] = entry;
    if(key === 'style') {
      value = Object.entries(value).reduce(function(r, e) {
        const [k,v] = e;
        r += `${k}:${v};`;
        return r;
      }, '');
    }
    element[key] = value;
  });

  elements.forEach(function add(_) {
    if(_ === null || _ === undefined) { return; }

    if(typeof _ === "string" ||
       typeof _ === "number") {
      element.textContent = _;
    } else if(_ instanceof Element) {
      element.appendChild(_);
    } else if(typeof _ === "function") {
      element.appendChild(_());
    } else if (typeof _ === "object") {
      const [key, value] = Object.entries(_)[0];
      element[key] = value;
      element.appendChild(value);
    } else {
      console.log(_);
      console.log(new Error("Unknown element child type"));
    }

  });

  return element;
}

function create_tag_function(tag_name) {
  return function tag(attributes = {}, ...elements) {
    return element(tag_name, attributes, ...elements);
  };
}

function create_bus(element) {
  if(element === undefined) {
    element = a();
  }

  const registry = [];

  function register(name) {
    registry.push(name);
    return name;
  }

  function fire(name, detail) {
    if(registry.find(function predicate(item) { return item === name })) {
      return element.dispatchEvent(new CustomEvent(name, {detail}));
    } else {
      console.error(`Uknown event "${name}"`);
    }
  }

  function on(name, fn) {
    return element.addEventListener(name, function(event) {
      return fn(event.detail);
    });
  }

  return { fire, on, register };

}

const bus = create_bus(document);

export default new Proxy({
  application,
  bus,
  create_bus,
  element
}, {
  get: function (target, prop, receiver) {
    return Reflect.get(...arguments) || create_tag_function(prop);
  },
});
