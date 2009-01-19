/**
 * Barrier object notifing observers after all registered responders report.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.utils.Barrier');

dojo.declare('spaceship.utils.Barrier', null, {
    // array of callbacks
    _chain: null,
    // result values keyed by responder name
    _results: null,
    // responder status keyed by name
    _responders : null,
    constructor: function() {
        this._chain = [];
        this._results = {};
        this._responders = {};
    },
    
    addResponder: function(name) {
        if(name in this._responders) {
            throw new Error('responder already registered');
        }
        this._responders[name] = false;
    },
        
    addCallback: function(context, method) {
        // clean way to store method or function
        this._chain.push(dojo.hitch.apply(dojo, arguments));
    },
    
    notify: function(name, value) {
        // do this async so other responders can register before we determine
        // if all have reached the barrier
        setTimeout(dojo.hitch(this, this._asyncNotify, name, value));
    },
    
    _asyncNotify: function(name, value) {
        this._results[name] = value;
        this._responders[name] = true;
        foobar = this._chain;
        for(var key in this._responders) {
            if(!this._responders[key]) return;
        }
        // invoke the callback chain if we make it here
        for(var i=0; i < this._chain.length; i++) {
            try {
                this._chain[i](this._results);
            } catch(e) {
                console.warn(e);
            }
        }
    }
});