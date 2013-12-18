WebRTC
======

Concrete example of WebRTC (real-time communications in web browsers).

This project aims to be a basic example of the WebRTC API and how we can make video calls with just a few lines of  JavaScript.
Technologies used in the project:
* [WebRTC API](http://en.wikipedia.org/wiki/WebRTC)
* Client side : [HTML5](http://www.html5rocks.com/en/) (in this case : webrtc, video and web sockets), [AngularJS](http://angularjs.org/), [Twitter Bootstrap](http://twitter.github.com/bootstrap/), [JQuery](http://jquery.com/)
* Server side : [Node.js](http://nodejs.org/), [Express](http://expressjs.com/)


## Installation

``` bash
     npm install
```

## Run

* Start NodeJS

``` bash
     node main
```

* Open your browser, enter http://localhost:8888.

The application has been tested with :
* Google Chrome v31
* Firefox v26 (PC and Android Phone)

## Snapshots

![Caller with Chrome](/docs/webrtc_part1.png)
![Callee with FF](/docs/webrtc_part2.png)