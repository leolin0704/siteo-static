const Express = require('express');
const path = require('path');

const app = new Express();
const port = 8080;

app.disable('x-powered-by');
app.use('/', Express.static(path.join(process.cwd(), 'dist'), { maxAge: '1d' }));
app.use('/node_modules', Express.static(__dirname + '/node_modules'));
// Make static assets stay at browser for 24h
app.use(function(req, res, next) {
  res.set({ 'Cache-Control': 'public, max-age=86400' });
  next();
});

app.listen(port, function() {
  const message = `Server listening on port:${port}`;

  console.log(message);
});
