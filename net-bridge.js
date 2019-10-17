/**
 * Name: NetBridge
 * Description: NetBridge is used for making asynchronous network (ajax) calls on web applications.
 * Author: Wisdom Emenike
 * License: MIT
 * Version: 1.3
 * GitHub: https://github.com/iamwizzdom/net-bridge
 */

NetBridge = (function() {

    let NetBridge = function () {

        let permitNetwork = true;

        /**
         * return boolean
         */
        let getPermitNetwork = () => permitNetwork;

        /**
         *
         * @param status
         */
        let setPermitNetwork = (status) => {
            if (isBoolean(status)) permitNetwork = status;
        };

        /**
         *
         * @param variable
         */
        let isUndefined = (variable) => typeof variable === "undefined";

        /**
         *
         * @param variable
         */
        let isObject = (variable) => typeof variable === "object";

        /**
         *
         * @param variable
         */
        let isFunction = (variable) => typeof variable === "function";

        /**
         *
         * @param variable
         */
        let isBoolean = (variable) => typeof variable === "boolean";

        /**
         *
         * @param variable
         */
        let isString = (variable) => typeof variable === "string";

        /**
         *
         * @param variable
         */
        let isNumeric = (variable) => isNaN(variable) === false;

        /**
         *
         * @param variable
         */
        let isEmpty = (variable) => variable === false || variable === null ||
            variable.toString() === "0" || variable.toString() === "" || variable.toString() === " ";

        /**
         *
         * @param variable
         */
        let getType = (variable) => typeof variable;

        /**
         *
         * @param object
         * @returns {string}
         */
        let serialize = (object) => {
            let serial = "", x;
            for (x in object) {
                if (object.hasOwnProperty(x))
                    serial += (!isEmpty(serial) ? "&" : "") + x + "=" + object[x];
            }
            return serial;
        };

        /**
         *
         * @param request
         * @returns {boolean}
         */
        let isInRequestQueue = (request) => {
            let requestQueue = this.getRequestQueue(),
                size = requestQueue.length;
            if (size <= 0) return false;
            for (let x = 0; x < size; x++) {
                let queue = requestQueue[x], count = 0,
                    keys = Object.keys(queue).length;
                for (let n in queue) {
                    if (queue.hasOwnProperty(n) &&
                        request.hasOwnProperty(n))
                        if (queue[n] === request[n]) count++;
                }
                if (count === keys) return true;
            }
            return false;
        };

        let requestQueue = {queue: []};

        /**
         * return json
         */
        this.getRequestQueue = () => requestQueue.queue;

        /**
         *
         * @param queue
         */
        this.addToRequestQueue = (queue) => {

            let size = this.getRequestQueue().length, network = getPermitNetwork();
            if (!isObject(queue)) throw "NetBridge expects an object from its parameter, but got " + getType(queue);
            if (isUndefined(queue.url)) throw "NetBridge expects a 'url' attribute from the passed object";
            if (!isString(queue.url)) throw "NetBridge expects the 'url' attribute to be a string, but got " + getType(queue.url);
            if (isUndefined(queue.method)) throw "NetBridge expects a 'method' attribute from the passed object";
            if (!isString(queue.method)) throw "NetBridge expects the 'method' attribute to be a string, but got " + getType(queue.method);
            if (isInRequestQueue(queue)) return;
            if (!network && isFunction(queue.queue)) queue.queue();
            push(queue);
            if (size <= 0) sendRequest();

        };

        let shift = () => requestQueue.queue.shift();
        let push = (queue) => requestQueue.queue.push(queue);

        let sendRequest = () => {

            let queue = this.getRequestQueue(),

                __tm = null,

                send = (request) => {

                    if (!getPermitNetwork()) {
                        if (__tm !== null) clearTimeout(__tm);
                        __tm = setTimeout(() => {
                            send(request);
                        }, 500);
                        return;
                    }

                    setPermitNetwork(false);

                    let xhttp = new XMLHttpRequest();

                    // noinspection Annotator
                    if (isFunction(request['beforeSend'])) {
                        xhttp.onloadstart = () => {
                            // noinspection Annotator
                            request['beforeSend'](xhttp);
                        };
                    }

                    xhttp.onreadystatechange = function () {

                        let state = false, status = false;

                        if (this.readyState === 0) {
                            console.error("NetBridge error: request not initialized (URL:: " + request.url + ")");
                            if (isFunction(request.error)) request.error(this.responseText, xhttp, this.status, this.statusText);
                        }

                        if (isFunction(request['responseHeaders']) &&
                            this.readyState === this.HEADERS_RECEIVED) {

                            let headers = xhttp.getAllResponseHeaders();

                            let headerArray = headers.trim().split(/[\r\n]+/);

                            let headerMap = {};
                            headerArray.forEach(function (line) {
                                let parts = line.split(': ');
                                let header = parts.shift();
                                headerMap[header] = parts.join(': ');
                            });

                            request['responseHeaders'](headerMap);
                        }

                        if (this.readyState === 4) state = true;

                        if (state === true && this.status !== 200) {
                            console.error("NetBridge error: " + this.statusText + " - " + this.status + " (URL:: " + request.url + ")");
                            if (isFunction(request.error)) request.error(this.responseText, xhttp, this.status, this.statusText);
                        } else status = true;

                        if (state === true && status === true) {
                            if (isFunction(request.success)) request.success(this.responseText, this.status, xhttp);
                        }

                        if (isFunction(request.complete)) request.complete(xhttp, this.status);

                    };

                    xhttp.onloadend = function () {
                        setPermitNetwork(true);
                        if (isBoolean(request['persist']) && request['persist'] === true) push(request);
                        let _tm = setTimeout(() => {
                            if (queue.length > 0) send(shift());
                            clearTimeout(_tm);
                        }, 500);
                    };

                    if (isNumeric(request.timeout)) xhttp.timeout = parseInt(request.timeout);

                    if (isFunction(request.ontimeout)) xhttp.ontimeout = request.ontimeout;

                    if (isFunction(request.error)) xhttp.onerror = request.error;

                    if (isFunction(request.abort)) xhttp.onabort = request.abort;

                    if (isFunction(request.cancel)) xhttp.oncancel = request.cancel;

                    xhttp.msCaching = (isBoolean(request.cache) ? request.cache : false);

                    xhttp.open(
                        request.method,
                        (request.method.toUpperCase() === 'GET' && !isUndefined(request.data)) ?
                            encodeURI((request.url + "?" + serialize(request.data))) : request.url,
                        (isBoolean(request.async) ? request.async : true),
                        (isString(request['username']) ? request['username'] : ""),
                        (isString(request.password) ? request.password : ""),
                    );

                    if (isFunction(request.xhr)) request.xhr(xhttp);

                    if (isBoolean(request.contentType) && request.contentType === false) {
                        xhttp.withCredentials = true;
                    } else {
                        xhttp.setRequestHeader("Content-Type", isString(request.contentType) ?
                            request.contentType : "application/x-www-form-urlencoded; charset=UTF-8");
                    }

                    xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");

                    if (isFunction(request.headers)) request.headers = request.headers();

                    if (isObject(request.headers)) {
                        for (let x in request.headers) {
                            if (request.headers.hasOwnProperty(x))
                                xhttp.setRequestHeader(x, request.headers[x]);
                        }
                    }

                    if (isFunction(request.data)) request.data = request.data();

                    xhttp.send((isBoolean(request.processData) &&
                    request.processData === false ? request.data : serialize(request.data)));

                };

            if (queue.length > 0) send(shift());
        }
    };

    let mInstance = null;

    /**
     * return NetBridge
     */
    NetBridge.getInstance = () => (mInstance instanceof NetBridge ?
        mInstance : (mInstance = new NetBridge()));

    return NetBridge;

}());