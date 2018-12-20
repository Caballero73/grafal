
function _NotificationCenter() {
    // saves {notificationName: <string>, fn: <function>}
    this.observers = [];
};
/**
 * Posts a new notification with the given
 * name. Optionally, sends the obj parameter
 * as a parameter to the notificated objects.
 * 
 * @param {type} name
 * @param {type} obj
 * @returns {undefined}
 */
_NotificationCenter.prototype.notify = function(name, obj) {
    _.each(_.filter(this.observers, function(o) {
        return o.notificationName == name;
    }), function(o) {
        o.fn(obj || null);
    });
};
/**
 * Adds an observer to to the given notification.
 * When a notification of this type is sent, the
 * function *fn* is executed.
 * 
 * @param {type} notificationName
 * @param {type} fn
 * @returns {undefined}
 */
_NotificationCenter.prototype.addObserver = function(notificationName, fn) {
    this.observers.push({
        notificationName: notificationName,
        fn: fn
    });
};

(function() {
    
    window.NotificationCenter = new _NotificationCenter();
    
})();