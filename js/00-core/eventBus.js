(function (window) {
    const _subs = Object.create(null);

    function on(event, handler) {
        if (!_subs[event]) _subs[event] = [];
        _subs[event].push(handler);
        return () => off(event, handler);
    }

    function off(event, handler) {
        if (!_subs[event]) return;
        _subs[event] = _subs[event].filter(h => h !== handler);
    }

    function emit(event, payload) {
        if (!_subs[event]) return;
        _subs[event].slice().forEach(h => {
            try { h(payload); } catch (e) { console.error('EventBus handler error for', event, e); }
        });
    }

    function once(event, handler) {
        const wrapped = (payload) => { handler(payload); off(event, wrapped); };
        on(event, wrapped);
    }

    window.EventBus = { on, off, emit, once };
})(window);
