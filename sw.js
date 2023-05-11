self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request).then(response => {
    if(response.status === 404 && event.request.destination === 'document') return fetch("/")
    return response
  }));
});
