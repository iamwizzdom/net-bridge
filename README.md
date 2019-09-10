# NetBridge - NetBridge is used for making synchronous network (ajax) calls on web applications.

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

- [Usage](#usage)
- [Attributes](#attributes)

<h2 id="usage"> Usage </h2>

```
let instance = NetBridge.getInstance();

instance.addToRequestQueue({
    url: "https://swapi.co/api/people",
    method: "post",
    data: {
        userID: 2
    },
    queue: function () {
        console.log('comment', 'I am a post request and am waiting');
    },
    beforeSend: function () {
        console.log('comment', 'I am a post request and I ran beforeSend');
    },
    success: (data, status, xhr) => {
        console.log(data, status, xhr);
    }
});

instance.addToRequestQueue({
    url: "https://swapi.co/api/people/2",
    method: "get",
    queue: function () {
        console.log('comment', 'I am a get request and am waiting');
    },
    beforeSend: function () {
        console.log('comment', 'I am a get request and I ran beforeSend');
    },
    success: (data, status, xhr) => {
        console.log(data, status, xhr);
    }
});
```

> `NetBridge.getInstance()` returns a singleton from which you can use the `addToRequestQueue()` method
to queue up requests that are to be dispatched synchronously, making network calls easier on your browser.

<h2 id="attributes"> Attributes </h2>

> NetBridge accepts similar attributes as the regular JQuery `$.ajax`

- `url` - This defines the url to the endpoint being called.
- `method` - This defines the request method you wish to use.
- `data` - This defines the payload being sent to the server.
- `processData` - This defines a boolean which when `true` tells NetBridge to process data being sent to the server or otherwise.
- `timeout` - This defines a time after which the request should be aborted if not complete already. (Time must be passed in milliseconds as `int` data type).
- `cache` - This defines a boolean which when `true` tells NetBridge to cache the request or otherwise.
- `headers` - This defines an object of headers being sent to the server. 
- `responseHeaders` - This defines a function which will receive as array of headers sent from the server.
- `xhr` - This defines a function using to receive an object of the current `XMLHttpRequest`.
- `contentType` - This defines the content type being sent to the server. (If not needed, set to false or do not define).
- `queue` - This defines a function to be ran when the request is not dispatched immediately but queued for later execution.
- `beforeSend` - This defines a function to be ran just before your request is sent to the server.
- `cancel` - This defines a function to be ran when the request is cancelled.
- `abort` - This defines a function to be ran when the request is aborted.
- `ontimeout` - This defines a functions to be ran when the request times out.
- `complete` - This defines a function to be ran when the request is completed. It accepts 2 params, the first param receives an object of the current `XMLHttpRequest` while the second param receives the server response status.
- `success` - This defines a function to be ran when the request is successful. It accepts 3 params, the first param receives the server response, the second param receives the server response status, while the third receives an object of the current `XMLHttpRequest`.
- `error` - This defines a function to be ran if an error occurs. It accepts 3 params, the first param receives an object of the current `XMLHttpRequest`, the second param receives the server response status, while the third receives the request status text.