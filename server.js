import express from 'express';

const app= express();
const PORT =process.env.PORT || 3000;
const ROBOTS_TXT ='User-agent: *\nDisallow: /api/\n';

const COURSES = [
    {id: 1, title: 'Introduction to Programming', credits: 6 },
    {id: 2, title: 'Web Development Basics', credits: 5 },
    {id: 3, title: 'Databases', credits: 4},
];
function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  }
  
  app.use(logger);

app.get('/hello', (req, res) =>{
    res.type('text/plain').send("Hello from Zeynep's server");
});
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(ROBOTS_TXT);
});
app.get('/old-page', (req, res) => {
    res.redirect(301, '/hello');
});
app.get('/api/courses', (req, res) => {
    res.json(COURSES);
  });
app.get('/api/status', (req, res)=> {
    res.json({
        status: 'ok',
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
    });
});

app.get('/api/headers', (req, res) => {
    res.json({
        userAgent: req.get('User-Agent') ?? null,
        accept: req.get('Accept') ?? null,
      });
});

app.post('/api/subscribe', (req, res) => {
    res.status(201).json({subscribed: true});
});
app.get('/api/admin', (req, res) => {
    res.status(403).json({ error: 'Forbidden' });
});

app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'Not found' });
    } else {
      res.status(404).type('text/plain').send('404 - Page not found');
    }
  });

  app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Server running at http://localhost:${PORT}`);
  });