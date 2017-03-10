// Copyright 2017 Hubba, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


const assert = require('assert');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Vics = require('./../index.js');
const crypto = require('crypto');
const Q = require('q');

mongoose.Promise = Q;
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

DurableSchema.durable = true;

describe('Mongoose Vics', function() {

    beforeEach(function(done){
        this.mongoVicks = Vics();

        mongoose.connect('mongodb://127.0.0.1/mongoose-vics-'
            + crypto.randomBytes(8).toString('hex')).then(() => { done(); },done);
    });

    it('Should be able to define a schema and add durability options', function() {
        const globals = this;

        globals.mongoVicks.addDurabilityProfile('test',0, 1000, true);
        globals.mongoVicks.setDurabilityProfile('test');
        globals.mongoVicks.loadPlugin(mongoose);

        var Durable = mongoose.model('Durable'+ crypto.randomBytes(8).toString('hex'), DurableSchema);
        assert(DurableSchema.durable, 'We should have a durable object');
        assert(DurableSchema.options.safe, 'Should have safe params set');
        assert.equal(DurableSchema.options.safe.j, 1 );
        assert.equal(DurableSchema.options.safe.w, 0 );
    });

    it('Should throw if selecting a profile that is not initialized',function() {
        const globals = this;
        
        globals.mongoVicks.addDurabilityProfile('test',0, 1000, true);
        globals.mongoVicks.addDurabilityProfile('test2',0, 1000, true);
        assert.throws(()=>{
            globals.mongoVicks.setDurabilityProfile('testObject')
        }, Error, 'You have not create the durability profile: testObject');
    });

    it('Should throw if no profile is selected',function() {
        const globals = this;

        globals.mongoVicks.addDurabilityProfile('test', 0, 1000, true);
        globals.mongoVicks.addDurabilityProfile('production', 0, 1000, true);

        assert.throws(() => {
            globals.mongoVicks.loadPlugin(mongoose)
        }, Error, 'You must set an active durability profile');
    });

    it('Should allow setting mongo write profile',function(done) {
        const globals = this;

        globals.mongoVicks.addDurabilityProfile('production', 'majority', 1000, true);
        globals.mongoVicks.setDurabilityProfile('production');
        globals.mongoVicks.loadPlugin(mongoose);

        var Durable = mongoose.model('Durable'+ crypto.randomBytes(8).toString('hex'), DurableSchema);
        Durable.create({
            name: crypto.randomBytes(20).toString('hex'),
            address: crypto.randomBytes(20).toString('hex')
        }).then((model)=>{
            assert(model, 'Model should be created');
            done();
        });
    });
});