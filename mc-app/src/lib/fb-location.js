export default {
  init(repository) {
    this.repository = repository;
  },

  generateGuid() {
    const s4 = function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    };
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  },

  create(attributes) {
    return this.repository.ref(`locations/${this.generateGuid()}`).set(attributes);
  },

  list() {
    return this.repository
    .ref('locations')
    .once('value');
  },

  update(id, attributes) {
    return this.repository
    .ref(`locations/${id}`)
    .set(attributes);
  },

  remove(id) {
    return this.repository
    .ref(`locations/${id}`)
    .remove();
  },
};

/*

//List
Location.list().then(function(a){
   console.log(a.val());
});

id = "a315c2fd-aede-dc53-ce40-682ab2a03a62";
attributes = {
    description: "el test",
    href: "refff",
    iconIndex: "icon",
    owner: "test",
    type: "",
    x: "100",
    y: "200"
  }

//Create
Location
.create(attributes)
.then(function(){});

//Update
Location
.update(id, attributes)
.then(function(){});

//Deconste
Location
.update(id, attributes)
.then(function(){});
*/
