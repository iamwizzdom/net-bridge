Vojax = (function() {

    Vojax = function() {

        let permitNetwork = true;
        let getPermitNetwork = () => permitNetwork;
        let setPermitNetwork = (status) => {
            if (is_boolean(status)) permitNetwork = status;
        };

        let is_undefined = (variable) => typeof variable === "undefined";
        let is_object = (variable) => typeof variable === "object";
        let is_function = (variable) => typeof variable === "function";
        let is_boolean = (variable) => typeof variable === "boolean";
        let is_string = (variable) => typeof variable === "string";
        let is_numeric = (variable) => isNaN(variable) === false;
        let is_empty = (variable) => variable === false || variable === null ||
            variable.toString() === "0" || variable.toString() === "" || variable.toString() === " ";
        let get_type = (variable) => typeof variable;
        let serialize = (object) => {
            let serial = "", x;
            for (x in object) {
                if (object.hasOwnProperty(x))
                    serial += (!is_empty(serial) ? "&" : "") + x + "=" + object[x];
            }
            return serial;
        };
        let in_request_queue = (request) => {
            let requestQueue = this.getRequestQueue();
            for (let x = 0; x < requestQueue.length; x++) {
                let queue = requestQueue[x];
                for (let n in queue) {
                    if (queue.hasOwnProperty(n) &&
                        request.hasOwnProperty(n))
                        if (queue[n] !== request[n]) return false;
                }
            }
            return true;
        };
        
        let requestQueue = { queue: [] };

        this.getRequestQueue = () => requestQueue.queue;

        this.addToRequestQueue = (queue) => {

            let size = this.getRequestQueue().length, network = getPermitNetwork();
            if (!is_object(queue)) throw "vojax expects an object from its parameter, but got " + get_type(queue);
            if (is_undefined(queue.url)) throw "vojax expects a 'url' attribute from the passed object";
            if (!is_string(queue.url)) throw "vojax expects the 'url' attribute to be a string, but got " + get_type(queue.url);
            if (is_undefined(queue.method)) throw "vojax expects a 'method' attribute from the passed object";
            if (!is_string(queue.method)) throw "vojax expects the 'method' attribute to be a string, but got " + get_type(queue.method);
            if (in_request_queue(queue)) return;
            if (!network && is_function(queue.queue)) queue.queue();
            push(queue); if (size <= 0) sendRequest();

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
                        }, 100);
                        return;
                    }

                    setPermitNetwork(false);

                    let xhttp = new XMLHttpRequest();

                    // noinspection Annotator
                    if (is_function(request['beforeSend'])) {
                        xhttp.onloadstart = () => {
                            // noinspection Annotator
                            request['beforeSend'](xhttp);
                        };
                    }

                    xhttp.onreadystatechange = function() {

                        let state = false,
                            status = false;

                        if (this.readyState === 0) {
                            console.error("vojax error: request not initialized (URL:: " + request.url + ")");
                            if (is_function(request.error)) request.error(xhttp, this.status, this.statusText);
                        }

                        if (this.readyState === 4) state = true;

                        if (this.status === 403) {
                            console.error("vojax error: request forbidden (URL:: " + request.url + ")");
                            if (is_function(request.error)) request.error(xhttp, this.status, this.statusText);
                        }

                        if (this.status === 404) {
                            console.error("vojax error: not found (URL:: " + request.url + ")");
                            if (is_function(request.error)) request.error(xhttp, this.status, this.statusText);
                        }

                        if (this.status === 200) status = true;

                        if (state === true && status === true) {
                            if (is_function(request.success)) request.success(this.responseText, this.status, xhttp);
                        }

                        if (is_function(request.complete)) request.complete(xhttp, this.status);

                    };

                    xhttp.onloadend = () => {
                        setPermitNetwork(true);
                        // noinspection Annotator
                        if (is_boolean(request['persist']) && request['persist'] === true) push(request);
                        let _tm = setTimeout(() => {
                            let queue = this.getRequestQueue();
                            if (queue.length > 0) send(shift());
                            clearTimeout(_tm);
                        }, 100);
                    };

                    xhttp.msCaching = (is_boolean(request.cache) ? request.cache : false);

                    // noinspection Annotator
                    xhttp.open(
                        request.method,
                        request.url,
                        (is_boolean(request.async) ? request.async : true),
                        (is_string(request['username']) ? request['username'] : ""),
                        (is_string(request.password) ? request.password : ""),
                    );

                    if (is_function(request.xhr)) request.xhr();

                    xhttp.setRequestHeader("Content-type", (
                        (is_boolean(request.contentType) && request.contentType !== false ?
                            "application/x-www-form-urlencoded" : (
                                is_string(request.contentType) ?
                                request.contentType :
                                "application/x-www-form-urlencoded"
                            )
                        )
                    ));

                    if (is_object(request.headers)) {
                        for (let x in request.headers) {
                            if (request.headers.hasOwnProperty(x))
                                xhttp.setRequestHeader(x, request.headers[x]);
                        }
                    }

                    if (is_numeric(request.timeout)) xhttp.timeout = parseInt(request.timeout);

                    if (is_function(request.ontimeout)) xhttp.ontimeout = request.ontimeout;

                    xhttp.send((is_boolean(request.processData) && request.processData === false ? request.data : serialize(request.data)));

                };

            if (queue.length > 0) send(shift());
        }
    };

    let mInstance = null;

    Vojax.getInstance = () => (mInstance instanceof Vojax ?
        mInstance : (mInstance = new Vojax()));

    return Vojax;

}());