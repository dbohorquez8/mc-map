var Location = (function(repository){
  var generateGuid = function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };
  
  var create = function(attributes) {
    return repository
      .ref('locations/' + generateGuid())
      .set(attributes); 
  };
  
  var list = function() {
    return repository
      .ref('locations')
      .once('value');
  };
  
  var update = function(id, attributes) {
    return repository
      .ref('locations/' + id)
      .set(attributes);
  };

  
  var remove = function(id) {
    return repository
      .ref('locations/' + id)
      .remove();
  };
  
  return {
    create: create,
    list: list,
    update: update,
    remove: remove
  };
})(firebase.database());

//example

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

//Delete
Location
.update(id, attributes)
.then(function(){});
*/