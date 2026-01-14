(function (window) {
    const _state = {};
    const _listeners = new Map();

    function init(initial = {}) {
        Object.assign(_state, initial);
        if (window.EventBus && typeof window.EventBus.emit === 'function') {
            window.EventBus.emit('state:init', { state: { ..._state } });
        }
    }

    function get(key) {
        if (typeof key === 'undefined') return { ..._state };
        return _state[key];
    }

    function set(key, value) {
        _state[key] = value;
        emitChange(key, value);
        return value;
    }

    function setState(obj = {}) {
        Object.assign(_state, obj);
        Object.keys(obj).forEach(k => emitChange(k, _state[k]));
    }

    function on(key, handler) {
        if (!_listeners.has(key)) _listeners.set(key, []);
        _listeners.get(key).push(handler);
        return () => off(key, handler);
    }

    function off(key, handler) {
        if (!_listeners.has(key)) return;
        _listeners.set(key, _listeners.get(key).filter(h => h !== handler));
    }

    function emitChange(key, value) {
        if (_listeners.has(key)) {
            _listeners.get(key).slice().forEach(h => {
                try { h(value, { key, state: { ..._state } }); } catch (e) { console.error(e); }
            });
        }
        if (window.EventBus && typeof window.EventBus.emit === 'function') {
            window.EventBus.emit('state:change', { key, value, state: { ..._state } });
            window.EventBus.emit(`state:change:${key}`, { value, state: { ..._state } });
        }
    }

    window.StateManager = {
        init,
        get,
        set,
        setState,
        on,
        off,
        _internal: _state
    };
})(window);
