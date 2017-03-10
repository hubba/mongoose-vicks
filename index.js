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

const Vicks = function() {
    if (this instanceof Vicks) {
        this.mongoDurabilityProfiles = {};
        this.mongoSelectedProfile = undefined;
    } else {
        return new Vicks();
    }
}
/**
 * 
 * @param {string} profileName The name of the profile.
 * @param {string|number} profileMinNodesReplicated The min number of nodes to replicate to. This can be a numeric value or 'majority'.
 * @param {number} replicationTimeout The timeout to replicating to each node.
 * @param {boolean} journaled should success of action only be reported after the journal has been written?
 */
Vicks.prototype.addDurabilityProfile = function (profileName, profileMinNodesReplicated, replicationTimeout, journaled) {
    assert(profileName, 'You must pass a non empty profileName. ');
    
    this.mongoDurabilityProfiles[profileName] = {
        j: !!journaled ? 1 : 0,
        w: profileMinNodesReplicated,
        wtimeout: replicationTimeout
    };
};

/**
 *
 * @param {string} profileName The name of the profile you would like to use.
 */
Vicks.prototype.setDurabilityProfile = function(profileName) {
    assert(profileName, 'You must set the profile to a valid one.');
    assert(this.mongoDurabilityProfiles[profileName], 'You have not create the durability profile: ' + profileName);

    this.mongoSelectedProfile = profileName;
};

/**
 * 
 * @param {Mongoose::Schema} schema The schema that you need to attach.
 */
Vicks.prototype.mongoData = function(schema) {
    if (typeof schema.durable !== 'undefined' && schema.durable) {
        schema.options.safe = this.mongoDurabilityProfiles[this.mongoSelectedProfile];
    }
};

/**
 * 
 * @param {Mongoose} mongoose The mongoose to add plugin to.
 */
Vicks.prototype.loadPlugin = function(mongoose) {
    assert(mongoose, 'You must pass a valid mongoose instance to load vicks plugin');
    assert(this.mongoSelectedProfile, 'You must set an active durability profile.');

    mongoose.plugin(this.mongoData.bind(this));
};

module.exports = exports = Vicks;