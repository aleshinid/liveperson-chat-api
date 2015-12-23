/* global lpTag */

(function(window) {
    window.lpTag = window.lpTag || {};
    lpTag.CookieMethods = lpTag.CookieMethods || function b(e) {
        if (e) {
            this.separator = e;
        }
    };
    var a = lpTag.CookieMethods;
    var c = "prototype";
    a[c].separator = "::";
    a[c].readCookie = function(f) {
        if (!f) {
            return "";
        }
        f = encodeURIComponent(f);
        var e = document.cookie.split(f + "=");
        if (e.length == 1) {
            return "";
        }
        return decodeURIComponent(e[1].split(";")[0]);
    };
    a[c].writePersistentCookie = function(e, f, g) {
        g = typeof g == "number" ? g : 3600 * 24 * 30;
        return this.writeSessionCookie(e, f, g);
    };
    a[c].addToCookie = function(e, f, h) {
        var g = this.readCookie(e);
        g += this.separator + f;
        return typeof h === "number" ? this.writeSessionCookie(e, g, h) : this.writePersistentCookie(e, g, h);
    };
    a[c].writeSessionCookie = function(f, g, h) {
        if (!f) {
            return false;
        }
        if (g === null || g === undefined) {
            h = -1;
        }
        if (typeof h === "number") {
            var e = new Date();
            e.setDate(e.getTime() + h * 1000);
        }
        g = g ? encodeURIComponent(g) : "";
        document.cookie = [encodeURIComponent(f), "=", g, e ? "; expires=" + e.toUTCString() : "", "; path=/"].join("");
        return true;
    };
    a[c].clearCookie = function(e) {
        return this.writeSessionCookie(e);
    };
})(window);

(function(window) {
    window.lpTag = window.lpTag || {};
    lpTag.StorageMethods = lpTag.StorageMethods || function d() {
        var f = false;
        var g = "lpTestCase";
        try {
            f = typeof Storage !== "undefined" && this.setSessionData(g, "1");
            this.removeSessionData(g);
        } catch (e) {}
        this.isStorageEnabled = function() {
            return f;
        };
    };
    var a = lpTag.StorageMethods;
    var b = "prototype";
    a[b].setSessionData = function(e, f) {
        sessionStorage.setItem(e, f);
        return true;
    };
    a[b].getSessionData = function(e) {
        return sessionStorage.getItem(e) || "";
    };
    a[b].removeSessionData = function(e) {
        if (this.getSessionData(e)) {
            sessionStorage.removeItem(e);
            return true;
        }
        return false;
    };
    a[b].setPersistentData = function(e, f) {
        localStorage.setItem(e, f);
        return true;
    };
    a[b].getPersistentSessionData = function(e) {
        return localStorage.getItem(e) || "";
    };
    a[b].removePersistentData = function(e) {
        if (this.getPersistentSessionData(e)) {
            localStorage.removeItem(e);
            return true;
        }
        return false;
    };
})(window);

window.lpTag = window.lpTag || {};
lpTag.SessionDataManager = function() {
    var b = "::";
    var g = {};
    var f = {};
    var h;
    var a;
    var e = this;
    var d = false;
    if (this === window) {
        return;
    }
    h = new lpTag.StorageMethods();
    a = new lpTag.CookieMethods();
    d = h.isStorageEnabled();

    function c(k) {
        if (lpTag && lpTag.log) {
            lpTag.log(k, "ERROR", "SessionData");
        }
    }

    function j(n, q, p) {
        var m = false;
        if (typeof q !== "object") {
            try {
                var l = p ? e.getPersistentSessionData(n) : e.getSessionData(n);
                var o = l !== "" ? l.split(b) : [];
                o.push(q);
                l = o.join(b);
                m = p ? e.setPersistentData(n, l, p) : e.setSessionData(n, l);
            } catch (k) {
                c((p ? "appendToPersistentData " : "appendToSessionData ") + " failed, key: " + n);
            }
        }
        return m;
    }

    function i(p, o, m) {
        var l = false;
        if (typeof o !== "object") {
            try {
                var q = m ? e.getPersistentSessionData(p) : e.getSessionData(p);
                var n = q !== "" ? q.split(b) : [];
                var s = [];
                for (var k = 0; k < n.length; k++) {
                    if (n[k] !== o) {
                        s.push(n[k]);
                    }
                }
                q = s.join(b);
                if (q !== "") {
                    l = m ? e.setPersistentData(p, q, m) : e.setSessionData(p, q);
                } else {
                    l = m ? e.removePersistentData(p) : e.removeSessionData(p);
                }
            } catch (r) {
                c((m ? "removePartialPersistentData " : "removePartialSessionData ") + " failed, key: " + p);
            }
        }
        return l;
    }
    this.readCookie = function(k) {
        return a.readCookie(k);
    };
    this.setSessionData = function(l, m) {
        m = this.stringifyValue(m);
        try {
            if (!g[l]) {
                g[l] = l;
            }
            if (d) {
                h.setSessionData(l, m);
            } else {
                a.writeSessionCookie(l, m);
            }
        } catch (k) {
            c("Error in setSessionData, data: " + l);
        }
    };
    this.getSessionData = function(l) {
        try {
            return this.parseValue(d ? h.getSessionData(l) : a.readCookie(l));
        } catch (k) {
            c("Error in getSessionData, data: " + l);
        }
    };
    this.stringifyValue = function(l) {
        try {
            if (typeof l === "object") {
                l = JSON.stringify(l);
            }
        } catch (k) {}
        return l;
    };
    this.parseValue = function(l) {
        try {
            l = JSON.parse(l);
        } catch (k) {}
        return l;
    };
    this.getPersistentSessionData = function(l) {
        try {
            return this.parseValue(d ? h.getPersistentSessionData(l) : a.readCookie(l));
        } catch (k) {
            c("Error in getPersistentSessionData, data: " + l);
        }
    };
    this.appendToSessionData = function(k, l) {
        j(k, l, false);
    };
    this.appendToPersistentData = function(k, m, l) {
        j(k, m, true, l);
    };
    this.removePartialPersistentData = function(k, l) {
        i(k, l, true);
    };
    this.removeSessionData = function(k) {
        if (d) {
            h.removeSessionData(k);
        } else {
            a.clearCookie(k);
        }
    };
    this.removePersistentData = function(k) {
        if (d) {
            h.removePersistentData(k);
        } else {
            a.clearCookie(k);
        }
    };
    this.removePartialSessionData = function(k, l) {
        i(k, l, false);
    };
    this.setPersistentData = function(l, n, m) {
        n = this.stringifyValue(n);
        try {
            if (!f[l]) {
                f[l] = l;
            }
            if (d) {
                h.setPersistentData(l, n);
            } else {
                a.writePersistentCookie(l, n, m);
            }
        } catch (k) {
            c("Error in setPersistentData, data: " + l);
        }
    };
    this.clearPersistentData = function(l) {
        l = l || f;
        for (var m in l) {
            try {
                if (d) {
                    h.removePersistentData(l[m]);
                } else {
                    a.clearCookie(l[m]);
                }
            } catch (k) {
                c("Error in clearPersistentData, key: " + l[m]);
            }
        }
    };
    this.clearSessionData = function(l) {
        l = l || g;
        for (var m in l) {
            try {
                if (d) {
                    h.removeSessionData(l[m]);
                } else {
                    a.clearCookie(l[m]);
                }
            } catch (k) {
                c("Error in SessionData in clearSessionData, key:" + l[m]);
            }
        }
    };
};

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.utils = lpTag.utils || {};
lpTag.utils.SessionDataAsyncWrapper = lpTag.utils.SessionDataAsyncWrapper || function(a) {
    if (this === window) {
        return null;
    }
    var d = a.useSecureStorage;
    var m = a.lpNumber;
    var g = false;
    var f;
    var e;
    var c;
    if (d) {
        f = a && a.appName;
        e = lpTag.taglets && lpTag.taglets.lpSecureStorage;
        c = a && a.secureStorageLocation;
        g = d && c && e && f ? true : false;
    }
    if (lpTag.SessionDataManager) {
        lpTag.utils.sessionDataManager = lpTag.utils.sessionDataManager || new lpTag.SessionDataManager();
    }
    var h = lpTag.utils.sessionDataManager || null;

    function b(p, r, n, o) {
        var q;
        if (g) {
            e.getValue({
                key: p,
                appName: f,
                site: m,
                success: i(p, r, o),
                error: i(p, n, o),
                context: o,
                domain: c
            });
        } else {
            q = h.getSessionData(p);
            if (typeof q !== "undefined") {
                k(r, q, o);
            } else {
                k(n, q, o);
            }
        }
    }

    function l(q, r, s, n, p) {
        if (g) {
            e.setValue({
                key: q,
                appName: f,
                value: r,
                site: m,
                success: i(q, s, p),
                error: i(q, n, p),
                context: p,
                domain: c
            });
        } else {
            if (h.setSessionData(q, r)) {
                k(s, true, p);
            } else {
                k(n, false, p);
            }
        }
    }

    function j(p, q, n, o) {
        if (g) {
            e.setValue({
                key: p,
                appName: f,
                site: m,
                success: i(p, q, o),
                error: i(p, n, o),
                context: o,
                domain: c,
                expires: -1
            });
        } else {
            if (h.removeSessionData(p)) {
                k(q, true, o);
            } else {
                k(n, false, o);
            }
        }
    }

    function i(o, p, n) {
        return function(q) {
            k(p, q, n);
        };
    }

    function k(q, p, o) {
        try {
            if (q && typeof q === "function") {
                q.call(o, p);
            }
        } catch (n) {}
    }
    return {
        setSessionData: l,
        getSessionData: b,
        removeSessionData: j,
        readCookie: lpTag.utils.sessionDataManager && lpTag.utils.sessionDataManager.readCookie,
        usingSecureStorage: g
    };
};

window.lpTag = window.lpTag || {};
lpTag.utils = lpTag.utils || {};
lpTag.utils.Events = lpTag.utils.Events || function(e) {
    if (this === window) {
        return false;
    }
    var b = 0;
    var c = {};
    var a = [];
    var i = "evId_";
    var k = 0;
    var f;
    var n;
    f = e && typeof e.cloneEventData === "boolean" ? e.cloneEventData : false;
    n = e && !isNaN(e.eventBufferLimit) ? e.eventBufferLimit : -1;
    var j = {
        once: function(q) {
            if (q) {
                q.triggerOnce = true;
                this.bind(q);
            } else {
                return null;
            }
        },
        bind: function(q, x, y) {
            var t = q;
            if ("string" === typeof q) {
                t = {
                    appName: q,
                    eventName: x,
                    func: y
                };
            }
            if (!t.eventName || !t.func || "function" !== typeof t.func && t.func.constructor !== Array) {
                m("Ev listen has invalid params: evName=[" + t.eventName + "]", "ERROR", "Events");
                return null;
            }
            if (t.func.constructor === Array) {
                var u = [];
                var z;
                var w;
                for (var s = 0; s < t.func.length; s++) {
                    z = o(t);
                    z.func = t.func[s];
                    w = this.register(z);
                    u.push(w);
                }
                return u;
            }
            var v = i + b++;
            var r = {
                id: v,
                func: t.func,
                context: t.context || null,
                aSync: t.aSync ? true : false,
                appName: t.appName || "*",
                triggerOnce: t.triggerOnce || false
            };
            c[t.eventName] = c[t.eventName] || [];
            c[t.eventName].push(r);
            m("Ev listen rgstr: evName=[" + t.eventName + "] aSync=" + r.aSync + " appName=" + r.name, "DEBUG", "Events");
            t = null;
            q = null;
            return v;
        },
        unbind: function(u) {
            var q = false;
            var t;
            if (!u) {
                m("Ev listen id not spec for unbind", "ERROR", "Events");
                return null;
            }
            if (typeof u === "string") {
                l(c, u);
            } else {
                if (!u.func && !u.context && !u.appName) {
                    return false;
                }
            }
            var s = c;
            if (u.eventName) {
                s = {};
                s[u.eventName] = c[u.eventName];
            }
            for (var r in s) {
                if (s.hasOwnProperty(r)) {
                    t = h(s[r], u.func, u.context, u.appName);
                    if (t.length !== s[r].length) {
                        c[r] = t;
                        q = true;
                    }
                }
            }
            return q;
        },
        hasFired: function(s, r) {
            if ((typeof r === "undefined" || r === "*") && s === "*") {
                return a;
            }
            var q = [];
            for (var t = 0; t < a.length; t++) {
                if (a[t].eventName === r || r === "*") {
                    if (s && s === a[t].appName || (!a[t].appName || a[t].appName === "*") || s === "*") {
                        q.push(a[t]);
                    }
                }
            }
            return q;
        },
        trigger: function(t, r, w) {
            var q = t;
            if ("string" === typeof t) {
                q = {
                    eventName: r,
                    appName: t,
                    data: w
                };
            }
            if (!q || typeof q.eventName === "undefined") {
                m("Ev name not spec for publish", "ERROR", "Events");
                q = null;
                return null;
            }
            q.passDataByRef = q.passDataByRef || !f;
            p(q);
            if (!c[q.eventName]) {
                return false;
            }
            var v = d(q.eventName, q.appName);
            if (v.length > 0) {
                for (var u = 0; u < v.length; u++) {
                    var y = q.passDataByRef ? q.data : o(q.data);
                    var x = {
                        appName: q.appName,
                        eventName: q.eventName
                    };
                    var s = v[u];
                    if (s.aSync || y && y.aSync) {
                        setTimeout(g(s, y, x), 0);
                    } else {
                        g(s, y, x)();
                    }
                }
            }
            q = null;
            return v.length > 0;
        }
    };
    j.publish = j.trigger;
    j.register = j.bind;
    j.unregister = j.unbind;
    return j;

    function d(t, q) {
        var r = [];
        for (var u = 0; u < c[t].length; u++) {
            if (!q || "*" === c[t][u].appName || c[t][u].appName === q) {
                r.push(c[t][u]);
            }
        }
        if (c["*"]) {
            for (var s = 0; s < c["*"].length; s++) {
                if (!q || "*" === c["*"][s].appName || c["*"][s].appName === q) {
                    r.push(c["*"][s]);
                }
            }
        }
        return r;
    }

    function m(r, s, q) {
        if (lpTag && typeof lpTag.log === "function") {
            lpTag.log(r, s, q);
        }
    }

    function l(u, t) {
        var r = false;
        if (!t) {
            m("Ev listen id not spec for unregister", "ERROR", "Events");
            return null;
        }
        for (var q in u) {
            if (u.hasOwnProperty(q)) {
                for (var s = 0; s < u[q].length; s++) {
                    if (u[q][s].id == t) {
                        u[q].splice(s, 1);
                        m("Ev listen=" + t + " and name=" + q + " unregister", "DEBUG", "Events");
                        r = true;
                        break;
                    }
                }
            }
        }
        if (!r) {
            m("Ev listen not found " + t + " unregister", "DEBUG", "Events");
        }
        return r;
    }

    function g(s, r, q) {
        return function() {
            try {
                s.func.call(s.context, r, q);
                r = null;
                if (s.triggerOnce) {
                    j.unbind(s);
                }
                s = null;
            } catch (t) {
                m("Error executing " + q.eventName + " eventId: " + s.id + "e=" + t.message, "ERROR", "Events");
            }
        };
    }

    function h(A, u, s, y) {
        var z = [];
        for (var w = 0; w < A.length; w++) {
            try {
                var r = !s && A[w].func === u;
                var x = !u && s && A[w].context === s;
                var q = u && s && A[w].func === u && A[w].context === s;
                var t = y && y === A[w].appName;
                var B = A[w].appName === "*";
                if (r || x || q) {
                    if (t || B) {
                        continue;
                    }
                } else {
                    if (!u && !s && t) {
                        continue;
                    }
                }
                z.push(A[w]);
            } catch (v) {
                m("Error in unbind e=" + v.message, "ERROR", "Events");
            }
        }
        return z;
    }

    function p(q) {
        if (n === 0 || q.data && !!q.data.doNotStore) {
            q = null;
            return;
        }
        var r = {
            eventName: q.eventName,
            appName: q.appName
        };
        r.data = q.passDataByRef ? q.data : o(q.data);
        if (n > 0) {
            if (k >= n) {
                k = 0;
            }
            a[k] = r;
            k++;
        } else {
            a.push(r);
        }
        q = null;
    }

    function o(r) {
        var q = {};
        if (r.constructor === Object) {
            for (var s in r) {
                if (r.hasOwnProperty(s) && r[s] !== null && r[s] !== undefined) {
                    if (typeof r[s] === "object" && r[s].constructor !== Array) {
                        q[s] = o(r[s]);
                    } else {
                        if (r[s].constructor === Array) {
                            q[s] = r[s].slice(0) || [];
                        } else {
                            if (typeof r[s] !== "function") {
                                q[s] = r[s] !== null && r[s] !== undefined ? r[s] : "";
                            }
                        }
                    }
                }
            }
        } else {
            if (r.constructor === Array) {
                q = r.slice(0) || [];
            } else {
                if (typeof r !== "function") {
                    q = r;
                }
            }
        }
        return q;
    }
};

window.lpTag = window.lpTag || {};
lpTag.RelManager = lpTag.RelManager || function(a) {
    if (this === window) {
        e("RelManager called without new", "ERROR", "lpTag.RelManager");
        return null;
    }
    var k = true;
    var h = this;
    var m = null;
    var d = {
        domain: "",
        lpNumber: "",
        appKey: "",
        accessToken: ""
    };
    var c = ["xhr", "postmessage", "rest2jsonp"];
    if (a && a.constructor === Array) {
        c = a;
    }

    function e(p, o, n) {
        if (lpTag && lpTag.utils && lpTag.utils.log) {
            lpTag.utils.log(p, o, n);
        }
    }
    this.clearData = function() {
        for (var n in d) {
            d[n] = "";
        }
        m = null;
    };
    this.setData = function(n) {
        m = {};
        for (var o in n) {
            if (n.hasOwnProperty(o)) {
                d[o] = n[o];
            }
        }
        if (n && typeof n.useJSON === "boolean") {
            k = n.useJSON;
        }
        if (n.transportOrder) {
            c = n.transportOrder;
        }
        n = null;
    };
    this.addRels = function(o, r) {
        o = f(o);
        if (!r) {
            o = null;
            return null;
        }
        m[r.type] = m[r.type] || {};
        var q = m[r.type];
        if (r.id) {
            q[r.id] = q[r.id] || {};
            q = q[r.id];
        }
        for (var n in o) {
            if (o.hasOwnProperty(n)) {
                if (o[n]["rel"]) {
                    q[o[n]["rel"]] = o[n]["href"];
                } else {
                    if (o[n]["@rel"]) {
                        q[o[n]["@rel"]] = o[n]["@href"];
                    }
                }
            }
        }
        if (r.data) {
            q.data = q.data || {};
            for (var p in r.data) {
                if (r.data.hasOwnProperty(p)) {
                    q.data[p] = r.data[p];
                }
            }
        }
        o = null;
        r = null;
        q = null;
    };
    this.removeRels = function(o) {
        var n = false;
        if (!o) {
            return null;
        }
        if (o.id) {
            if (m[o.type] && m[o.type][o.id]) {
                m[o.type][o.id] = null;
                delete m[o.type][o.id];
                n = true;
            }
        } else {
            if (m[o.type]) {
                m[o.type] = null;
                delete m[o.type];
                n = true;
            }
        }
        o = null;
        return n;
    };
    this.hasRel = function(o, p) {
        var n = this.getURI(o, p);
        p = null;
        return n !== null && n !== "";
    };
    this.getURI = function(n, r) {
        if (!r || !m) {
            return null;
        }
        var p = null;
        var q;
        if (m[r.type]) {
            q = m[r.type];
            if (r.id && q[r.id]) {
                q = q[r.id];
            }
        }
        if (q) {
            p = q[n] || null;
            if (!p && q.data) {
                for (var o in q.data) {
                    if (q.data.hasOwnProperty(o)) {
                        p = this.getURI(n, {
                            type: o,
                            id: q.data[o],
                            needAuth: r.needAuth
                        });
                        if (p) {
                            break;
                        }
                    }
                }
            }
            if (!r.ignoreParameters) {
                p = p ? g(p, r.needAuth || false) : "";
            }
        }
        r = null;
        q = null;
        return p;
    };

    function g(o, n) {
        if (o.indexOf("v=1") < 0) {
            o += o.indexOf("?") > -1 ? "&" : "?";
            o += "v=1";
        }
        if (n && o.indexOf("&NC=true") < 0) {
            o += "&NC=true";
        }
        return o;
    }

    function j(n) {
        if (k && n.toLowerCase().indexOf(".json") < 0) {
            var o = n.indexOf("?");
            if (o > 0) {
                n = n.replace("?", ".json?");
            } else {
                n += ".json";
            }
        }
        return n;
    }
    this.buildRequestObj = function(n) {
        var o = b(n);
        if (!o) {
            n = null;
            o = null;
            return null;
        }
        if (n.queryParams && o.url) {
            o.url = n.queryParams ? o.url + l(n.queryParams) : o.url;
        }
        o.transportOrder = c.slice(0);
        n = null;
        return o;
    };

    function l(p) {
        var n = "";
        for (var q in p) {
            if (p.hasOwnProperty(q)) {
                if (p[q].constructor === Array) {
                    for (var o = 0; o < p[q].length; o++) {
                        n += "&" + encodeURIComponent(q) + "=" + encodeURIComponent(p[q][o]);
                    }
                } else {
                    n += "&" + encodeURIComponent(q) + "=" + encodeURIComponent(p[q]);
                }
            }
        }
        p = null;
        return n;
    }

    function f(p) {
        var n = [];
        for (var o in p) {
            if (p.link) {
                n = p.link.constructor === Array ? p.link : [p.link];
                p = null;
                return n;
            }
            if (p.hasOwnProperty(o) && n.length === 0) {
                if (o === "link") {
                    n = p[o].constructor === Array ? p[o] : [p[o]];
                    p = null;
                    return n;
                } else {
                    if (p[o] !== null && p[o] !== undefined && typeof p[o] === "object" && p[o].constructor !== Array) {
                        n = f(p[o]);
                    }
                }
            }
        }
        p = null;
        return n;
    }
    this.extractRels = f;

    function b(p) {
        var n = {
            AUTHORIZATION: "LivePerson appKey=" + d.appKey
        };
        if (d.accessToken) {
            n = {
                AUTHORIZATION: "Bearer " + d.accessToken
            };
        }
        var o = {
            url: "",
            method: "",
            headers: "",
            data: ""
        };
        if (!p.url) {
            o.url = p.rel === "" ? "https://" + d.domain + "/api/account/" + d.lpNumber + "?v=1" : h.getURI(p.rel, {
                type: p.type,
                id: p.id,
                needAuth: p.needAuth
            });
        } else {
            o.url = p.url;
        }
        if (o.url) {
            o.url = j(o.url);
        }
        o.method = p.requestType || "GET";
        o.headers = n;
        n = null;
        if (o.method === "PUT") {
            o.headers["X-HTTP-Method-Override"] = "PUT";
            o.method = "POST";
        }
        if (o.method === "DELETE") {
            o.headers["X-HTTP-Method-Override"] = "DELETE";
            o.method = "POST";
        }
        if (p.data) {
            o.data = p.data;
        }
        p = null;
        if (o.url) {
            return o;
        } else {
            return null;
        }
    }
};

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.taglets.lpAjax = lpTag.taglets.lpAjax || (function(g) {
    var f = "1.1.3";
    var r = "lpAjax";
    var c = "lpTransporter";
    var q = {};
    var n = false;
    var k = {
        ERROR: "ERROR",
        DEBUG: "DEBUG",
        INFO: "INFO",
        METRICS: "METRICS"
    };
    var e = "lpT" + Math.floor(Math.random() * 100000) + "_" + Math.floor(Math.random() * 1000000);

    function l() {
        n = true;
    }

    function i(t, s) {
        if (g.lpTag && lpTag.log) {
            lpTag.log(t, s, r);
        }
    }

    function o(s, t) {
        if (!q[s]) {
            q[s] = t;
            i("Added transport: " + s, k.DEBUG);
        } else {
            i("Existing transport: " + s + " tried to register", k.DEBUG);
        }
    }

    function m(t) {
        if (!n) {
            l();
        }
        var s = "unknown";
        try {
            var v = a(t);
            if (v) {
                v.issueCall(t);
                return true;
            } else {
                i("No Transport found to issueCall", k.ERROR);
                b(k.ERROR, t.error, {
                    responseCode: 601,
                    error: "No Transport found to issueCall, request: " + t.url,
                    body: "ERROR"
                }, t.context);
            }
        } catch (u) {
            if (v && v.getName) {
                s = v.getName();
            }
            i("Transport - " + s + " - unknown exception while issueCall", k.ERROR);
            b(k.ERROR, t.error, {
                responseCode: 600,
                error: "Transport - " + s + " - unknown exception while issueCall: " + t.url + " e=" + u,
                body: "ERROR"
            }, t.context);
        }
    }

    function h(v) {
        if (!n) {
            l();
        }
        for (var s in v) {
            var u = q[s];
            if (u) {
                u.configure(v[s]);
            }
        }
    }

    function j(s) {
        if (s && typeof s === "object") {
            s.appName = c;
            s.ts = new Date().getTime();
            if (s.tags && s.tags.constructor === Array) {
                s.tags.push({
                    pageId: e
                });
            }
            i(s, k.METRICS);
        }
    }

    function a(x) {
        var s = false;
        var u = -1;
        for (var w = 0; w < x.transportOrder.length; w++) {
            if (!s) {
                var y = p({}, x);
                var v = q[y.transportOrder[w]];
                if (v && v.isValidRequest && v.isValidRequest(y)) {
                    s = true;
                    u = w;
                }
            }
        }
        if (s) {
            return q[y.transportOrder[u]];
        } else {
            return null;
        }
    }

    function d(y, x, w) {
        if (y == null) {
            return;
        }
        var v = Array.prototype.forEach;
        if (v && y.forEach === v) {
            y.forEach(x, w);
        } else {
            if (y.length === +y.length) {
                for (var u = 0, s = y.length; u < s; u++) {
                    if (u in y && x.call(w, y[u], u, y) === {}) {
                        return;
                    }
                }
            } else {
                for (var t in y) {
                    if (Object.prototype.hasOwnProperty.call(y, t)) {
                        if (x.call(w, y[t], t, y) === {}) {
                            return;
                        }
                    }
                }
            }
        }
    }

    function p(s) {
        d(Array.prototype.slice.call(arguments, 1), function(t) {
            for (var u in t) {
                s[u] = t[u];
            }
        });
        return s;
    }

    function b(t, w, u, s) {
        if (typeof w === "function") {
            try {
                w.call(s || null, u);
                w = null;
            } catch (v) {
                console.log("Exception in execution of callback, type :" + t + " e=[" + v.message + "]", k.ERROR, "runCallback");
            }
        } else {
            console.log("No callback, of type :" + t, k.INFO, "runCallback");
        }
    }
    return {
        getVersion: function() {
            return f;
        },
        getName: function() {
            return r;
        },
        init: l,
        publishMetrics: j,
        issueCall: m,
        configureTransports: h,
        addTransport: o
    };
})(window);

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.taglets.postmessage = lpTag.taglets.postmessage || (function(ak) {
    var x = "1.1.8";
    var V = "postmessage";
    var u = true;
    var v = {};
    var r = {};
    var c = {};
    var F = 0;
    var o = 0;
    var t = 0;
    var S = {};
    var M;
    var aq = false;
    var J = [];
    var w = {
        DEBUG: "DEBUG",
        INFO: "INFO",
        ERROR: "ERROR"
    };
    var a = ad(document.location.href);
    var G = {
        progress: "progressLoad",
        completed: "completeLoad",
        error: "errorLoad",
        reloading: "reloading",
        stats: "statData"
    };
    var g = {
        responseType: G.error,
        responseCode: 404,
        message: "Request timed out on parent postMessage layer",
        name: "TIMEOUT"
    };
    var ah = {
        responseType: G.success,
        responseCode: 200,
        message: "iFrame has successfully loaded",
        name: "OK"
    };
    var ab = {
        responseType: G.error,
        responseCode: 418,
        message: "This iFrame is a teapot, not very useful for communication but lovely for earl grey",
        name: "TEAPOT"
    };
    var aw = {
        timeout: 60000,
        metricsCount: 1000
    };
    at();
    A(ak, "message", B);
    var I = {
        VALIDATED: "valid",
        PENDING: "pending",
        FAILED: "failed"
    };

    function A(ay, ax, az) {
        if (ay.addEventListener) {
            ay.addEventListener(ax, az, false);
        } else {
            ay.attachEvent("on" + ax, az);
        }
    }

    function s(ay, ax) {
        return {
            callId: ay,
            responseType: ax.responseType,
            responseCode: ax.responseCode,
            error: {
                message: ax.message,
                id: ax.responseCode,
                name: ax.name
            }
        };
    }

    function Y(ay, ax, az) {
        if (ay.removeEventListener) {
            ay.removeEventListener(ax, az, false);
        } else {
            if (ay.detachEvent) {
                ay.detachEvent("on" + ax, az);
            }
        }
    }

    function at() {
        if (document.body) {
            aq = true;
            L();
        } else {
            setTimeout(at, 5);
        }
    }

    function L() {
        while (J.length > 0) {
            try {
                (J.shift()).call(null);
            } catch (ax) {
                h("Unable to execute queued callbacks for window interactive state: " + ax, w.ERROR, "attachPendingIFrames");
            }
        }
    }

    function K(ax) {
        return ax + "_" + Math.floor(Math.random() * 100000) + "_" + Math.floor(Math.random() * 100000);
    }

    function ad(ax) {
        var aA = new RegExp(/(http{1}s{0,1}?:\/\/)([^\/\?]+)(\/?)/ig);
        var az;
        var ay = null;
        if (ax.indexOf("http") === 0) {
            az = aA.exec(ax);
        } else {
            return location.protocol + "//" + location.host;
        }
        if (az && az.length >= 3 && az[2] !== "") {
            ay = az[1].toLowerCase() + az[2].toLowerCase();
        }
        return ay;
    }

    function n(ay, aA) {
        var ax = false;
        var az;
        var aB;
        if (!ay || !ay.url || typeof ay.url !== "string") {
            h("iFrame configuration empty or missing url parameter", w.ERROR, "queueFrame");
            return ax;
        }
        az = ad(ay.url);
        aB = ay.url.toLowerCase().indexOf("https") === 0;
        if (!v[az] && !S[az]) {
            if (!aA || aB === aA) {
                S[az] = ay;
                ax = true;
            }
        }
        return ax;
    }

    function O(ax) {
        var ay = ad(ax.url);
        if (v[ay]) {
            return aa(ay, ax.callback || ax.success, ax.context);
        }
        var az = K("fr");
        v[ay] = {
            elem: T(az),
            url: ax.url,
            validated: I.PENDING,
            defaults: ax.defaults || {},
            delayLoad: isNaN(ax.delayLoad) ? 0 : ax.delayLoad,
            requestCount: 0,
            success: ax.callback || ax.success,
            error: ax.error,
            maxReloadRetries: ax.maxReloadRetries || 3,
            reloadInterval: ax.reloadInterval * 1000 || 30000
        };
        setTimeout(function() {
            C(ax.url, ay);
        }, v[ay].delayLoad);
        h("iFrame Queued to load " + ay, w.INFO, "addFrame");
        return I.PENDING;
    }

    function C(ay, ax) {
        if (aq) {
            D(ay, ax);
        } else {
            J.push(function() {
                D(ay, ax);
            });
        }
    }

    function D(ay, ax) {
        v[ax].loadCallback = v[ax].loadCallback || ae(ax);
        f(v[ax].elem, ay);
        A(v[ax].elem, "load", v[ax].loadCallback);
        v[ax].iFrameOnloadTimeout = setTimeout(v[ax].loadCallback, 5000);
        v[ax].attachTime = new Date().getTime();
        document.body.appendChild(v[ax].elem);
    }

    function ae(ax) {
        return function(ay) {
            if (v[ax].iFrameOnloadTimeout) {
                clearTimeout(v[ax].iFrameOnloadTimeout);
                delete v[ax].iFrameOnloadTimeout;
            }
            v[ax].loadTime = new Date().getTime() - v[ax].attachTime;
            am(ax, ay);
        };
    }

    function aj(ax) {
        F = F + 1;
        t = t + 1;
        v[ax].requestCount = v[ax].requestCount + 1;
    }

    function av(ay, ax) {
        c[ay] = c[ay] || [];
        c[ay].push(ax);
        return true;
    }

    function aa(az, aA, ay) {
        var ax = af(az);
        an(aA, ay, ax);
        return v[az].validated;
    }

    function T(ay) {
        var ax = document.createElement("IFRAME");
        ax.setAttribute("id", ay);
        ax.setAttribute("name", ay);
        ax.setAttribute("tabindex", "-1");
        ax.setAttribute("aria-hidden", "true");
        ax.setAttribute("title", "");
        ax.setAttribute("role", "presentation");
        ax.style.width = "0px";
        ax.style.height = "0px";
        ax.style.position = "absolute";
        ax.style.top = "-1000px";
        ax.style.left = "-1000px";
        return ax;
    }

    function k(aB, aD, ay, ax, az, aC) {
        var aA = false;
        if (aB && aD && typeof aD === "function") {
            r[aB] = {
                success: aD,
                error: ay,
                progress: ax,
                ctx: az,
                launchTime: new Date(),
                timeout: aC + 1000 || aw.timeout
            };
            aA = true;
        }
        return aA;
    }

    function i(ax) {
        if (r[ax]) {
            r[ax] = null;
            delete r[ax];
            return true;
        }
        return false;
    }

    function am(ay, ax) {
        h("onLoad validation called " + ay, w.INFO, "validateFrame");
        var az = function(aA) {
            au(aA, ay);
        };
        if (ax && ax.error) {
            au(ax, ay);
        } else {
            setTimeout(function() {
                l({
                    domain: ay,
                    success: az,
                    error: az,
                    validation: true,
                    timeout: 100,
                    retries: -1,
                    defaults: v[ay].defaults
                });
            }, 10);
        }
        return true;
    }

    function au(az, ay) {
        var ax;
        var aA = v[ay];
        h("running validation of domain " + ay, w.INFO, "validateFrameCallback");
        if (aA) {
            v[ay].validated = az && az.error ? I.FAILED : I.VALIDATED;
            ax = v[ay].validated === I.VALIDATED;
            if (ax) {
                m(ay, az);
            } else {
                if (v[ay].reloadObj && v[ay].reloadObj.retriesLeft > 0) {
                    ao(ay);
                } else {
                    P(ay);
                }
            }
        }
        aA = null;
        return ax;
    }

    function m(aA, az) {
        var ay;
        h("FrameLoaded " + aA, w.INFO, "runFrameValidated");
        ay = ac(ah);
        for (var ax in az) {
            if (az.hasOwnProperty(ax)) {
                ay[ax] = az[ax];
            }
        }
        an(v[aA].success, v[aA].context, ay);
        z(aA);
        e(aA, true);
    }

    function P(ay) {
        h("iFrame is a teapot " + ay, w.ERROR, "runFrameFailedToLoad");
        if (v[ay].error) {
            var ax = s(0, ab);
            ax.domain = ay;
            an(v[ay].error, v[ay].context, ax);
        }
        b(ay);
        e(ay, false);
    }

    function ao(ax) {
        h("Retry loading domain: " + ax, "info", "runReloadAttempt");
        e(ax, false);
        H(ax);
    }

    function e(ay, ax) {
        h("Running buffer queue : " + ay + " loaded: " + ax, w.INFO, "runQueuedRequests");
        if (c[ay] && c[ay].length > 0) {
            do {
                var az = c[ay].shift();
                if (ax) {
                    l(az);
                } else {
                    an(az.error, az.context, {
                        responseCode: 600,
                        error: "Transport - postmessage - unable to run request: " + ay,
                        body: "ERROR"
                    });
                }
            } while (c[ay].length > 0);
            c[ay] = null;
            delete c[ay];
        }
    }

    function b(ay) {
        h("Cleaning up failed iFrame: " + ay, w.INFO, "cleanupIFrame");
        if (v[ay]) {
            Y(v[ay].elem, "load", v[ay].loadCallback);
            v[ay].elem.parentNode.removeChild(v[ay].elem);
            var ax = ac(ab);
            ax.domain = ay;
            ax.url = v[ay].url;
            an(v[ay].error, v[ay].context, ax);
            v[ay] = null;
            delete v[ay];
        }
    }

    function ag(ay, az, ax) {
        h("Frame not found for domain: " + ay, w.ERROR, "noFrameFound");
        an(az, {
            responseCode: 600,
            error: "Transport - postmessage - unable to run request: " + ay,
            body: "ERROR"
        }, ax);
        return false;
    }

    function y(ay) {
        var ax = false;
        if (ak.postMessage && ak.JSON) {
            if (ay && ay.success && (ay.domain && ay.validation || ay.url)) {
                ay.domain = ay.domain || ad(ay.url);
                if (v[ay.domain] || S[ay.domain]) {
                    ax = true;
                }
            }
        }
        return ax;
    }

    function l(ay) {
        var ax = false;
        if (u && y(ay)) {
            if (v[ay.domain]) {
                if (v[ay.domain].validated === I.PENDING && !ay.validation) {
                    ax = av(ay.domain, ay);
                } else {
                    ax = N(ay);
                    if (ax) {
                        aj(ay.domain);
                    } else {
                        r[ay.callId].timeout = 0;
                    }
                }
            } else {
                h("Adding iFrame to DOM - first request: " + ay.domain, w.INFO, "issueCall");
                ax = av(ay.domain, ay);
                O(S[ay.domain]);
                delete S[ay.domain];
            }
        } else {
            ax = ag(ay.domain, ay.error, ay.context);
        }
        return ax;
    }

    function N(ay) {
        var ax;
        var aB = false;
        ay = d(ay);
        ax = ac(ay);
        try {
            ax = R(ax);
        } catch (aA) {
            h("Error trying to stringify message", w.ERROR, "sendMessageToFrame");
            return false;
        }
        h("sending msg to domain " + ay.domain, w.DEBUG, "sendMessageToFrame");
        var az = ay.timeout * (ay.retries + 1) + 2000;
        k(ay.callId, ay.success, ay.error, ay.progress, ay.context, az);
        try {
            aB = X(ay.domain, ax);
            M = setTimeout(q, 1000);
        } catch (aA) {
            h("Error trying to send message: " + aA, w.ERROR, "sendMessageToFrame");
            aB = false;
        }
        return aB;
    }

    function R(az) {
        var ax;
        if (typeof Array.prototype.toJSON === "function") {
            var ay = Array.prototype.toJSON;
            delete Array.prototype.toJSON;
            try {
                ax = JSON.stringify(az);
            } catch (aA) {
                Array.prototype.toJSON = ay;
                throw aA;
            }
            Array.prototype.toJSON = ay;
        } else {
            ax = JSON.stringify(az);
        }
        return ax;
    }

    function d(ax) {
        var ay = v[ax.domain] && v[ax.domain].defaults;
        ax.callId = K("call");
        ax.returnDomain = a;
        if (typeof ax.timeout === "undefined") {
            ax.timeout = ay && ay.timeout || aw.timeout;
        }
        if (typeof ax.retries === "undefined") {
            ax.retries = ay && typeof ay.retries !== "undefined" ? ay.retries : aw.retries;
        }
        if (ax.progress) {
            ax.fireProgress = true;
        }
        ax.headers = ax.headers || {};
        ax.headers["LP-URL"] = ak.location.href;
        return ax;
    }

    function X(aA, ay) {
        var ax = false;
        try {
            v[aA].elem.contentWindow.postMessage(ay, aA);
            ax = true;
        } catch (az) {
            h("Error trying to send message: " + az, w.ERROR, "postTheMessage");
        }
        return ax;
    }

    function q() {
        if (M) {
            clearTimeout(M);
        }
        M = null;
        var ax = new Date();
        var aB = 0;
        var aC = [];
        for (var az in r) {
            if (r.hasOwnProperty(az) && r[az].launchTime) {
                var aA = ax - r[az].launchTime;
                if (aA > r[az].timeout) {
                    aC.push(az);
                } else {
                    aB = aB + 1;
                }
            }
        }
        if (aC.length) {
            h("Checking errors found " + aC.length + " timeout callbacks to call", w.DEBUG, "checkForErrors");
            for (var ay = 0; ay < aC.length; ay++) {
                E(s(aC[ay], g));
            }
        }
        if (aB > 0) {
            M = setTimeout(q, 1000);
        }
        return true;
    }

    function ac(az) {
        var aA = {};
        if (az.constructor === Object) {
            for (var ay in az) {
                try {
                    if (az.hasOwnProperty(ay) && typeof az[ay] !== "function") {
                        aA[ay] = az[ay];
                    }
                } catch (ax) {
                    h("Error creating request object data clone: " + ax, w.ERROR, "cloneSimpleObj");
                }
            }
        } else {
            if (az.constructor === Array) {
                aA = az.slice(0) || [];
            } else {
                if (typeof az !== "function") {
                    aA = az;
                }
            }
        }
        return aA;
    }

    function E(aD, az) {
        var ay = r[aD.callId];
        var aC;
        var aA = aD.responseType;
        var ax = false;
        if (aD.callId && r[aD.callId] || aD.responseType === G.reloading || aD.responseType === G.stats) {
            try {
                switch (aA) {
                    case G.completed:
                        aC = ay.success;
                        ax = true;
                        break;
                    case G.error:
                        aC = ay.error;
                        ax = true;
                        o = o + 1;
                        break;
                    case G.progress:
                        aC = ay.progress;
                        break;
                    case G.reloading:
                        aD = az;
                        aC = H;
                        break;
                    case G.stats:
                        aC = Z;
                        aD = aD.rawData;
                        break;
                    default:
                        break;
                }
                if (ax) {
                    i(aD.callId);
                    ar(aD);
                    t = t >= 0 ? 0 : t - 1;
                }
                if (aC && typeof aC === "function") {
                    an(aC, ay && ay.ctx || null, aD);
                }
                aC = null;
                ay = null;
            } catch (aB) {
                h("Error in executing callback: " + aB, w.ERROR, "executeMessageCallback");
                return false;
            }
        }
        return true;
    }

    function H(ax) {
        h("Got reload request from " + ax, w.INFO, "handleReload");
        v[ax].validated = I.PENDING;
        if (!v[ax].reloadObj) {
            h("Creating reloadObj" + ax, w.DEBUG, "handleReload");
            v[ax].reloadObj = j(ax);
        }
        Q(ax);
    }

    function Q(ax) {
        h("Reload try for domain " + ax + " ,retries left " + v[ax].reloadObj.retriesLeft, w.INFO, "reloadIFrame");
        v[ax].reloadObj.retriesLeft = v[ax].reloadObj.retriesLeft - 1;
        if (v[ax].reloadObj.setLocationTimeout) {
            clearTimeout(v[ax].reloadObj.setLocationTimeout);
        }
        if (v[ax].reloadObj.retry) {
            v[ax].reloadObj.setLocationTimeout = setTimeout(p(ax), v[ax].reloadInterval);
        } else {
            v[ax].reloadObj.retry = true;
            p(ax)();
        }
    }

    function p(ax) {
        return function() {
            v[ax].iFrameOnloadTimeout = setTimeout(function() {
                am(ax, {
                    error: {
                        code: 404,
                        message: "Frame did not trigger load"
                    }
                });
            }, 5000);
            f(v[ax].elem, v[ax].url);
        };
    }

    function f(ax, ay) {
        ay += ay.indexOf("?") > 0 ? "&bust=" : "?bust=";
        ay += new Date().getTime();
        ay += "&loc=" + location.protocol + "//" + location.host;
        h("Setting iFrame to URL: " + ay, w.INFO, "setIFrameLocation");
        ax.setAttribute("src", ay);
    }

    function j(ax) {
        h("Creating reload object " + ax, w.INFO, "createReloadObject");
        var ay = v[ax].maxReloadRetries;
        return {
            retriesLeft: ay
        };
    }

    function z(ax) {
        h("Cleaning up reload object for this instance" + ax, w.INFO, "cleanUpReloadObject");
        if (v[ax].reloadObj) {
            if (v[ax].reloadObj.setLocationTimeout) {
                clearTimeout(v[ax].reloadObj.setLocationTimeout);
            }
            v[ax].reloadObj = null;
            delete v[ax].reloadObj;
        }
    }

    function ar(az) {
        var ay = ["callId", "responseType"];
        for (var ax = 0; ax < ay.length; ax++) {
            az[ay[ax]] = null;
            delete az[ay[ax]];
        }
    }

    function af(ax) {
        if (ax && v[ax]) {
            return {
                url: v[ax].url,
                validated: v[ax].validated,
                requestCount: v[ax].requestCount,
                defaults: ac(v[ax].defaults),
                started: v[ax].validated === I.VALIDATED
            };
        } else {
            return {};
        }
    }

    function al() {
        var ax = {};
        for (var ay in v) {
            if (v.hasOwnProperty(ay)) {
                ax[ay] = af(ay);
            }
        }
        return ax;
    }

    function an(az, ax, aA) {
        if (az && typeof az === "function") {
            try {
                az.call(ax || null, aA);
            } catch (ay) {
                h("Error in executing callback: " + ay, w.ERROR, "runCallback");
            }
        }
    }

    function B(az) {
        var ay;
        var aA;
        try {
            aA = az.origin;
            if (!v[aA]) {
                return;
            }
            ay = ap(az.data);
            ay.body = ap(ay.body);
        } catch (ax) {
            ay = null;
            h("Error in handling message from frame:" + ax + " origin: " + aA, w.ERROR, "handleMessage");
        }
        if (ay && typeof ay === "object") {
            E(ay, aA);
        }
    }

    function ap(az) {
        var ay;
        if (typeof az === "string") {
            try {
                ay = JSON.parse(az);
            } catch (ax) {
                h("Error in parsing string: " + az, w.DEBUG, "parseJSONString");
            }
        } else {
            ay = az;
        }
        return ay;
    }

    function h(az, ay, ax) {
        if (ak.lpTag && lpTag.log) {
            lpTag.log(az, ay, ax);
        }
    }

    function W(ax) {
        var aA = location.protocol.indexOf("https") === 0;
        if (ax) {
            if (ax.frames) {
                ax.frames = ax.frames.constructor === Array ? ax.frames : [ax.frames];
                for (var az = 0; az < ax.frames.length; az++) {
                    n(ax.frames[az], aA);
                }
            }
            if (ax.defaults) {
                for (var ay in ax.defaults) {
                    if (aw.hasOwnProperty(ay) && ax.defaults.hasOwnProperty(ay)) {
                        aw[ay] = ax.defaults[ay];
                    }
                }
            }
        }
        u = true;
    }

    function U() {
        if (lpTag && lpTag.taglets && lpTag.taglets.lpAjax) {
            try {
                lpTag.taglets.lpAjax.addTransport(V, ai);
            } catch (ax) {}
        }
    }

    function Z(ax) {
        if (lpTag.taglets.lpAjax && lpTag.taglets.lpAjax.publishMetrics) {
            if (ax.tags && ax.tags.constructor === Array) {
                ax.tags.push({
                    transport: V
                });
            }
            lpTag.taglets.lpAjax.publishMetrics(ax);
        }
    }
    var ai = {
        init: U,
        issueCall: l,
        isValidRequest: y,
        getVersion: function() {
            return x;
        },
        getName: function() {
            return V;
        },
        configure: W,
        getFrameData: af,
        inspect: function() {
            return {
                name: V,
                version: x,
                callsMade: F,
                errorsFound: o,
                pending: t,
                defaults: aw,
                iFrameList: ac(S),
                activeFrames: al()
            };
        }
    };
    U();
    return ai;
})(window);

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.taglets.jsonp = lpTag.taglets.jsonp || (function(L) {
    var C = {
        callback: "cb",
        encoding: "UTF-8",
        timeout: 10000,
        retries: 2,
        metricsCount: 100,
        metricsTimeout: 60000
    };
    var s = {
        ERROR: "ERROR",
        DEBUG: "DEBUG",
        INFO: "INFO"
    };
    var d = true;
    var e = false;
    var m = 2083;
    var j = "lpCb";
    var U = {};
    var p = 0;
    var f = 0;
    var t = 0;
    var W = 0;
    var A = 0;
    var u = [];
    var S;
    var l;
    var D = {};
    var g = K().length;
    var R = "1.1.7";
    var T = "jsonp";

    function c(Z) {
        if (typeof Z === "string") {
            var Y = Z;
            Z = {
                url: Y
            };
        }
        if (!Z.url) {
            return false;
        }
        Z.encoding = Z.encoding || C.encoding;
        Z.callback = Z.callback || C.callback;
        Z.retries = typeof Z.retries === "number" ? Z.retries : C.retries;
        Z.timeout = Z.timeout ? Z.timeout : C.timeout;
        return Z;
    }

    function K() {
        return Math.round(Math.random() * 99999) + "x" + Math.round(Math.random() * 99999);
    }

    function h(Z, Y) {
        return {
            statusCode: Z,
            responseCode: Z,
            error: Y,
            body: "ERROR"
        };
    }

    function x() {
        return "scr" + Math.round(Math.random() * 999999999) + "_" + Math.round(Math.random() * 999999999);
    }

    function P(aa) {
        var Y = false;
        if (d && aa && aa.url) {
            var Z = g;
            var ad = false;
            if (aa.callbackName && typeof aa.callbackName === "string") {
                Z = aa.callbackName.length;
                if (D[aa.callbackName] || L[aa.callbackName]) {
                    ad = true;
                }
            }
            var ac;
            try {
                ac = 4 + (aa.callback || C.callback).length + aa.url.length + Z + N(aa.data).length + N(aa.query).length;
            } catch (ab) {
                i("Could not evaluate the length  of the request, e=" + ab, s.ERROR, "isValidRequest");
                Y = false;
            }
            if (typeof ac !== "undefined" && (ac < m && !ad)) {
                Y = true;
            }
        }
        return Y;
    }

    function N(aa) {
        var ac = "";
        if (typeof aa === "string") {
            ac += aa;
        } else {
            var ab = true;
            for (var Y in aa) {
                var Z;
                if (typeof aa[Y] == "object") {
                    Z = X(aa[Y]);
                } else {
                    if (typeof aa[Y] !== "function") {
                        Z = aa[Y];
                    }
                }
                if (typeof Z !== "undefined") {
                    if (!ab) {
                        ac += "&";
                    }
                    ac += encodeURIComponent(Y) + "=" + encodeURIComponent(Z);
                    ab = false;
                }
            }
        }
        return ac;
    }

    function X(aa) {
        var Y;
        if (typeof Array.prototype.toJSON === "function") {
            var Z = Array.prototype.toJSON;
            delete Array.prototype.toJSON;
            try {
                Y = JSON.stringify(aa);
            } catch (ab) {
                Array.prototype.toJSON = Z;
                throw ab;
            }
            Array.prototype.toJSON = Z;
        } else {
            Y = JSON.stringify(aa);
        }
        return Y;
    }

    function F(Z) {
        var Y;
        if (P(Z)) {
            Z = c(Z);
            if (!Z.callbackName || typeof Z.callbackName !== "string") {
                Z.callbackName = j + K();
            } else {
                Z.retries = 0;
            }
            Y = Z.url + (Z.url.indexOf("?") > -1 ? "&" : "?") + Z.callback + "=" + Z.callbackName;
            if (Z.data) {
                Y += "&" + N(Z.data);
            }
            if (Z.query) {
                Y += "&" + N(Z.query);
            }
            Z.callUrl = Y;
            if (r(Z)) {
                k(Z);
                z();
            } else {
                i("URL request was too long and was not sent, url: " + Y, s.ERROR, "issueCall");
            }
        } else {
            i("URL request was too long or static callback name already exists, url: " + Y, s.ERROR, "issueCall");
            a();
            if (Z && Z.error) {
                b(s.ERROR, Z.error, h(600, "Transport - JSONP - unable to run request: " + Z.url), Z.context);
            }
            return false;
        }
        return true;
    }

    function r(Z) {
        var Y = false;
        var ac = new RegExp(/(http{1}s{0,1}?:\/\/)([^\/\?]+)(\/?)/ig);
        var ab;
        if (Z.callUrl.indexOf("http") === 0) {
            ab = ac.exec(Z.callUrl);
        } else {
            ab = ac.exec(L.location.href);
        }
        if (ab && ab.length >= 3 && ab[2] !== "") {
            var aa = ab[2].toLowerCase();
            Z.domainMatch = aa;
            U[aa] = U[aa] || [];
            U[aa].inFlight = U[aa].inFlight || 0;
            U[aa].push(Z);
            Y = true;
            f = f + 1;
            i("buffered URL: " + Z.callUrl, s.DEBUG, "lpTag.taglets.jsonp.bufferRequest");
        } else {
            i("NO MATCH for URL: " + Z.callUrl, s.ERROR, "lpTag.taglets.jsonp.bufferRequest");
        }
        return Y;
    }

    function z() {
        var ab;
        for (var Y in U) {
            if (U.hasOwnProperty(Y)) {
                ab = U[Y];
                var aa = false;
                while (!aa && ab.inFlight < 6 && ab.length > 0) {
                    var Z = ab.shift();
                    if (Z) {
                        i("Sent URL: " + Z.callUrl, s.DEBUG, "lpTag.taglets.jsonp.sendRequests");
                        Z.scriptId = M(Z.callUrl, Z.encoding, Z.callbackName);
                        Z.startTime = new Date().getTime();
                        I(Y, Z.callbackName, Z.timeout);
                        f = f - 1;
                    } else {
                        aa = true;
                    }
                }
            }
        }
        ab = null;
    }

    function H() {
        clearTimeout(S);
        S = null;
        var Y = new Date();
        for (var Z in D) {
            if (D.hasOwnProperty(Z) && D[Z].launchTime) {
                var aa = Y - D[Z].launchTime;
                if (D[Z].loadTime || aa > D[Z].timeout) {
                    L[Z].apply(null, [h(408, {
                        message: "Request timed out",
                        name: "timeout"
                    }), true]);
                }
            }
        }
        if (t > 0) {
            S = setTimeout(H, 1000);
        }
    }

    function M(Y, Z, aa) {
        var ac = x();
        var ab = document.createElement("script");
        ab.setAttribute("type", "text/javascript");
        ab.setAttribute("charset", Z);
        ab.onload = function() {
            if (D[aa]) {
                D[aa].loadTime = new Date();
            }
            this.onload = this.onerror = this.onreadystatechange = null;
        };
        if (!L.addEventListener) {
            ab.onreadystatechange = function() {
                if (this.readyState) {
                    if (this.readyState === "loaded" || this.readyState === "complete") {
                        if (D[aa]) {
                            D[aa].loadTime = new Date();
                        }
                        this.onload = this.onerror = this.onreadystatechange = null;
                    }
                }
            };
        } else {
            ab.onerror = function() {
                if (D[aa]) {
                    D[aa].loadTime = new Date();
                }
                this.onload = this.onerror = this.onreadystatechange = null;
            };
        }
        ab.setAttribute("src", Y);
        ab.setAttribute("id", ac);
        document.getElementsByTagName("head")[0].appendChild(ab);
        if (!S) {
            S = setTimeout(H, 1000);
        }
        ab = null;
        return ac;
    }

    function I(Y, aa, Z) {
        U[Y].inFlight = U[Y].inFlight + 1;
        D[aa] = {
            launchTime: new Date(),
            timeout: Z
        };
        t = t + 1;
        p = p + 1;
    }

    function a() {
        W = W + 1;
    }

    function y(ab) {
        var aa;
        while (aa = document.getElementById(ab)) {
            try {
                aa.parentNode.removeChild(aa);
                for (var Z in aa) {
                    if (aa.hasOwnProperty(Z)) {
                        delete aa[Z];
                    }
                }
            } catch (Y) {
                i("error when removing script", s.ERROR, "removeScript");
            }
        }
    }

    function J(Y) {
        U[Y].inFlight = U[Y].inFlight - 1;
        t = t - 1;
    }

    function B(aa, Z, Y) {
        G(Z.startTime, Z.url, Y);
        y(Z.scriptId);
        J(Z.domainMatch);
        V(Z.callbackName, Y);
        if (Y) {
            if (Z.callbackName) {
                Z.callbackName = null;
                delete Z.callbackName;
            }
            O(aa, Z);
        } else {
            o(Z);
            b("callback", Z.success, aa, Z.context);
            Z = null;
            z();
        }
    }

    function n() {
        var Y;
        if (lpTag.taglets.lpAjax && lpTag.taglets.lpAjax.publishMetrics && u.length > 0) {
            Y = {
                tags: [{
                    transport: T
                }],
                metrics: u
            };
            lpTag.taglets.lpAjax.publishMetrics(Y);
            u.length = 0;
        }
        E();
    }

    function E() {
        if (l) {
            clearTimeout(l);
        }
        l = setTimeout(n, C.metricsTimeout);
    }

    function G(ac, aa, ab) {
        var Y;
        var Z;
        if (ac) {
            Z = new Date().getTime();
            Y = Z - ac;
            u.push({
                rd: Y,
                ts: ac,
                url: aa,
                method: "GET",
                statusCode: ab ? 400 : 200
            });
            if (u.length >= C.metricsCount) {
                n();
            }
        }
    }

    function O(Z, Y) {
        A = A + 1;
        if (Y.retries > 0) {
            Y.retries = Y.retries - 1;
            F(Y);
        } else {
            o(Y);
            b(s.ERROR, Y.error, Z || h(408, {
                id: 408,
                name: "TIMEOUT",
                message: "Request has timed out on all retries"
            }), Y.context);
            Y = null;
            z();
        }
    }

    function o(aa) {
        var Z = ["callUrl", "retries", "id", "requestTimeout", "type", "encoding", "launchTime", "callbackName", "domainMatch", "startTime"];
        for (var Y = 0; Y < Z.length; Y++) {
            if (aa.hasOwnProperty(Z[Y])) {
                aa[Z[Y]] = null;
                delete aa[Z[Y]];
            }
        }
    }

    function b(Z, ac, aa, Y) {
        if (typeof ac === "function") {
            try {
                ac.call(Y || null, aa);
                ac = null;
            } catch (ab) {
                i("Exception in execution of callback, type :" + Z + " e=[" + ab.message + "]", s.ERROR, "runCallback");
            }
        } else {
            i("No callback, of type :" + Z, s.INFO, "runCallback");
        }
    }

    function V(aa, Y) {
        D[aa] = null;
        delete D[aa];
        if (Y === true) {
            L[aa] = function() {
                L[aa] = null;
                try {
                    delete L[aa];
                } catch (ab) {}
            };
        } else {
            L[aa] = null;
            try {
                delete L[aa];
            } catch (Z) {}
        }
    }

    function k(Y) {
        if (D[Y.callbackName]) {
            a();
            O(h(409, {
                message: "This callbackName is already in a pending request and can't be serviced",
                id: 409,
                name: "CONFLICT"
            }), Y);
        } else {
            L[Y.callbackName] = function(aa, Z) {
                B(aa, Y, Z);
            };
        }
    }

    function i(aa, Z, Y) {
        if (e === true || Z === s.ERROR) {
            if (L.lpTag && lpTag.log) {
                lpTag.log(aa, Z, Y);
            }
        }
    }

    function w(Y) {
        if (Y) {
            for (var Z in Y) {
                if (C.hasOwnProperty(Z) && Y.hasOwnProperty(Z)) {
                    C[Z] = Y[Z];
                }
            }
            e = typeof Y.debugMode === "boolean" ? Y.debugMode : e;
        }
        Q();
    }

    function Q() {
        if (lpTag && lpTag.taglets && lpTag.taglets.lpAjax) {
            try {
                lpTag.taglets.lpAjax.addTransport(T, q);
            } catch (Y) {}
        }
        E();
    }

    function v() {
        var Z = {};
        for (var Y in C) {
            if (C.hasOwnProperty(Y)) {
                Z[Y] = C[Y];
            }
        }
        return Z;
    }
    var q = {
        init: Q,
        configure: w,
        issueCall: F,
        isValidRequest: P,
        getVersion: function() {
            return R;
        },
        getName: function() {
            return T;
        },
        getDefaults: v,
        inspect: function() {
            return {
                name: T,
                version: R,
                callsMade: p,
                errorsFound: A,
                pending: t,
                buffered: f,
                refused: W,
                defaults: v()
            };
        }
    };
    Q();
    return q;
})(window);

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.taglets.xhr = lpTag.taglets.xhr || (function lpXHR(P) {
    var L = {
        JSON: "application/json",
        JAVASCRIPT: "text/javascript",
        HTML: "text/html",
        XMLAPP: "application/xml",
        XMLTEXT: "text/xml",
        FORM: "application/x-www-form-urlencoded;"
    };
    var y = {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
        DELETE: "DELETE"
    };
    var E = {
        PROGRESS: "progress",
        LOAD: "load",
        ERROR: "error",
        ABORT: "abort",
        READYSTATE: "readystatechange"
    };
    var x = {
        ERROR: "ERROR",
        DEBUG: "DEBUG",
        INFO: "INFO"
    };
    var I = {
        encoding: "UTF-8",
        method: y.GET,
        asynch: true,
        timeout: 30000,
        mimeType: L.JSON,
        cache: false,
        acceptHeader: "*/*",
        XMLHTTPOverride: true,
        retries: 2,
        metricsCount: 100,
        metricsTimeout: 60000
    };
    var l = {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECIEVED: 2,
        LOADING: 3,
        COMPLETE: 4
    };
    var af = "xhr";
    var ae = "1.1.6";
    var j = n(document.location.href);
    var f = "X-HTTP-Method-Override";
    var X = {
        responseCode: 404,
        HTTPStatus: "bad request",
        body: {
            error: "Request timed out"
        },
        headers: ""
    };
    var H = {
        responseCode: 600,
        HTTPStatus: "unable to service request",
        body: {
            error: "Transport - " + af + " - unable to run request"
        },
        headers: ""
    };
    var p = !P.addEventListener;
    var M = 2083;
    var t = 0;
    var e = 0;
    var o;
    var z = [];
    var T = [];
    var ad;
    var B = [];
    var c = true;

    function C(ak) {
        if (ak && ak.defaults) {
            for (var aj in ak.defaults) {
                if (ak.defaults.hasOwnProperty(aj) && I.hasOwnProperty(aj)) {
                    I[aj] = ak.defaults[aj];
                }
            }
        }
        ac();
        c = true;
    }

    function b(aj) {
        aj.method = aj.method || I.method;
        aj.encoding = aj.encoding || I.encoding;
        aj.mimeType = aj.mimeType || I.mimeType;
        aj.retries = !isNaN(aj.retries) ? aj.retries : I.retries;
        aj.timeout = !isNaN(aj.timeout) ? aj.timeout : I.timeout;
        aj.XMLHTTPOverride = typeof aj.XMLHTTPOverride == "boolean" ? aj.XMLHTTPOverride : I.XMLHTTPOverride;
        aj.cache = typeof aj.cache === "boolean" ? aj.cache : I.cache;
        aj.asynch = typeof aj.asynch === "boolean" ? aj.asynch : I.asynch;
        if ((aj.method.toLowerCase() === y.PUT.toLocaleLowerCase() || aj.method.toLowerCase() === y.DELETE.toLocaleLowerCase()) && aj.XMLHTTPOverride) {
            aj.headers[f] = aj.method;
            aj.method = y.POST;
        }
        return aj;
    }

    function v(ak) {
        var aj = ak.url.indexOf("__d=");
        if (aj > -1) {
            ak.url = ak.url.substr(0, aj - 1);
        }
        if (!ak.cache && (ak.method.toLowerCase() !== y.GET.toLowerCase() || ak.url.length <= M - 10)) {
            ak.url += ak.url.indexOf("?") > 0 ? "&__d=" : "?__d=";
            ak.url += Math.floor(Math.random() * 100000);
        }
    }

    function Z(al) {
        al = b(al);
        var ak = false;
        if (al && al.url && typeof al.url === "string") {
            if (j == n(al.url)) {
                if (!al.method || al.method.toLowerCase() === y.GET.toLowerCase()) {
                    var aj = M;
                    var am = "";
                    if (al.url.indexOf("http") !== 0) {
                        al.url = O(al.url);
                    }
                    try {
                        if (al.query) {
                            am = U(al.query);
                        }
                        if (al.data) {
                            am += U(al.data);
                        }
                    } catch (an) {
                        h("Error stringifying data", x.ERROR);
                        ak = false;
                    }
                    if (!al.cache) {
                        aj = aj - 10;
                    }
                    if (al.url.length + 1 + am.length <= aj) {
                        ak = true;
                    }
                } else {
                    ak = true;
                }
            }
        }
        return c && ak;
    }

    function O(al) {
        var ak = document.location.href.lastIndexOf("/") || document.location.href.lastIndexOf("?");
        var aj = document.location.href.substr(0, ak);
        al = aj + "/" + al;
        return al;
    }

    function n(aj) {
        var am = new RegExp(/(http{1}s{0,1}?:\/\/)([^\/\?]+)(\/?)/ig);
        var al;
        var ak = null;
        if (aj.indexOf("http") === 0) {
            al = am.exec(aj);
        } else {
            al = am.exec(P.location.href);
        }
        if (al && al.length >= 3 && al[2] !== "") {
            ak = al[1].toLowerCase() + al[2].toLowerCase();
        }
        return ak;
    }

    function q(an, am, ak) {
        am = am || {};
        am["Content-Type"] = A(am["Content-Type"] || I.mimeType, ak.encoding);
        am.Accept = am.Accept || I.acceptHeader;
        am["X-Requested-With"] = "XMLHttpRequest";
        if (am) {
            for (var aj in am) {
                if (am.hasOwnProperty(aj)) {
                    try {
                        an.setRequestHeader(aj, am[aj]);
                    } catch (al) {}
                }
            }
        }
        return an;
    }

    function A(ak, al) {
        var aj = ak;
        if (!aj || aj == "" || aj.indexOf("charset") < 0) {
            aj = (aj || I.MIMETYPE) + "; charset=" + (al || I.encoding);
        }
        return aj;
    }

    function K(aj) {
        if (Z(aj)) {
            D(aj);
        } else {
            if (aj && aj.error) {
                i(aj.error, H, aj.context);
            }
        }
    }

    function F(ak) {
        var al = p ? S(ak) : G(ak);
        if (al.overrideMimeType) {
            al.overrideMimeType(ak.mimeType);
        }
        try {
            if (ak.query) {
                ak.url = ai(ak.url, ak.query);
                ak.query = null;
            }
            if (ak.method === y.GET && ak.data) {
                ak.url = ai(ak.url, ak.data);
                ak.data = null;
            } else {
                if (typeof ak.data !== "undefined") {
                    ak.data = k(ak.data);
                }
            }
        } catch (aj) {
            ag(ak, al, false, {
                responseCode: 601,
                HTTPStatus: "Unable to service request",
                headers: "",
                body: {
                    error: "unable to stringify data for requests"
                }
            });
            return false;
        }
        v(ak);
        ak.xhr = al;
        al.open(ak.method, ak.url, ak.asynch);
        al = q(al, ak.headers, ak);
        R(ak);
        al.send(ak.data || null);
        if (!ad) {
            setTimeout(W, 1000);
        }
        return true;
    }

    function ai(aj, al) {
        var ak;
        ak = U(al);
        if (ak) {
            aj += aj.indexOf("?") < 0 ? "?" : "&";
            aj += ak;
        }
        return aj;
    }

    function R(aj) {
        aj.launchTime = new Date();
        T.push(aj);
        Q();
    }

    function D(aj) {
        z.push(aj);
        V();
    }

    function W() {
        if (ad) {
            clearTimeout(ad);
            ad = null;
        }
        var ak = new Date();
        var ao = [];
        for (var al = 0; al < T.length; al++) {
            var an = T[al];
            var am = ak.valueOf() - an.launchTime.valueOf();
            if (am > an.timeout) {
                ag(an, an.xhr, true);
                ao.push(an);
            }
        }
        for (var aj = 0; aj < ao.length; aj++) {
            aa(ao[aj]);
            ao[aj] = null;
        }
        if (z.length > 0 || T.length > 0) {
            ad = setTimeout(W, 1000);
        }
    }

    function ag(am, an, al, ak) {
        ab();
        if (am.launchTime) {
            N(am.launchTime.getTime(), am.url, am.method, ak && ak.responseCode || 408);
        }
        if (!al) {
            aa(am);
        }
        d(am);
        if (al && an) {
            try {
                an.abort();
            } catch (aj) {
                h("Error when trying to abort request " + am.url, x.ERROR);
            }
        }
        if (an) {
            Y(an);
        }
        if (am.retries > 0 && !ak) {
            am.retries = am.retries - 1;
            D(am);
        } else {
            i(am.error, ak || X, am.context);
        }
    }

    function U(al) {
        var an = "";
        if (typeof al === "string") {
            an += al;
        } else {
            var am = true;
            for (var aj in al) {
                var ak;
                if (typeof al[aj] == "object") {
                    ak = JSON.stringify(al[aj]);
                } else {
                    if (typeof al[aj] !== "function") {
                        ak = al[aj];
                    }
                }
                if (typeof ak !== "undefined") {
                    if (!am) {
                        an += "&";
                    }
                    an += encodeURIComponent(aj) + "=" + encodeURIComponent(ak);
                    am = false;
                }
            }
        }
        return an;
    }

    function d(al) {
        var ak = ["xhr"];
        for (var aj = 0; aj < ak.length; aj++) {
            al[ak[aj]] = null;
            delete al[ak[aj]];
        }
    }

    function k(aj) {
        if (typeof aj === "object") {
            return JSON.stringify(aj);
        } else {
            if (typeof aj === "string") {
                return aj;
            } else {
                return "";
            }
        }
    }

    function V() {
        while (T.length < 6 && z.length > 0) {
            F(z.shift());
        }
    }

    function i(am, ak, aj) {
        if (am && typeof am == "function") {
            try {
                am.call(aj, ak);
            } catch (al) {
                h(al.message);
            }
        }
    }

    function h(ak, aj) {
        if (P.lpTag && lpTag.log) {
            lpTag.log(ak, aj, af);
        }
    }

    function G(aj) {
        var ak = new P.XMLHttpRequest();
        ak.addEventListener(E.LOAD, function() {
            if (aj && !aj.completed) {
                m(this, aj);
                aj.completed = true;
            } else {
                aj = null;
            }
        });
        ak.addEventListener(E.PROGRESS, function() {
            var al = w(this);
            if (al && aj.progress) {
                i(aj.progress, al, aj.context);
            }
        });
        ak.addEventListener(E.ERROR, function() {
            if (aj && !aj.completed) {
                g(this, aj);
                aj.completed = true;
            } else {
                aj = null;
            }
        });
        ak.addEventListener(E.READYSTATE, function() {
            if (this.readyState === l.COMPLETE) {
                if (aj && !aj.completed) {
                    m(this, aj);
                    aj.completed = true;
                } else {
                    aj = null;
                }
            }
        });
        return ak;
    }

    function S(aj) {
        var ak = new P.XMLHttpRequest();
        ak[E.READYSTATE] = function() {
            if (!aj.completed) {
                if (this.readyState === l.COMPLETE) {
                    m(this, aj);
                    aj.completed = true;
                }
            }
        };
        ak[E.ERROR] = function() {
            g(this, aj);
        };
        return ak;
    }

    function Y(aj) {
        aj[E.READYSTATE] = null;
        aj[E.ERROR] = null;
        if (!p) {
            aj[E.PROGRESS] = null;
            aj[E.LOAD] = null;
        }
        aj = null;
    }

    function w(am) {
        var ak;
        var aj;
        if (am) {
            try {
                aj = ah(am);
                ak = {
                    responseCode: s(am, "status") || 404,
                    HTTPStatus: s(am, "statusText"),
                    body: s(am, "responseText", "string") || s(am, "responseXML"),
                    headers: aj.headers,
                    originalHeader: aj.originalHeader
                };
            } catch (al) {
                h(al.message, x.ERROR);
                return {};
            }
        } else {
            h("No data from request", x.INFO);
            return {};
        }
        if (ak && ak.headers && ak.headers["Content-Type"] && ak.headers["Content-Type"] === L.JSON) {
            try {
                ak.body = JSON.parse(ak.body);
            } catch (al) {}
        }
        ak.responseCode = ak.responseCode == 1223 ? 204 : ak.responseCode;
        if (ak.responseCode >= 12000) {
            ak.internalCode = ak.responseCode;
            ak.responseCode = 500;
        }
        ak.statusCode = ak.responseCode;
        return ak;
    }

    function s(am, aj, ak) {
        try {
            if (ak) {
                if (typeof am[aj] === ak) {
                    return am[aj];
                } else {
                    return "";
                }
            } else {
                return am[aj];
            }
        } catch (al) {
            return "";
        }
    }

    function ah(aq) {
        var an;
        var am = {};
        try {
            an = aq.getAllResponseHeaders();
        } catch (ao) {
            an = "";
        }
        if (an) {
            var al = an.split("\n");
            for (var ak = 0; ak < al.length; ak++) {
                try {
                    var aj = al[ak].split(":");
                    if (aj[0]) {
                        var ap = aj.length > 2 ? aj.slice(1).join(":") : aj[1];
                        am[a(aj[0])] = a(ap);
                    }
                } catch (ao) {}
            }
        }
        return {
            originalHeader: an,
            headers: am
        };
    }

    function a(aj) {
        if (aj && typeof aj === "string") {
            aj = aj.replace(/^[\s\r]*/, "");
            aj = aj.replace(/[\s\r]*$/g, "");
        }
        return aj;
    }

    function m(am, al) {
        d(al);
        var ak = w(am);
        if (al.launchTime) {
            N(al.launchTime.getTime(), al.url, al.method, ak.responseCode);
        }
        if (ak) {
            var aj;
            if (ak.responseCode > 399) {
                ag(al, am, false, ak);
            } else {
                aa(al);
                aj = al.success;
                i(aj, ak, al.context);
                Y(am);
            }
        }
        V();
    }

    function g(ak, aj) {
        ag(aj, ak);
        V();
    }

    function ab() {
        e = e + 1;
    }

    function Q() {
        t = t + 1;
    }

    function aa(ak) {
        for (var aj = 0; aj < T.length; aj++) {
            if (T[aj] === ak) {
                T.splice(aj, 1);
                break;
            }
        }
    }

    function N(an, al, ao, am) {
        var aj;
        var ak;
        if (an) {
            ak = new Date().getTime();
            aj = ak - an;
            B.push({
                rd: aj,
                ts: an,
                url: al,
                method: ao,
                statusCode: am
            });
            if (B.length >= I.metricsCount) {
                r();
            }
        }
    }

    function r() {
        var aj;
        if (lpTag.taglets.lpAjax && lpTag.taglets.lpAjax.publishMetrics && B.length > 0) {
            aj = {
                tags: [{
                    transport: af
                }],
                metrics: B
            };
            lpTag.taglets.lpAjax.publishMetrics(aj);
            B.length = 0;
        }
        J();
    }

    function J() {
        if (o) {
            clearTimeout(o);
        }
        o = setTimeout(r, I.metricsTimeout);
    }
    if (p) {
        E.READYSTATE = "on" + E.READYSTATE;
        E.ERROR = "on" + E.ERROR;
    }

    function ac() {
        if (lpTag && lpTag.taglets && lpTag.taglets.lpAjax && lpTag.taglets.lpAjax.addTransport) {
            try {
                lpTag.taglets.lpAjax.addTransport(af, u);
            } catch (aj) {}
        }
        J();
    }
    var u = {
        init: ac,
        configure: C,
        issueCall: K,
        isValidRequest: Z,
        getVersion: function() {
            return ae;
        },
        getName: function() {
            return af;
        },
        inspect: function() {
            return {
                name: af,
                version: ae,
                callsMade: t,
                errorsFound: e,
                pending: T.length,
                defaults: (function() {
                    var ak = {};
                    for (var aj in I) {
                        if (I.hasOwnProperty(aj)) {
                            ak[aj] = I[aj];
                        }
                    }
                    return ak;
                })()
            };
        }
    };
    ac();
    return u;
})(window);

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.taglets.rest2jsonp = lpTag.taglets.rest2jsonp || (function() {
    var R = "1.1";
    var D = "1";
    var S = "rest2jsonp";
    var o = 0;
    var i = 0;
    var h = 0;
    var B = {
        retries: 3,
        method: "GET",
        timeout: 30000,
        encoding: "UTF-8",
        callback: "cb"
    };
    var r = {
        prefix: "https://",
        middle: "/api/account/",
        suffix: "/js2rest"
    };
    var f = "";
    var F = {
        site: "",
        domain: ""
    };
    var k = "1";
    var n = 32;
    var N = {
        PART_PARAM: "lpP",
        OUTOF_PARAM: "lpO",
        SECURE_IDENTIFIER: "lpS"
    };
    var j = {
        VERSION_PARAM: "lpV",
        BODY_PARAM: "lpB",
        JSON: "lpjson",
        CALLID: "lpCallId"
    };
    var T = G().length;
    var E = 2083;
    var d = z();
    var J = v();
    var m = {};

    function y(X) {
        for (var W in B) {
            if (B.hasOwnProperty(W)) {
                X[W] = X[W] || B[W];
            }
        }
        X.data = x(X);
        X.url = f + a(X.data.u);
        return X;
    }

    function x(W) {
        return {
            u: K(W.url),
            m: W.method || B.method,
            b: W.data || "",
            h: W.headers || ""
        };
    }

    function K(W) {
        if (W && W.indexOf(".json?")) {
            W = W.replace(".json?", "?");
        }
        return W;
    }

    function O(W) {
        if (W && typeof W.url === "string" && typeof W.success === "function" && F.site && F.domain && f) {
            return true;
        } else {
            return false;
        }
    }

    function l(Y, W, X) {
        if (lpTag && lpTag.log) {
            lpTag.log(Y, W, X);
        }
    }

    function G() {
        return Math.round(Math.random() * 9999999999) + "-" + Math.round(Math.random() * 9999999999);
    }

    function A(W) {
        return W ? encodeURIComponent(V(W)) : "";
    }

    function V(Y) {
        var W;
        if (typeof Array.prototype.toJSON === "function") {
            var X = Array.prototype.toJSON;
            delete Array.prototype.toJSON;
            try {
                W = JSON.stringify(Y);
            } catch (Z) {
                Array.prototype.toJSON = X;
                throw Z;
            }
            Array.prototype.toJSON = X;
        } else {
            W = JSON.stringify(Y);
        }
        return W;
    }

    function z() {
        var X = 0;
        for (var W in j) {
            if (j.hasOwnProperty(W)) {
                X += ("&" + j[W] + "=99").length;
            }
        }
        X += R.length + B.callback.length + k.length + T;
        return X;
    }

    function v() {
        var X = 0;
        for (var W in N) {
            if (N.hasOwnProperty(W)) {
                X += ("&" + N[W] + "=99").length;
            }
        }
        X += 3;
        X += n;
        return X;
    }

    function q(Z, X) {
        var W = Z.url + (Z.url.indexOf("?") > -1 ? "&" : "?") + j.VERSION_PARAM + "=" + D + "&" + j.JSON + "=" + k;
        if (X) {
            var Y = A(Z.data);
            if (Y) {
                W += "&" + j.BODY_PARAM + "=" + Y;
            }
        }
        return W;
    }

    function L(W) {
        return W.url.length + d + A(W.data).length > E;
    }

    function c(X, aa, Y, W) {
        if (typeof aa === "function") {
            try {
                aa.call(W || null, Y);
            } catch (Z) {
                l("Exception in execution of callback, type :" + X + " e=[" + Z.message + "]", "ERROR", "lpTag.JSONP.runCallback");
            }
        } else {
            l("No callback, of type :" + X, "INFO", "lpTag.JSONP.runCallback");
        }
    }

    function I(Y, W) {
        var X = {};
        X.encoding = Y.encoding;
        X.timeout = Y.timeout || B.timeout;
        X.callback = Y.callback || B.callback;
        X.retries = typeof W === "number" ? W : 0;
        return X;
    }

    function g(W) {
        W.id = G();
        m[W.id] = {
            originalRequest: W,
            index: 0,
            baseUrl: q(W, false),
            urls: Q(W.url, A(W.data), W.id),
            interimObj: I(W)
        };
        t(m[W.id].interimObj, m[W.id]);
    }

    function t(X, W) {
        X.url = H(W);
        X.id = W.id + "!" + W.index;
        X.success = function(Y) {
            if (Y && (Y.responseCode === 200 || Y.responseCode === 201)) {
                if (Y && Y.lpMeta && Y.lpMeta.lpS) {
                    W.secureId = Y.lpMeta.lpS;
                }
                if (W.index + 1 < W.urls.length) {
                    W.index++;
                    t(X, W);
                } else {
                    W.originalRequest.success.apply(null, [Y]);
                    w(W.id);
                }
            } else {
                W.originalRequest.error.apply(null, [Y]);
                w(W.id);
                P();
            }
            b();
        };
        X.error = X.success;
        lpTag.taglets.jsonp.issueCall(X);
        M();
    }

    function U(X) {
        var W = I(X, X.retries || B.retries);
        W.id = G();
        W.url = q(X, true);
        W.success = function(Y) {
            if (Y.responseCode && Y.responseCode === 200 || Y.responseCode === 201) {
                c("CALLBACK", X.success, Y, X.context);
            } else {
                c("ERROR", X.error, Y, X.context);
                P();
            }
            W = null;
            X = null;
            b();
        };
        W.error = function(Y) {
            c("ERROR", X.error, Y, X.context);
            W = null;
            X = null;
            b();
            P();
        };
        lpTag.taglets.jsonp.issueCall(W);
        M();
    }

    function w(W) {
        m[W] = null;
        delete m[W];
    }

    function H(W) {
        return W.baseUrl + "&" + N.PART_PARAM + "=" + (W.index + 1) + "&" + N.OUTOF_PARAM + "=" + W.urls.length + (W.secureId ? "&" + N.SECURE_IDENTIFIER + "=" + W.secureId : "") + "&" + j.BODY_PARAM + "=" + W.urls[W.index];
    }

    function Q(W, X, Z) {
        W += "&" + j.CALLID + "=" + Z;
        var Y = E - W.length - J - d;
        return s(Y, X);
    }

    function s(W, Y) {
        var aa = "";
        var ae = [];
        var Z;
        var X = Y.split("%");
        for (Z = 0; Z < X.length; Z++) {
            if (X[Z].length > W) {
                X[Z] = ab(aa, X[Z], ae, Z, W);
                aa = "";
                aa = ac(X[Z], W, ae);
            } else {
                aa = ad(aa, X[Z], W, ae, Z);
            }
        }
        if (aa !== "") {
            ae.push(aa);
        }

        function ab(ai, ak, ag, ah, af) {
            ai += ah > 0 ? "%" : "";
            var aj = af - ai.length;
            ai += ak.substring(0, aj);
            ag.push(ai);
            ak = ak.substring(aj, ak.length);
            return ak;
        }

        function ac(ak, af, ah) {
            var aj = Math.ceil(ak.length / af);
            for (var ai = 0; ai < aj; ai++) {
                var ag = ak.substring(ai * af, (ai + 1) * af);
                if (ai + 1 < aj) {
                    ah.push(ag);
                }
            }
            return ag;
        }

        function ad(aj, ak, af, ag, ah) {
            var ai = (aj + ak).length;
            ai += ah > 0 ? 1 : 0;
            if (ai > af) {
                ag.push(aj);
                aj = "";
            }
            aj += ah > 0 ? "%" : "";
            aj += ak;
            return aj;
        }
        return ae;
    }

    function M() {
        o = o + 1;
        h = h + 1;
    }

    function b() {
        h = h > 0 ? h - 1 : 0;
    }

    function P() {
        i = i + 1;
    }

    function C(W) {
        if (O(W)) {
            W = y(W);
            if (L(W)) {
                return g(W);
            } else {
                return U(W);
            }
        } else {
            return false;
        }
    }

    function a(W) {
        var X = "";
        if (W.indexOf("/agentSession") != -1) {
            X = "/agentSession";
        } else {
            if (W.indexOf("/chat") != -1) {
                X = "/chat";
            } else {
                if (W.indexOf("/visit") != -1) {
                    X = "/visit";
                    if (W.indexOf("/keepAlive") != -1) {
                        X += "/keepAlive";
                    }
                } else {
                    if (W.indexOf("/configuration") != -1) {
                        X = "/configuration";
                    }
                }
            }
        }
        return X;
    }

    function u(X) {
        for (var W in X) {
            if (X.hasOwnProperty(W)) {
                if (B.hasOwnProperty(W)) {
                    B[W] = X[W];
                } else {
                    if (F.hasOwnProperty(W)) {
                        F[W] = X[W];
                    }
                }
            }
        }
        if (F.domain && F.site) {
            f = r.prefix + F.domain + r.middle + F.site + r.suffix;
        }
    }
    var p = {
        init: function() {
            if (lpTag && lpTag.taglets && lpTag.taglets.lpAjax) {
                try {
                    lpTag.taglets.lpAjax.addTransport(S, p);
                } catch (W) {}
            }
        },
        configure: u,
        issueCall: C,
        isValidRequest: O,
        getVersion: function() {
            return R;
        },
        getName: function() {
            return S;
        },
        inspect: function() {
            return {
                name: S,
                version: R,
                callsMade: o,
                errorsFound: i,
                pending: h,
                baseUrl: f,
                defaults: (function() {
                    var X = {};
                    for (var W in B) {
                        if (B.hasOwnProperty(W)) {
                            X[W] = B[W];
                        }
                    }
                    return X;
                })()
            };
        }
    };
    if (lpTag && lpTag.taglets && lpTag.taglets.lpAjax) {
        try {
            lpTag.taglets.lpAjax.addTransport(S, p);
        } catch (e) {}
    }
    return p;
})();

(function(d) {
    d.lpTag = d.lpTag || {};
    lpTag.taglets = lpTag.taglets || {};
    lpTag.utils = lpTag.utils || {};
    var a = lpTag.utils;

    function b(g, f, e) {
        if (lpTag && lpTag.utils && lpTag.utils.log) {
            lpTag.utils.log(g, f, e);
        }
    }
    a.runErrorCallback = function(f, e) {
        if (f && f.error) {
            lpTag.utils.runCallback(f.error, f, e);
        }
        e = null;
        f = null;
    };
    a.runSuccessCallback = function(f, e) {
        if (f && f.success) {
            lpTag.utils.runCallback(f.success, f, e);
        }
    };
    a.runCallback = function(h, g, f) {
        if (h && typeof h === "function") {
            try {
                h.call(g.context || g, f);
            } catch (e) {
                b("Failed to run callback, callback: " + h + " data: " + f, "error", "lpTag.utils.runCallback");
            }
        }
    };
    a.trim = function(e) {
        if (typeof e === "string" && e !== "") {
            e = e.replace(/^[\s*\n*\r*\t\*]*$[\s*\n*\r*\t\*]*/g, "");
        }
        return e;
    };
    a.getErrorData = function(h, g, f, i) {
        h = c(h, g, f);
        for (var e in i) {
            if (i.hasOwnProperty(e) && !h[e]) {
                h[e] = i[e];
            }
        }
        i = null;
        return h;
    };

    function c(h, f, e) {
        var g = h && h.body ? h.body : null;
        if (!g) {
            g = h && h.error ? h.error : {
                error: {
                    message: f,
                    time: new Date(),
                    originalRequest: e
                }
            };
        }
        return g;
    }
    a.getResponseData = function(j, n, e, m) {
        var l = j && j.body ? j.body : j;
        l = l || {};
        var f;
        var k;
        var p;
        if (n) {
            p = n.split(".");
            k = p.length;
            for (var h = 0; h < k; h++) {
                f = p[h];
                if (typeof l[f] !== "undefined") {
                    l = l[f];
                } else {
                    break;
                }
            }
            if (e === true) {
                var g = {};
                g[p[k - 1]] = l;
                l = g;
            }
        }
        l = a.removeRels(l);
        for (var o in m) {
            if (m.hasOwnProperty(o) && typeof l[o] === "undefined") {
                l[o] = m[o];
            }
        }
        return l;
    };
    a.removeRels = function(f) {
        for (var e in f) {
            if (f.hasOwnProperty(e)) {
                if (e == "link") {
                    f[e] = null;
                    delete f[e];
                } else {
                    if (typeof f[e] === "object") {
                        f[e] = lpTag.utils.removeRels(f[e]);
                    }
                }
            }
        }
        return f;
    };
    a.deleteProps = function(h, g) {
        for (var f = 0; f < g.length; f++) {
            if (h.hasOwnProperty(g[f])) {
                try {
                    h[g[f]] = null;
                    delete h[g[f]];
                } catch (e) {}
            }
        }
    };
    a.hasProperties = function(g) {
        var e = false;
        if (g && typeof g === "object") {
            for (var f in g) {
                if (g.hasOwnProperty(f)) {
                    e = true;
                    break;
                }
            }
        }
        return e;
    };
})(window);

window.lpTag = window.lpTag || {};
lpTag.taglets = lpTag.taglets || {};
lpTag.utils = lpTag.utils || {};
lpTag.utils.log = lpTag.utils.log || function() {};
lpTag.utils.log.debug = false;
lpTag.taglets.ChatOverRestAPI = lpTag.taglets.ChatOverRestAPI || function ChatOverRestAPI(ag) {
    if (this === window) {
        return false;
    }
    var O = this;
    var r = "ChatOverRestAPI";
    var Z = {};
    var ae = 0;
    var P = ag && ag.failureTolerance || 9;
    var i = {};
    var l;
    var S;
    var Y;
    var f = false;
    var m = false;
    var N = 0;
    var ac = "1.1.5";
    var u = {
        resumeMode: "lpVisitorResumeMode",
        sessionVars: "lpVisitorSessionVars",
        chat: "lpVisitorChatRels",
        sessionUID: "lpSessionUID"
    };
    var L = {
        QA: "QA",
        DEV: "DEV",
        PRODUCTION: "PRODUCTION",
        CI: "CI",
        CLOUD: "CLOUD"
    };
    var W = L.PRODUCTION;
    var ah = function() {
        return W != L.PRODUCTION ? "/hcp/html/lpsunco/postmessage.html" : "/hcp/html/postmessage.min.html";
    };
    var y = {
        ERROR: "ERROR",
        INFO: "INFO"
    };
    var ai = lpTag.utils;
    var o;
    var q = lpTag && lpTag.taglets && lpTag.taglets.jsonp;
    var H = lpTag && lpTag.taglets && lpTag.taglets.lpAjax;
    var s = false;
    var ab = {
        typing: false,
        visitorName: "",
        agentName: "",
        rtSessionId: "",
        initialised: false,
        agentTyping: false,
        chatInProgress: false,
        visitorId: "",
        agentId: "",
        timeout: "",
        chatSessionKey: "",
        chatState: "",
        exitSurveyOn: false
    };
    var b = false;
    O.getSiteDomain = function(an) {
        var am = "https://api.liveperson.net/csdr/account/";
        var ak = "/service/adminArea/baseURI.lpCsds?version=1.0";
        if (typeof an.success !== "function" || !an.site) {
            return E({
                error: "missing callback or site - cannot lookup domain"
            }, "", "", "");
        }
        var al = {
            url: am + an.site + ak
        };
        al.success = function(ar) {
            var aq;
            k(y.INFO, {
                originalRequest: {
                    site: an.site
                },
                sentRequest: al,
                response: ar
            });
            if (ar && ar.ResultSet && ar.ResultSet.lpData) {
                var ap = ar.ResultSet.lpData;
                for (var ao = 0; ao < ap.length; ao++) {
                    if (!aq && ap[ao]["lpServer"]) {
                        aq = ap[ao]["lpServer"];
                    }
                }
            }
            al = null;
            if (aq) {
                ai.runSuccessCallback(an, {
                    domain: aq,
                    site: an.site
                });
            } else {
                ai.runErrorCallback(an, {
                    error: "unable to resolve site domain",
                    response: ar,
                    site: an.site
                });
            }
        };
        al.error = al.success;
        k(y.INFO, {
            originalRequest: {
                site: an.site
            },
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return q.issueCall(al);
    };
    O.requestChat = function(ak) {
        if (ab.initialised) {
            x(ak);
        } else {
            ak = ak || {};
            ak.requestChat = true;
            ak.lpNumber = ag.lpNumber;
            ak.appKey = ag.appKey;
            ak.domain = ag.domain || null;
            ak.clearDomain = true;
            aa(ak);
        }
    };
    O.startChat = O.requestChat;
    O.reInit = function(ak) {
        ab = {
            typing: false,
            visitorName: "",
            agentName: "",
            rtSessionId: "",
            initialised: false,
            agentTyping: false,
            chatInProgress: false,
            visitorId: "",
            agentId: "",
            timeout: "",
            chatSessionKey: "",
            chatState: "",
            exitSurveyOn: false
        };
        if (ak) {
            if (ak.disposeVisitor === true) {
                O.disposeVisitor();
            }
            if (ak.sessionUID) {
                ag = ag || {};
                ag.sessionUID = ak.sessionUID;
            }
        }
        Y.clearData();
        U();
    };
    O.getAvailableSlots = function(al) {
        var ak = {};
        if (al) {
            if (al.agent && typeof al.agent === "string") {
                ak.agent = al.agent;
            } else {
                if (al.skill && typeof al.skill === "string") {
                    ak.skill = al.skill;
                }
                if (typeof al.maxWaitTime === "number") {
                    ak.maxWaitTime = al.maxWaitTime;
                }
            }
        }
        var am = Y.buildRequestObj({
            rel: "chat-available-slots",
            type: "chat",
            needAuth: true,
            requestType: "GET",
            queryParams: ak
        });
        if (!am) {
            return E({
                error: "getAvailableSlots - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = ai.getResponseData(ao, "availableSlots", true);
                l.publish({
                    eventName: "onAvailableSlots",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(al, am, an, "onAvailableSlots", "getAvailableSlots - server error");
        };
        k(y.INFO, {
            originalRequest: al || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.getEstimatedWaitTime = function(al) {
        var ak = {};
        if (al) {
            if (al.skill && typeof al.skill === "string") {
                ak.skill = al.skill;
            }
            if (al.serviceQueue && typeof al.serviceQueue === "string") {
                ak.serviceQueue = al.serviceQueue;
            }
        }
        var am = Y.buildRequestObj({
            rel: "chat-estimatedWaitTime",
            type: "chat",
            needAuth: true,
            requestType: "GET"
        });
        if (!am) {
            return E({
                error: "getEstimatedWaitTime - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: "",
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = ai.getResponseData(ao, "estimatedWaitTime", true);
                l.publish({
                    eventName: "onEstimatedWaitTime",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(al, am, an, "onEstimatedWaitTime", "getEstimatedWaitTime - server error");
        };
        k(y.INFO, {
            originalRequest: "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.getAvailabilty = function(al) {
        var ak = {};
        if (al) {
            if (al.agent && typeof al.agent === "string") {
                ak.agent = al.agent;
            } else {
                if (al.skill && (typeof al.skill === "string" || al.skill.constructor === Array)) {
                    ak.skill = al.skill;
                }
                if (typeof al.maxWaitTime === "number") {
                    ak.maxWaitTime = al.maxWaitTime;
                }
            }
        }
        var am = Y.buildRequestObj({
            rel: "chat-availability",
            type: "chat",
            needAuth: true,
            requestType: "GET",
            queryParams: ak
        });
        if (!am) {
            return E({
                error: "getAvailability - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = ai.getResponseData(ao, "availability", true);
                if (an.availability && an.availability.AvailabilityForSkills && an.availability.AvailabilityForSkills.skillAvailability) {
                    an = n(an.availability.AvailabilityForSkills.skillAvailability);
                }
                l.publish({
                    eventName: "onAvailability",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(al, am, an, "onAvailability", "getAvailabilty - server error");
        };
        k(y.INFO, {
            originalRequest: al || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.getAvailability = O.getAvailabilty;
    O.disposeVisitor = function() {
        S.sessionEnded();
        l.publish({
            eventName: "onVisitorDisposed",
            data: {
                visitorDisposed: true,
                aSync: true
            }
        });
    };
    O.clearSessionData = function(ak) {
        if (ak) {
            o.removeSessionData(e(ak));
            return true;
        }
        return false;
    };
    O.getPreChatSurvey = function(al) {
        var ak = {};
        if (al) {
            if (al.visitorProfile && typeof al.visitorProfile === "string") {
                ak.visitorProfile = al.visitorProfile;
            } else {
                if (al.skill && typeof al.skill === "string") {
                    ak.skill = al.skill;
                }
            }
        }
        if (al.visitorIp && typeof al.visitorIp === "string") {
            ak.visitorIp = al.visitorIp;
        }
        if (al.surveyName && typeof al.surveyName === "string") {
            ak.surveyName = al.surveyName;
        } else {
            if (al.surveyApiId) {
                ak.surveyApiId = al.surveyApiId;
            }
        }
        var am = Y.buildRequestObj({
            rel: "prechat-survey",
            type: "chat",
            needAuth: true,
            requestType: "GET",
            queryParams: ak
        });
        if (!am) {
            return E({
                error: "getPreChatSurvey - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = ai.getResponseData(ao, "survey", true);
                l.publish({
                    eventName: "onPreChatSurvey",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(al, am, an, "onPreChatSurvey", "getPreChatSurvey - server error");
        };
        k(y.INFO, {
            originalRequest: al || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.getOfflineSurvey = function(al) {
        var ak = {};
        if (al) {
            if (al.skill && typeof al.skill === "string") {
                ak.skill = al.skill;
            } else {
                if (al.visitorProfile && typeof al.visitorProfile === "string") {
                    ak.visitorProfile = al.visitorProfile;
                } else {
                    if (al.visitorId && typeof al.visitorId === "string") {
                        ak.visitorId = al.visitorId;
                    } else {
                        if (al.surveyName && typeof al.surveyName === "string") {
                            ak.surveyName = al.surveyName;
                        } else {
                            if (al.surveyApiId) {
                                ak.surveyApiId = al.surveyApiId;
                            }
                        }
                    }
                }
            }
        }
        var am = Y.buildRequestObj({
            rel: "chat-offline-survey",
            type: "chat",
            needAuth: true,
            requestType: "GET",
            queryParams: ak
        });
        if (!am) {
            return E({
                error: "getOfflineSurvey - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = ai.getResponseData(ao, "survey", true);
                l.publish({
                    eventName: "onOfflineSurvey",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(al, am, an, "onOfflineSurvey", "getOfflineSurvey - server error");
        };
        k(y.INFO, {
            originalRequest: al || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.submitOfflineSurvey = function(ak) {
        var al = {};
        var an;
        if (!ak.survey) {
            return E({
                error: "Survey must be present in order to submit"
            }, "", "", "");
        } else {
            al.survey = ak.survey;
        }
        an = ak.visitorSessionId || o.readCookie(Z.lpNumber + "-SKEY") || window.lpMTagConfig && window.lpMTagConfig.LPSID_VAR;
        if (an) {
            al.survey.visitorSessionId = an;
        }
        if (typeof ak.LETagVisitorId === "string") {
            al.survey.LETagVisitorId = ak.LETagVisitorId;
        }
        if (typeof ak.LETagSessionId === "string") {
            al.survey.LETagSessionId = ak.LETagSessionId;
        }
        if (typeof ak.LETagContextId === "string") {
            al.survey.LETagContextId = ak.LETagContextId;
        }
        var am = ak.visitorId || o.readCookie(Z.lpNumber + "-VID");
        if (am) {
            al.survey.visitorId = am;
        }
        var ao = Y.buildRequestObj({
            rel: "chat-offline-survey",
            type: "chat",
            needAuth: true,
            requestType: "PUT",
            data: al
        });
        if (!ao) {
            return E({
                error: "submitOfflineSurvey - unable to find rel for request"
            }, "", "", "");
        }
        ao.success = function(aq) {
            k(y.INFO, {
                originalRequest: ak || "",
                sentRequest: ao,
                response: aq
            });
            if (aq) {
                var ap = ai.getResponseData(aq);
                l.publish({
                    eventName: "onSubmitOfflineSurvey",
                    data: ap
                });
                ai.runSuccessCallback(ak, ap);
            }
            ao = null;
        };
        ao.error = function(ap) {
            af(ak, ao, ap, "onSubmitOfflineSurvey", "submitOfflineSurvey - server error");
        };
        k(y.INFO, {
            originalRequest: ak || "",
            sentRequest: ao,
            response: "SENDING REQUEST"
        });
        return H.issueCall(ao);
    };
    O.pauseChat = function() {
        b = true;
        F(J(O.chatStates.PAUSECHAT));
        S.changeKeepAliveState();
    };
    O.resumePausedChat = function() {
        b = false;
        F(J(O.chatStates.RESUMEPAUSEDCHAT));
        S.changeKeepAliveState();
    };
    O.setCustomVariable = function(ak) {
        if (!ak.customVariable) {
            return E({
                error: "setCustomVariable - no variables passed in"
            }, "", "", "");
        } else {
            var am = d(ak.customVariable);
            if (am && am.customVariable) {
                ak.customVariable = am.customVariable;
            } else {
                return E({
                    error: "setCustomVariable - unable to find any custom variables to set"
                }, "", "", "");
            }
        }
        var al = Y.buildRequestObj({
            rel: "custom-variables",
            type: "chat",
            needAuth: true,
            requestType: "PUT",
            data: {
                customVariables: {
                    customVariable: ak.customVariable
                }
            }
        });
        if (!al) {
            return E({
                error: "setCustomVariable - unable to find rel for request"
            }, "", "", "");
        }
        al.success = function(ao) {
            k(y.INFO, {
                originalRequest: ak || "",
                sentRequest: al,
                response: ao
            });
            if (ao) {
                var an = {
                    customVariable: ak.customVariable
                };
                l.publish({
                    eventName: "onSetCustomVariable",
                    data: an
                });
                ai.runSuccessCallback(ak, an);
            }
            al = null;
        };
        al.error = function(an) {
            af(ak, al, an, "onSetCustomVariable", "setCustomVariable  - server error");
        };
        k(y.INFO, {
            originalRequest: ak || "",
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return H.issueCall(al);
    };
    O.requestTranscript = function(al) {
        var ak = new RegExp(/[a-zA-Z0-9.-_]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
        if (typeof al === "string") {
            al = {
                email: al
            };
        }
        if (!al.email || !ak.test(al.email)) {
            return E({
                error: "requestTranscriptEmail - no variables passed in or invalid email"
            }, "", "", "");
        }
        var am = Y.buildRequestObj({
            rel: "transcript-request",
            type: "chat",
            needAuth: true,
            requestType: "PUT",
            data: {
                email: al.email
            }
        });
        if (!am) {
            return E({
                error: "requestTranscript - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = {
                    email: al.email
                };
                l.publish({
                    eventName: "onTranscript",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(al, am, an, "onTranscript", "requestTranscriptEmail  - server error");
        };
        k(y.INFO, {
            originalRequest: al || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.getExitSurvey = function(al) {
        var ak = {};
        if (al && al.surveyName) {
            ak.surveyName = al.surveyName;
        } else {
            if (al && al.surveyApiId) {
                ak.surveyApiId = al.surveyApiId;
            }
        }
        var am = Y.buildRequestObj({
            rel: "exit-survey",
            type: "chat",
            needAuth: true,
            requestType: "GET",
            queryParams: ak
        });
        if (!am) {
            return E({
                error: "getExitSurvey - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: ao
            });
            var an = {};
            if (ao && ao.body && ao.body.survey) {
                ab.exitSurveyOn = true;
                S.changeKeepAliveState();
                an = ai.getResponseData(ao, "survey", true);
                l.publish({
                    eventName: "onExitSurvey",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            ab.exitSurveyOn = false;
            S.changeKeepAliveState();
            af(al, am, an, "onExitSurvey", "getExitSurvey  - server error");
        };
        k(y.INFO, {
            originalRequest: al || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.submitExitSurvey = function(ak) {
        var al = {};
        if (!ak.survey) {
            return E({
                error: "submitExitSurvey - no survey passed in"
            }, "", "", "");
        }
        if (ak.survey.survey) {
            al.survey = ak.survey.survey;
        } else {
            al.survey = ak.survey;
        }
        if (document.referrer) {
            al.survey.chatReferrer = document.referrer;
        }
        if (navigator && navigator.userAgent) {
            al.survey.userAgent = navigator.userAgent;
        }
        var am = Y.buildRequestObj({
            rel: "exit-survey",
            type: "chat",
            needAuth: true,
            requestType: "PUT",
            data: al
        });
        if (!am) {
            return E({
                error: "submitExitSurvey - unable to find rel for request"
            }, "", "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: ak || "",
                sentRequest: am,
                response: ao
            });
            ab.exitSurveyOn = false;
            S.changeKeepAliveState();
            if (ao) {
                var an = ai.getResponseData(ao);
                l.publish({
                    eventName: "onSubmitExitSurvey",
                    data: an
                });
                ai.runSuccessCallback(ak, an);
            }
            am = null;
        };
        am.error = function(an) {
            af(ak, am, an, "onSubmitExitSurvey", "submitExitSurvey  - server error");
        };
        k(y.INFO, {
            originalRequest: ak || "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.addLine = function(ak) {
        if (!ak) {
            return E({
                error: "No object data passed"
            }, "", "", "");
        }
        if (!ak.text) {
            return E({
                error: "No text to send"
            }, ak, "", "");
        }
        var al = Y.buildRequestObj({
            rel: "events",
            needAuth: true,
            type: "chat",
            requestType: "POST",
            data: {
                event: {
                    "@type": "line",
                    text: ak.text
                }
            }
        });
        if (!al) {
            return E({
                error: "addLine - unable to find rel for request"
            }, ak, "", "");
        }
        al.success = function(an) {
            k(y.INFO, {
                originalRequest: ak,
                sentRequest: al,
                response: an
            });
            if (an) {
                var am = {
                    text: ak.text
                };
                l.publish({
                    eventName: "onAddLine",
                    data: am
                });
                ai.runSuccessCallback(ak, am);
            }
            al = null;
        };
        al.error = function(am) {
            af(ak, al, am, "onAddLine", "addLine  - server error");
        };
        k(y.INFO, {
            originalRequest: ak,
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return H.issueCall(al);
    };
    O.setVisitorTyping = function(ak) {
        if (!ak) {
            return E({
                error: "No object data passed"
            }, "", "", "");
        }
        if (typeof ak.typing !== "boolean" || ak.typing == ab.typing) {
            return E({
                error: "setVisitorTyping typing status missing, not a boolean or unchanged from previous update"
            }, ak, "", "");
        } else {
            ab.typing = ak.typing;
        }
        var al = Y.buildRequestObj({
            rel: "visitor-typing",
            needAuth: true,
            type: "visitor",
            requestType: "PUT",
            data: {
                visitorTyping: ak.typing ? "typing" : "not-typing"
            }
        });
        if (!al) {
            return E({
                error: "setVisitorTyping - unable to find rel for request"
            }, ak, "", "");
        }
        al.success = function(an) {
            k(y.INFO, {
                originalRequest: ak,
                sentRequest: al,
                response: an
            });
            if (an) {
                var am = {
                    typing: ak.typing
                };
                l.publish({
                    eventName: "onSetVisitorTyping",
                    data: am
                });
                ai.runSuccessCallback(ak, am);
            }
            al = null;
        };
        al.error = function(am) {
            af(ak, al, am, "onSetVisitorTyping", "setVisitorTyping  - server error");
        };
        k(y.INFO, {
            originalRequest: ak,
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return H.issueCall(al);
    };
    O.endChat = function(ak) {
        var al = Y.buildRequestObj({
            rel: "events",
            type: "chat",
            needAuth: true,
            requestType: "POST",
            data: {
                event: {
                    "@type": "state",
                    state: O.chatStates.ENDED
                }
            }
        });
        if (!al || !ab.chatInProgress) {
            return E({
                error: "endChat - unable to find rel for request, or chat not active"
            }, ak, "", "");
        }
        al.success = function(an) {
            k(y.INFO, {
                originalRequest: ak,
                sentRequest: al,
                response: an
            });
            if (an) {
                var am = J(O.chatStates.ENDED);
                F(am);
                ai.runSuccessCallback(ak, am);
            }
            al = null;
        };
        al.error = function(am) {
            af(ak, al, am, ["onState"], "endChat - server error");
        };
        if (ak && ak.disposeVisitor) {
            O.disposeVisitor();
        }
        k(y.INFO, {
            originalRequest: ak,
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return H.issueCall(al);
    };
    O.setVisitorName = function(al) {
        if (!al) {
            return E({
                error: "No object data passed"
            }, "", "", "");
        }
        var ak = "";
        if (typeof al.visitorName !== "string" || al.visitorName == ab.visitorName) {
            return E({
                error: "setVisitorName missing visitorName or unchanged from previous update"
            }, al, "", "");
        } else {
            ak = ab.visitorName;
            ab.visitorName = al.visitorName;
        }
        var am = Y.buildRequestObj({
            rel: "visitor-name",
            needAuth: true,
            type: "visitor",
            requestType: "PUT",
            data: {
                visitorName: al.visitorName
            }
        });
        if (!am) {
            return E({
                error: "setVisitorName - unable to find rel for request"
            }, al, "", "");
        }
        am.success = function(ao) {
            k(y.INFO, {
                originalRequest: al,
                sentRequest: am,
                response: ao
            });
            if (ao) {
                var an = {
                    visitorName: al.visitorName
                };
                l.publish({
                    eventName: "onVisitorName",
                    data: an
                });
                ai.runSuccessCallback(al, an);
            }
            am = null;
        };
        am.error = function(an) {
            ab.visitorName = ak;
            af(al, am, an, "onVisitorName", "setVisitorName  - server error");
        };
        k(y.INFO, {
            originalRequest: al,
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    };
    O.getAgentTyping = function() {
        return ab.agentTyping;
    };
    O.getVisitorName = function() {
        return ab.visitorName;
    };
    O.getState = function() {
        return ab.state;
    };
    O.getAgentLoginName = function() {
        return ab.agentName;
    };
    O.getAgentId = function() {
        return ab.agentId;
    };
    O.getRtSessionId = function() {
        return ab.rtSessionId;
    };
    O.getConfig = function() {
        var al = {};
        for (var ak in Z) {
            if (Z.hasOwnProperty(ak)) {
                al[ak] = Z[ak];
            }
        }
        return al;
    };
    O.getSessionKey = function() {
        return ab.chatSessionKey;
    };
    O.setDebugMode = function(ak) {
        if (typeof ak === "boolean") {
            f = ak;
            lpTag.utils.log.debug = ak;
        }
    };
    O.onLoad = function(am, ak, al) {
        return h("onLoad", am, ak || "", al);
    };
    O.onInit = function(am, ak, al) {
        return h("onInit", am, ak || "", al);
    };
    O.onStart = function(am, ak, al) {
        return h("onStart", am, ak || "", al);
    };
    O.onRequestChat = function(am, ak, al) {
        return h("onRequestChat", am, ak || "", al);
    };
    O.onTransferChat = function(am, ak, al) {
        return h("onTransferChat", am, ak || "", al);
    };
    O.onAvailableSkills = function(am, ak, al) {
        return h("onAvailableSkills", am, ak || "", al);
    };
    O.onAvailability = function(am, ak, al) {
        return h("onAvailability", am, ak || "", al);
    };
    O.onEstimatedWaitTime = function(am, ak, al) {
        return h("onEstimatedWaitTime", am, ak || "", al);
    };
    O.onAgentTyping = function(am, ak, al) {
        return h("onAgentTyping", am, ak || "", al);
    };
    O.onUrlPush = function(am, ak, al) {
        return h("onUrlPush", am, ak || "", al);
    };
    O.onLine = function(am, ak, al) {
        return h("onLine", am, ak || "", al);
    };
    O.onInfo = function(am, ak, al) {
        return h("onInfo", am, ak || "", al);
    };
    O.onEvents = function(am, ak, al) {
        return h("onEvents", am, ak || "", al);
    };
    O.onState = function(am, ak, al) {
        return h("onState", am, ak || "", al);
    };
    O.onStop = function(am, ak, al) {
        return h("onStop", am, ak || "", al);
    };
    O.onResume = function(am, ak, al) {
        return h("onResume", am, ak || "", al);
    };
    O.onAccountToAccountTransfer = function(am, ak, al) {
        return h("onAccountToAccountTransfer", am, ak || "", al);
    };
    O.onAddLine = function(am, ak, al) {
        return h("onAddLine", am, ak || "", al);
    };
    O.onVisitorName = function(am, ak, al) {
        return h("onVisitorName", am, ak || "", al);
    };
    O.onSetVisitorTyping = function(am, ak, al) {
        return h("onSetVisitorTyping", am, ak || "", al);
    };
    O.onEstimatedChatWaitTime = function(am, ak, al) {
        return h("onEstimatedChatWaitTime", am, ak || "", al);
    };
    O.onAvailableSlots = function(am, ak, al) {
        return h("onAvailableSlots", am, ak || "", al);
    };
    O.onTranscript = function(am, ak, al) {
        return h("onTranscript", am, ak || "", al);
    };
    O.onPreChatSurvey = function(am, ak, al) {
        return h("onPreChatSurvey", am, ak || "", al);
    };
    O.onOfflineSurvey = function(am, ak, al) {
        return h("onOfflineSurvey", am, ak || "", al);
    };
    O.onSubmitOfflineSurvey = function(am, ak, al) {
        return h("onSubmitOfflineSurvey", am, ak || "", al);
    };
    O.onExitSurvey = function(am, ak, al) {
        return h("onExitSurvey", am, ak || "", al);
    };
    O.onLog = function(am, ak, al) {
        return h("onLog", am, ak || "", al);
    };
    O.onVisitorDisposed = function(am, ak, al) {
        return h("onVisitorDisposed", am, ak || "", al);
    };
    O.onError = function(am, ak, al) {
        return h("onError", am, ak || "", al);
    };
    O.unbind = function(al, ak, an, am) {
        return I(al, ak, an, am);
    };

    function T() {
        var ar;
        var ap;
        var ak;
        var ao = {
            inChat: 2000,
            exitSurvey: 15000
        };
        var an = ao.inChat;
        var am = this;

        function al() {
            if (ar) {
                clearTimeout(ar);
                ar = null;
            }
        }

        function at() {
            R({
                success: aq,
                error: aq
            });
            ap = new Date().valueOf();
        }

        function aq() {
            if (ak) {
                al();
                var au = new Date().valueOf() - ap;
                au = an - au;
                if (au > 0) {
                    ar = setTimeout(at, au);
                } else {
                    at();
                }
            }
        }
        am.changeKeepAliveState = function() {
            al();
            ak = !b && (ab.chatInProgress || ab.exitSurveyOn);
            if (ak) {
                if (ab.chatInProgress) {
                    an = ao.inChat;
                } else {
                    an = ao.exitSurvey;
                }
                at();
            }
        };
        am.storeChatLocationURI = function(aw, ay) {
            var av = e(u.chat);
            if (ag.sessionUID) {
                av = e(ag.sessionUID);
            }
            var au = {
                chatRel: aw,
                location: window.location.href
            };
            if (ay) {
                au.overRides = {};
                for (var ax in ay) {
                    if (ay.hasOwnProperty(ax)) {
                        au.overRides[ax] = ay[ax];
                    }
                }
            }
            o.setSessionData(av, au);
        };
        am.sessionEnded = function() {
            o.removeSessionData(e(u.sessionVars));
            o.removeSessionData(e(u.chat));
            o.removeSessionData(e(u.resumeMode));
            if (ag.sessionUID) {
                o.removeSessionData(e(ag.sessionUID));
            }
        };
    }

    function w(ak) {
        if (lpTag.utils.Events && lpTag.RelManager && lpTag.SessionDataManager) {
            l = lpTag.utils.Events({
                cloneEventData: true,
                eventBufferLimit: 50
            });
            S = new T();
            Y = new lpTag.RelManager(ak && ak.transportOrder);
            ag = ag || {};
            ag.appName = r;
            o = new window.lpTag.utils.SessionDataAsyncWrapper(ag);
            K();
        } else {
            if (N < 20) {
                setTimeout(w, 500);
            }
        }
        N++;
    }

    function z() {
        return !!(i.lpNumber && i.appKey && i.domain);
    }

    function D(ak, al) {
        if (ak) {
            if (ak.clearDomain) {
                i.domain = ai.trim(ak.domain);
            } else {
                i.domain = ai.trim(ak.domain) || ai.trim(i.domain) || "";
            }
            i.lpNumber = ai.trim(ak.lpNumber) || ai.trim(i.lpNumber) || "";
            i.appKey = ai.trim(ak.appKey) || ai.trim(i.appKey) || "";
            if (ag.sessionUID) {
                i.sessionUID = ag.sessionUID;
            }
            if (i.lpNumber && i.appKey && i.domain) {
                Y.setData(i);
                if ((typeof al !== "boolean" || al) && !o.usingSecureStorage) {
                    o.setSessionData(e(u.sessionVars), i);
                }
            }
            W = ak && ak.environment && L[ak.environment] ? ak.environment : W;
            if (i.domain && i.lpNumber) {
                ad();
            }
        }
    }

    function K() {
        O.onInit(function(an) {
            if (!an.error) {
                ab.initialised = true;
            }
        });
        O.onStart(function(an) {
            if (!an.error) {
                ab.chatInProgress = true;
            }
        });
        O.onState(function(an) {
            if (!an.error) {
                ab.state = an.state;
                switch (ab.state) {
                    case O.chatStates.CHATTING:
                    case O.chatStates.WAITING:
                    case O.chatStates.RESUMING:
                        if (ab.state !== O.chatStates.RESUMING && !o.usingSecureStorage) {
                            o.setSessionData(e(u.resumeMode), true, null, null, null, false);
                        }
                        ab.chatInProgress = true;
                        S.changeKeepAliveState();
                        break;
                    case O.chatStates.INITIALISED:
                        ab.chatInProgress = m ? true : false;
                        break;
                    case O.chatStates.ENDED:
                    case O.chatStates.UNINITIALISED:
                        ab.chatInProgress = false;
                        S.changeKeepAliveState();
                        break;
                    case O.chatStates.NOTFOUND:
                        ab.chatInProgress = false;
                        ab.exitSurveyOn = false;
                        S.changeKeepAliveState();
                        break;
                    default:
                        break;
                }
            }
        });
        O.onVisitorName(function(an) {
            if (!an.error) {
                ab.visitorName = an.visitorName;
            }
        });
        O.onSetVisitorTyping(function(an) {
            if (!an.error) {
                ab.typing = an.typing;
            }
        });
        Z = am(ag);
        D(Z, false);
        al(Z);
        if (typeof Z.debug === "boolean") {
            O.setDebugMode(Z.debug);
        }
        ak();

        function al(ap) {
            for (var ao in ap) {
                if (ap.hasOwnProperty(ao)) {
                    if (String(ao).indexOf("on") == 0) {
                        if (O.hasOwnProperty(ao)) {
                            ap[ao] = ap[ao].constructor === Array ? ap[ao] : [ap[ao]];
                            for (var an = 0; an < ap[ao].length; an++) {
                                if (typeof ap[ao][an] === "function") {
                                    O[ao](ap[ao][an]);
                                } else {
                                    if (typeof ap[ao][an] === "object" && ap[ao][an].callback) {
                                        if (typeof ap[ao][an].callback === "function") {
                                            O[ao](ap[ao][an].callback, ap[ao][an].appName || "", ap[ao][an].context || null);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        function ak() {
            if (document.body) {
                U();
            } else {
                setTimeout(ak, 5);
            }
        }

        function am(aq) {
            if (aq) {
                var ar = {};
                for (var ao in aq) {
                    if (aq.hasOwnProperty(ao)) {
                        var ap = typeof ar[ao] !== "undefined";
                        var an = ao.indexOf("on") == 0;
                        if (!ap) {
                            ar[ao] = aq[ao];
                        } else {
                            if (ar[ao] !== aq[ao] && !an) {
                                ar[ao] = aq[ao];
                            } else {
                                ar[ao] = ar[ao].constructor === Array ? ar[ao] : [ar[ao]];
                                ar[ao].push(aq[ao]);
                            }
                        }
                    }
                }
            }
            return ar;
        }
    }

    function U() {
        if (!ag.doNotResume || W === L.PRODUCTION) {
            if (ag.sessionUID) {
                o.getSessionData(e(ag.sessionUID), Q, Q, null);
            } else {
                o.getSessionData(e(u.resumeMode), a, a, null);
            }
        } else {
            if (z()) {
                aa();
                l.publish({
                    eventName: "onLoad",
                    data: {
                        API: "Chat API SDK Loaded",
                        version: ac,
                        state: m ? O.chatStates.RESUMING : O.chatStates.UNINITIALISED
                    }
                });
                ab.chatInProgress = false;
            }
        }
    }

    function h(al, ao, ak, am) {
        if (!l) {
            return false;
        }
        var an = {
            eventName: al,
            appName: ak || "",
            aSync: false,
            func: ao,
            context: am || null
        };
        return l.register(an);
    }

    function I(al, ak, ao, am) {
        if (!l) {
            return false;
        }
        if (typeof al === "function") {
            ao = al;
            al = "";
        } else {
            if (typeof al === "object") {
                am = al;
                al = "";
            }
        }
        var an = {
            eventName: al,
            appName: ak || "",
            func: ao,
            context: am || null
        };
        return l.unbind(an);
    }

    function e(am) {
        if (!ag.lpNumber) {
            return "";
        }
        if (typeof am === "object") {
            var al = [];
            for (var ak in am) {
                if (am.hasOwnProperty(ak)) {
                    al.push(am[ak] + ag.lpNumber);
                }
            }
            return al;
        } else {
            return am + ag.lpNumber;
        }
    }

    function E(am, al, an, ak) {
        k(y.ERROR, {
            error: am,
            originalRequest: al,
            sentRequest: an,
            response: ak
        });
        al = null;
        an = null;
        ak = null;
        return am;
    }

    function k(al, am) {
        var ak = {
            eventName: "onLog"
        };
        if (al && typeof al === "string") {
            ak.appName = al;
        } else {
            if (typeof al === "object") {
                am = al;
            }
        }
        ak.data = am;
        if (ak.appName && ak.appName !== y.ERROR && !f) {
            ak = null;
            return;
        }
        l.publish(ak);
        ak = null;
    }

    function ad() {
        H.configureTransports({
            rest2jsonp: {
                domain: i.domain,
                site: i.lpNumber
            },
            postmessage: {
                frames: [{
                    url: "https://" + i.domain + ah(),
                    delayLoad: 0
                }]
            }
        });
    }

    function a(ak) {
        if (ak === true || ak === "true") {
            o.getSessionData(e(u.sessionVars), M, M, null);
        } else {
            X();
        }
    }

    function X() {
        ab.chatInProgress = false;
        m = false;
        l.publish({
            eventName: "onLoad",
            data: {
                API: "Chat API SDK Loaded",
                version: ac,
                state: m ? O.chatStates.RESUMING : O.chatStates.UNINITIALISED
            }
        });
        aa();
    }

    function M(ak) {
        if (ak && typeof ak === "object" && !ak.error) {
            if (g(ag, ak)) {
                D(ak);
                m = true;
                o.getSessionData(e(u.chat), Q, Q, null);
            }
        } else {
            X();
        }
    }

    function Q(ak) {
        if (!ak || ak && !ak.chatRel) {
            X();
        } else {
            ab.chatInProgress = true;
            l.publish({
                eventName: "onLoad",
                data: {
                    API: "Chat API SDK Loaded",
                    version: ac,
                    state: m ? O.chatStates.RESUMING : O.chatStates.UNINITIALISED
                }
            });
            if (ak.overRides) {
                D(ak.overRides);
            }
            aa({
                success: function() {
                    Y.addRels({
                        link: [{
                            rel: "location",
                            href: ak.chatRel
                        }]
                    }, {
                        type: "chat"
                    });
                    F(J(O.chatStates.RESUMING, new Date()));
                    aj(null, ak.overRides);
                },
                error: function() {
                    S.sessionEnded();
                }
            });
        }
    }

    function g(ao, an) {
        var ap = ["lpNumber", "appKey", "sessionUID"];
        var ak = true;
        for (var am = 0; am < ap.length; am++) {
            var al = ap[am];
            if (ao[al] != an[al]) {
                if (al === "sessionUID") {
                    if (ao[al] && an[al]) {
                        ak = false;
                    }
                } else {
                    ak = false;
                }
            }
            if (!ak) {
                break;
            }
        }
        return ak;
    }

    function af(ao, aq, ap, al, am, ak) {
        k(y.ERROR, {
            originalRequest: ao,
            sentRequest: aq,
            response: ap
        });
        ap = ai.getErrorData(ap, am, ao);
        al = al.constructor === Array ? al : [al];
        for (var an = 0; an < al.length; an++) {
            l.publish({
                eventName: al[an],
                appName: ak || "",
                data: ap
            });
        }
        ai.runErrorCallback(ao, ap);
        aq = null;
        return ap;
    }

    function j(al) {
        var ak = {
            site: al.lpNumber
        };
        ak.success = function(am) {
            al.domain = am.domain;
            aa(al);
        };
        ak.error = function(am) {
            E({
                error: "unable to resolve site domain"
            }, al, "", am);
            af({}, {}, {}, "onInit", "unable to initiate session");
            ai.runErrorCallback(al);
        };
        O.getSiteDomain(ak);
    }

    function aa(ak) {
        ak = ak || {};
        D(ak);
        ak.lpNumber = i.lpNumber;
        ak.appKey = i.appKey;
        ak.domain = i.domain;
        if (!ak.lpNumber) {
            return E({
                error: "missing site configuration data, cannot _init"
            }, ak, "", "");
        }
        if (!ak.domain) {
            j(ak);
            return false;
        }
        if (!z()) {
            return false;
        }
        Y.setData(ak);
        var al = Y.buildRequestObj({
            rel: "",
            data: {
                lpNumber: i.lpNumber,
                appKey: i.appKey,
                domain: i.domain
            }
        });
        al.success = function(am) {
            k(y.INFO, {
                originalRequest: ak,
                sentRequest: al,
                response: am
            });
            if (am) {
                Y.addRels(am, {
                    type: "chat"
                });
                v("self", {
                    type: "chat",
                    ignoreParameters: true
                }, [{
                    rel: "OTK",
                    href: "chat/resumeWithOTK"
                }]);
                l.publish({
                    eventName: "onInit",
                    data: {
                        account: ak.lpNumber,
                        domain: ak.domain,
                        init: true
                    }
                });
                F(J(O.chatStates.INITIALISED));
            }
            if (ak.requestChat) {
                O.requestChat(ak);
            } else {
                ai.runSuccessCallback(ak, {});
            }
            al = null;
        };
        al.error = function(an) {
            var am = ["onInit"];
            if (ak.requestChat) {
                am.push("onRequestChat");
            }
            af(ak, al, an, am, "unable to initiate session");
            Y.clearData();
        };
        k(y.INFO, {
            originalRequest: ak,
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return H.issueCall(al);
    }

    function C(al) {
        var am = {};
        var ap;
        var al = al || {};
        if (al.agent) {
            am.agent = al.agent;
            ai.deleteProps(al, ["skill", "serviceQueue", "maxWaitTime"]);
        } else {
            if (al.skill) {
                am.skill = al.skill;
                ai.deleteProps(al, ["serviceQueue"]);
            } else {
                if (al.serviceQueue && !isNaN(al.maxWaitTime)) {
                    am.serviceQueue = al.serviceQueue;
                }
            }
        }
        if (!isNaN(al.maxWaitTime) && al.maxWaitTime >= 0 && al.maxWaitTime < 86400) {
            am.maxWaitTime = al.maxWaitTime;
        }
        if (typeof al.buttonName === "string") {
            am.chatReferrer = "(button dynamic-button:" + al.buttonName + "()) " + document.location.href;
        } else {
            if (al.invitation === true) {
                am.chatReferrer = "(engage) " + document.location.href;
            } else {
                if (al.chatReferrer || document.referrer) {
                    am.chatReferrer = al.chatReferrer || document.referrer;
                }
            }
        }
        if (navigator && navigator.userAgent) {
            am.userAgent = navigator.userAgent;
        }
        if (typeof al.ssoKey === "string") {
            am.ssoKey = al.ssoKey;
        }
        if (typeof al.survey === "object") {
            am.survey = al.survey;
        }
        if (al.a2aSourceSiteId) {
            am.a2aSourceSiteId = al.a2aSourceSiteId;
        }
        if (al.a2aSourceSessionId) {
            am.a2aSourceSessionId = al.a2aSourceSessionId;
        }
        if (al.a2aEventId) {
            am.a2aEventId = al.a2aEventId;
        }
        if (typeof al.LETagVisitorId === "string") {
            am.LETagVisitorId = al.LETagVisitorId;
        }
        if (typeof al.LETagSessionId === "string") {
            am.LETagSessionId = al.LETagSessionId;
        }
        if (typeof al.LETagContextId === "string") {
            am.LETagContextId = al.LETagContextId;
        }
        if (al.runWithRules === true) {
            am.runWithRules = true;
        }
        var ao = al.visitorId || o.readCookie(Z.lpNumber + "-VID");
        if (ao) {
            am.visitorId = ao;
        }
        var an = al.visitorSessionId || o.readCookie(Z.lpNumber + "-SKEY") || window.lpMTagConfig && window.lpMTagConfig.LPSID_VAR;
        if (an) {
            am.visitorSessionId = an;
        }
        if (typeof al.customVariables === "object") {
            if (al.customVariables.customVariable && al.customVariables.customVariable.constructor === Array) {
                am.customVariables = al.customVariables;
            } else {
                var ak = d(al.customVariables);
                if (ak) {
                    am.customVariables = ak;
                }
            }
        }
        if (al.preChatLines && al.preChatLines.constructor === Array) {
            am.preChatLines = {
                line: al.preChatLines
            };
        }
        if (typeof al.ssoServiceExtraParams === "string") {
            am.ssoServiceExtraParams = al.ssoServiceExtraParams;
        }
        if (typeof al.ssoServiceKey === "string") {
            am.ssoServiceKey = al.ssoServiceKey;
        }
        if (typeof al.engagementId !== "undefined") {
            am.engagementId = al.engagementId;
        }
        if (typeof al.campaignId !== "undefined") {
            am.campaignId = al.campaignId;
        }
        if (typeof al.language === "string") {
            am.language = al.language;
        }
        ap = O.getRtSessionId();
        if (ap) {
            am.rtSessionId = ap;
        }
        return ai.hasProperties(am) ? {
            request: am
        } : {};
    }

    function d(ak) {
        var am = [];
        for (var al in ak) {
            if (ak.hasOwnProperty(al)) {
                am.push({
                    name: al,
                    value: ak[al]
                });
            }
        }
        if (am.length > 0) {
            return {
                customVariable: am
            };
        } else {
            return null;
        }
    }

    function v(an, ap, ao) {
        var ak = Y.getURI(an, ap);
        var al = {
            link: []
        };
        for (var am = 0; am < ao.length; am++) {
            al.link.push({
                href: ak + "/" + ao[am].href,
                rel: "" + ao[am].rel
            });
        }
        Y.addRels(al, ap);
    }

    function x(am, ak) {
        if (ab.chatInProgress || s) {
            return false;
        }
        var al = {};
        var ao = am && am.siteContainer || window.lpMTagConfig && window.lpMTagConfig.FPC_CONT || o.readCookie("HumanClickSiteContainerID_" + Z.lpNumber);
        if (ao) {
            al.siteContainer = ao;
        }
        var an = Y.buildRequestObj({
            rel: "chat-request",
            type: "chat",
            needAuth: true,
            requestType: "POST",
            data: C(am),
            queryParams: al
        });
        if (!an) {
            return E({
                error: "requestChat - unable to find rel for request"
            }, "", "", "");
        }
        G(am.sessionUID);
        s = true;
        an.success = function(ap) {
            k(y.INFO, {
                originalRequest: am || "",
                sentRequest: an,
                response: ap
            });
            if (ap && ap.headers && ap.headers.Location) {
                Y.addRels({
                    link: [{
                        "@rel": "location",
                        "@href": ap.headers.Location
                    }]
                }, {
                    type: "chat"
                });
                S.storeChatLocationURI(ap.headers.Location, ak);
                if (ak) {
                    ab.initialised = false;
                }
                aj(am);
            }
            an = null;
        };
        an.error = function(ap) {
            af(am, an, ap, ["onRequestChat"], "requestChat  - server error");
            s = false;
        };
        k(y.INFO, {
            originalRequest: am || "",
            sentRequest: an,
            response: "SENDING REQUEST"
        });
        return H.issueCall(an);
    }

    function G(ak) {
        if (ak) {
            ag = ag || {};
            if (ag.sessionUID) {
                O.clearSessionData(ag.sessionUID);
            }
            ag.sessionUID = ak;
        }
    }

    function aj(al, ak) {
        var am = Y.buildRequestObj({
            rel: "location",
            type: "chat",
            needAuth: true,
            requestType: "GET"
        });
        if (!am) {
            return E({
                error: "_getSessionData - unable to find rel for request"
            }, "", "", "");
        }
        s = true;
        am.success = function(an) {
            k(y.INFO, {
                originalRequest: al || "",
                sentRequest: am,
                response: an
            });
            A(am, al, an);
            if (ak) {
                ab.initialised = false;
            }
            s = false;
            am = null;
        };
        am.error = function(an) {
            if (ab.chatState === O.chatStates.RESUMING) {
                F(J(O.chatStates.NOTFOUND));
                S.sessionEnded();
            }
            af(al, am, an, "onRequestChat", "_getSessionData  - server error");
            s = false;
        };
        k(y.INFO, {
            originalRequest: "",
            sentRequest: am,
            response: "SENDING REQUEST"
        });
        return H.issueCall(am);
    }

    function A(ao, am, an) {
        if (an) {
            Y.addRels(an.body.chat, {
                type: "chat"
            });
            Y.addRels(an.body.chat.info, {
                type: "visitor"
            });
            var ak = ai.getResponseData(an, "chat", false);
            l.publish({
                eventName: "onRequestChat",
                data: ak
            });
            p(ak.info);
            var al = V(ak.events);
            if (al) {
                c(al);
            }
            ai.runSuccessCallback(am, ak);
            m = false;
        }
        ao = null;
    }

    function n(am) {
        var al = {};
        for (var ak = 0; ak < am.length; ak++) {
            al[am[ak].skill] = am[ak].isAvailable;
        }
        return al;
    }

    function R(ak) {
        var al = Y.buildRequestObj({
            rel: "next",
            type: "chat",
            needAuth: true,
            requestType: "GET"
        });
        if (!al) {
            return E({
                error: "_getEvents - unable to find rel for request"
            }, "", "", "");
        }
        al.timeout = 10000;
        al.retries = 0;
        al.success = function(an) {
            ae = 0;
            var ao;
            var am;
            k(y.INFO, {
                originalRequest: "",
                sentRequest: al,
                response: an
            });
            if (an) {
                Y.addRels(an.body.chat, {
                    type: "chat"
                });
                Y.addRels(an.body.chat.info, {
                    type: "visitor"
                });
                ao = ai.getResponseData(an, "chat");
                am = V(ao.events);
                if (am) {
                    c(am);
                }
                if (ao.info) {
                    p(ao.info);
                }
            }
            ai.runSuccessCallback(ak, am);
            al = null;
        };
        al.error = function(am) {
            ae = ae + 1;
            am = af(ak, al, am, ["onLine", "onAgentTyping", "onInfo", "onEvents"], "_getEvents - server error");
            if (ae > P || am && am.error && am.error.internalCode === 12) {
                F(J(O.chatStates.NOTFOUND));
            }
        };
        k(y.INFO, {
            originalRequest: "",
            sentRequest: al,
            response: "SENDING REQUEST"
        });
        return H.issueCall(al);
    }

    function c(ak) {
        if (ak.line) {
            l.publish({
                eventName: "onLine",
                data: {
                    lines: ak.line
                }
            });
        }
        if (ak["a2a-transfer"]) {
            var al = t(ak["a2a-transfer"]);
            l.publish({
                eventName: "onAccountToAccountTransfer",
                data: al
            });
        }
        if (ak.collaboration) {
            l.publish({
                eventName: "onCollaboration",
                data: {
                    collaboration: ak.collaboration
                }
            });
        }
        if (ak.state) {
            ak.state = ak.state.constructor === Array ? ak.state.pop() : ak.state;
            F(J(ak.state.state, ak.state.time));
        }
        l.publish({
            eventName: "onEvents",
            data: ak
        });
    }

    function t(ak) {
        if (ak.length > 1) {
            return ak[ak.length - 1];
        } else {
            return ak[0];
        }
    }

    function J(ak, al) {
        return {
            state: ak,
            time: al || new Date().toTimeString()
        };
    }

    function p(am) {
        if (am.agentTyping === "typing" != ab.agentTyping) {
            ab.agentTyping = am.agentTyping === "typing";
            l.publish({
                eventName: "onAgentTyping",
                data: {
                    agentTyping: ab.agentTyping
                }
            });
            am.agentTyping = null;
            delete am.agentTyping;
        }
        var al = false;
        for (var ak in am) {
            if (am.hasOwnProperty(ak) && ab.hasOwnProperty(ak) && am[ak] != ab[ak]) {
                if (ak !== "lastUpdate" && ak !== "agentTyping" && ak !== "visitorTyping" && ak !== "state") {
                    ab[ak] = am[ak];
                    al = true;
                }
            }
        }
        if (ab.state == O.chatStates.RESUMEPAUSEDCHAT && am.state !== ab.state) {
            F(J(am.state));
        }
        ab.lastUpdate = am.lastUpdate;
        if (al) {
            l.publish({
                eventName: "onInfo",
                data: ab,
                cloneEventData: true
            });
        }
    }

    function F(ak) {
        if (ab.chatState === ak.state) {
            return;
        } else {
            ab.chatState = ak.state;
        }
        switch (ak.state) {
            case O.chatStates.ENDED:
                l.publish({
                    eventName: "onStop",
                    data: ak
                });
                break;
            case O.chatStates.CHATTING:
                l.publish({
                    eventName: "onStart",
                    data: ak
                });
                break;
        }
        l.publish({
            eventName: "onState",
            data: ak
        });
    }

    function V(an) {
        if (!an.event) {
            return null;
        }
        an = an.event;
        an = an.constructor === Array ? an : [an];
        var ap = {};
        var ao = false;
        for (var ak = 0; ak < an.length; ak++) {
            var al = an[ak].type || an[ak]["@type"];
            if (an[ak]["channelID"]) {
                var am = an[ak]["channelID"];
                ap[al] = ap[al] || {};
                ap[al][am] = ap[al][am] || [];
                ap[al][am].push(an[ak]);
            } else {
                ap[al] = ap[al] || [];
                ap[al].push(an[ak]);
            }
            ao = true;
        }
        return !ao ? null : ap;
    }
    w(ag);
};

lpTag.taglets.ChatOverRestAPI.prototype.chatStates = {
    CHATTING: "chatting",
    WAITING: "waiting",
    ENDED: "ended",
    RESUMING: "resume",
    UNINITIALISED: "uninitialised",
    INITIALISED: "initialised",
    NOTFOUND: "notfound",
    PAUSECHAT: "paused",
    RESUMEPAUSEDCHAT: "resumepaused"
};

lpTag.taglets.ChatOverRestAPI.prototype.connectionStates = {
    ACTIVE: "active",
    INACTIVE: "inactive"
};
