import express from 'express';

const app= express();
const PORT =process.env.PORT || 3000;
const ROBOTS_TXT ='User-agent: *\nDisallow: /api/\n';

const COURSES = [
    {id: 1, title: 'Introduction to Programming', credits: 6 },
    {id: 2, title: 'Web Development Basics', credits: 5 },
    {id: 3, title: 'Databases', credits: 4},
];

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

app.listen(PORT, ()=> {
    console.log(`Server running at http://localhost:${PORT}`);

});