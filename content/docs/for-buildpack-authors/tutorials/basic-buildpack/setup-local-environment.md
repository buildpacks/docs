+++
title="Set up your local environment"
weight=401
+++

<!-- test:suite=create-buildpack;weight=1 -->

<!-- test:setup:exec;exit-code=-1 -->
<!--
```bash
docker rmi test-node-js-app
pack config trusted-builders add cnbs/sample-builder:jammy
```
-->

<!-- test:teardown:exec -->
<!--
```bash
docker rmi test-node-js-app
```
-->

First, we'll create a sample nodeJS app that you can use when developing your buildpack:

<!-- test:exec -->
```bash
mkdir node-js-sample-app
```
<!--+- "{{execute}}"+-->

Create a file in the current directory called `node-js-sample-app/app.js`<!--+"{{open}}"+--> with the following contents:

<!-- test:file=node-js-sample-app/app.js -->
```javascript
const http = require('http');
 
const hostname = '0.0.0.0';
const port = 8080;
 
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!');
});
 
// For demo purposes we do not actually start the server.  This
// allows us pretend to start the server and check if the output
// message is correct.
//server.listen(port, hostname, () => {
//  console.log(`Server running at http://${hostname}:${port}/`);
//});
console.log(`Server running at http://${hostname}:${port}/`)
```

We also create a `package.json` file with the following contents:

<!-- test:file=node-js-sample-app/package.json -->
```javascript
{
  name = "example-application"
}
```

Finally, make sure your local Docker daemon is running by executing:

<!-- test:exec -->
```bash
docker version
```
<!--+- "{{execute}}"+-->

If you see output similar to the following, you're good to go! Otherwise, start Docker and check again.

```
Client: Docker Engine - Community
 Version:           20.10.9
 API version:       1.41
 Go version:        go1.16.8
 Git commit:        c2ea9bc
 Built:             Mon Oct  4 16:08:29 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.9
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.8
  Git commit:       79ea9d3
  Built:            Mon Oct  4 16:06:34 2021
  OS/Arch:          linux/amd64
  Experimental:     false
```

<!--+ if false +-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/building-blocks-cnb" class="button bg-pink">Next Step</a>
<!--+ end+-->
