/**
 * Timer object notifing when it expires. Pause and resume supported.
 *
 * Copyright (c) 2008, 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('spaceship.utils.Timer');

dojo.declare('spaceship.utils.Timer', null, {
    // timer duration in seconds
    duration : 30,
    constructor: function(args) {
        dojo.mixin(this, args);
        // convert to milliseconds for internal use
        this.duration *= 1000;
        // timeout handle
        this._timer = null;
        // deferred notifier
        this._deferred = new dojo.Deferred();
    },
    
    /**
     * Called when the timer expires. Notifies listeners about the deferred 
     * result.
     */
    onTimeout: function() {
        this._deferred.callback(this);
    },
    
    /**
     * Starts the timer running.
     *
     * @return Deferred notification
     */
    start: function() {
        if(this._timer != undefined) throw new Error('already started');
        // store starting time
        this._startedAt = new Date();
        // start the timer
        this._timer = setTimeout(dojo.hitch(this, 'onTimeout'), this.duration);
        // return the deferred result
        return this._deferred;
    },
    
    /**
     * Permanently stops the timer.
     */
    stop: function() {
        // stop the timer
        clearTimeout(this._timer);
        // return deferred error
        try {
            this._deferred.errback(this._timer);
        } catch(e) {
            // ignore if already called
        }
    },
    
    /**
     * Pauses the timer.
     */
    pause: function() {
        // stop the timer
        clearTimeout(this._timer);
        // compute time elapse
        var elapsed = new Date - this._startedAt;
        // adjust duration to remaining time
        this.duration -= elapsed;
        if(this.duration < 0) this.duration = 0;
    },
    
    /**
     * Resumes the timer.
     */
    resume: function() {
        // start a timer for the new duration
        this._timer = setTimeout(dojo.hitch(this, 'onTimeout'), this.duration);
    }
});