# Vojax
Vojax makes asynchronous network (ajax) calls on web.

#usage

```
let instance = Vojax.getInstance();
instance.addToRequestQueue({
    url: "https://swapi.co/api/people/2",
    method: "get",
    queue: function () {
        console.log('comment', 'am waiting');
    },
    beforeSend: function () {
        console.log('comment', 'I ran beforeSend');
    },
    success: (data, status, xhr) => {
        console.log(data, status, xhr);
    }
});
```

Vojax.getInstance() returns a singleton from which you can use the 'addToRequestQueue()' method
to add request that are to be dished out asynchronously.
