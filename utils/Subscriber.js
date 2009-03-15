/**
 * Mixin for classes subscribing to lots of dojo.publish topics. Eases 
 * subscription and cleanup.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.utils.Subscriber');

dojo.declare('spaceship.utils.Subscriber', null, {
    constructor: function() {
        this._subs = [];
    },
    
    unsubscribeAll: function() {
        for(var i=0; i < this._subs.length; i++) {
            dojo.unsubscribe(this._subs[i]);
        }
    },
    
    subscribe: function(topic, mtd) {
        this._subs.push(dojo.subscribe(topic, this, mtd));
    }
});