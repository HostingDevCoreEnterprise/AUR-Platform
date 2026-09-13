const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.render('index', { title: 'Acasă - Alianța Universitară Română' }));
app.get('/despre', (req, res) => res.render('despre', { title: 'Despre Alianță' }));

app.get('/universitati', (req, res) => res.render('universitati', { title: 'Universități' }));
// Oportunități routes
app.get('/burse', (req, res) => res.render('burse', { title: 'Burse și Finanțări' }));
app.get('/mobilitate', (req, res) => res.render('mobilitate', { title: 'Mobilitate și Schimburi' }));
app.get('/practica', (req, res) => res.render('practica', { title: 'Stagii și Practică' }));
app.get('/cazare', (req, res) => res.render('cazare', { title: 'Cazare și Cămine' }));
app.get('/consiliere', (req, res) => res.render('consiliere', { title: 'Consiliere și Sprijin Psihologic' }));

// Voluntariat
app.get('/voluntariat', (req, res) => res.render('voluntariat', { title: 'Voluntariat și Organizații Studențești' }));
app.get('/evenimente', (req, res) => res.render('evenimente', { title: 'Evenimente Studențești' }));

// Cercetare & Carieră
app.get('/cercetare', (req, res) => res.render('cercetare', { title: 'Cercetare Studențească' }));
app.get('/doctorat', (req, res) => res.render('doctorat', { title: 'Doctorat și Cercetare' }));
app.get('/cariera', (req, res) => res.render('cariera', { title: 'Carieră și Angajabilitate' }));
app.get('/antreprenoriat', (req, res) => res.render('antreprenoriat', { title: 'Antreprenoriat' }));
app.get('/legislatie', (req, res) => res.render('legislatie', { title: 'Drepturi și Legislație' }));

app.get('/devin-student', (req, res) => {
    res.render('devin-student', { pageTitle: 'Devin Student - AUR' });
});
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact - Alianța Universitară Română' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
