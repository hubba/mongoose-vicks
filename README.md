Mongoose Vicks Vapo Rub
=======================

This Module will load a plugin will allow Mongoose models to have durable
commits. MongoDB has the ability to enforce safe commits so that actions
will be propagated to the other servers.

The name is an allusion to giving mongooses vics vapo rub help them get 
(along)[http://gizmodo.com/zoo-keepers-use-vicks-vap-o-rub-to-help-mongooses-get-1599938029]. 

Profiles
========

You can set up many profiles and have a switch that will activate the profile based 
on the node environment var.

Please see the tests for usage.

When the plugin is loaded it will only affect schemas initialized with a durable
property.

Initialization
==============

There are a variety of options for the number of slaves that the transaction must
commit on before acknowledging it as a successful action.

```js
    const Vicks = require('mongoose-vicks');
    const mongoVicks = Vicks();
    // This will set the timeout to be 1 second, the number of slaves
    // to be 0 and data to be written to the journal.
    mongoVicks.addDurabilityProfile('test',0, 1000, true);
    
    // Set the profile to be test
    mongoVicks.setDurabilityProfile('test');
    mongoVicks.loadPlugin(mongoose);
```

After loading the plugin then you can just set a property on a mongoose schema and
the options will automatically apply.

```js

    const DurableSchema = new Schema({
        name: {
            type: String,
            unique: true
        },

        age: {
            type: Number
        },

        address: {
            type: String,
            unique: true
        }
    });

    // The property needs to be set as true
    DurableSchema.durable = true;
```

Testing
-------

 To run the tests run `npm test`.