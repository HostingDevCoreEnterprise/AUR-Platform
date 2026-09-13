const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Middleware to check if logged in
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Pass user to views
app.use(async (req, res, next) => {
    res.locals.user = null;
    if (req.session.userId) {
        try {
            const result = await db.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
            if (result.rows.length > 0) {
                res.locals.user = result.rows[0];
            }
        } catch (err) {
            console.error(err);
        }
    }
    next();
});

// --- ROUTES ---

// 1. Landing Page
app.get('/', (req, res) => {
    res.render('index');
});

// 2. Auth Routes
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.render('login', { error: 'E-mail sau parolă incorectă.' });
        }
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (match) {
            req.session.userId = user.id;
            return res.redirect('/dashboard');
        } else {
            return res.render('login', { error: 'E-mail sau parolă incorectă.' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'A apărut o eroare la server.' });
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, county, phone_number, birth_date, high_school } = req.body;
    try {
        // check if user exists
        const check = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            return res.render('register', { error: 'Acest e-mail este deja înregistrat.' });
        }
        
        const hash = await bcrypt.hash(password, 10);
        const id = uuidv4();
        
        // Handle optional dates safely
        const parsedBirthDate = birth_date ? birth_date : null;

        await db.query(
            `INSERT INTO users (id, first_name, last_name, email, password_hash, county, phone_number, birth_date, high_school) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, first_name, last_name, email, hash, county, phone_number || null, parsedBirthDate, high_school || null]
        );
        
        req.session.userId = id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Eroare la crearea contului.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 3. Dashboard
app.get('/dashboard', requireAuth, async (req, res) => {
    // Recomandări pe baza județului
    const userCounty = res.locals.user.county;
    let recommended = [];
    try {
        const result = await db.query('SELECT * FROM universities WHERE county = $1 LIMIT 4', [userCounty]);
        recommended = result.rows;
    } catch (err) {
        console.error(err);
    }
    
    res.render('dashboard', { recommended });
});

// 4. Toate Universitățile (Catalog) - Accesibil și fără logare
app.get('/universities', async (req, res) => {
    let universities = [];
    try {
        const result = await db.query('SELECT * FROM universities ORDER BY name ASC');
        universities = result.rows;
    } catch (err) {
        console.error(err);
    }
    res.render('universities', { universities });
});

// 5. Harta Comunităților (Reddit/Discord) - Doar pentru utilizatori logați
app.get('/comunitati', requireAuth, (req, res) => {
    res.render('comunitati');
});

// 5.1 Pagini Informative (Footer) - Accesibile și fără logare
const infoPages = {
    '/misiune': 'misiune',
    '/federatii': 'federatii',
    '/aliante': 'aliante',
    '/cariere': 'cariere',
    '/burse': 'burse',
    '/ghid': 'ghid',
    '/faq': 'faq',
    '/termeni': 'termeni',
    '/confidentialitate': 'confidentialitate',
    '/contact': 'contact',
    '/informatii': 'informatii',
    '/apex-confidentialitate': 'apex-confidentialitate',
    '/apex-termeni': 'apex-termeni'
};

for (const [route, template] of Object.entries(infoPages)) {
    app.get(route, (req, res) => {
        res.render(template);
    });
}

// 5.1b Protected Tools
const protectedTools = {
    '/buget': 'buget',
    '/eseu': 'eseu',
    '/hub': 'hub'
};

for (const [route, template] of Object.entries(protectedTools)) {
    app.get(route, requireAuth, (req, res) => {
        res.render(template);
    });
}

// 5.2 API for Simulations
app.get('/calculator', requireAuth, async (req, res) => {
    try {
        let simulations = [];
        if (req.session.userId) {
            const result = await db.query('SELECT * FROM simulations WHERE user_id = $1 ORDER BY created_at DESC', [req.session.userId]);
            simulations = result.rows;
        }
        res.render('calculator', { simulations });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la încărcarea calculatorului.');
    }
});

app.post('/api/simulations', requireAuth, async (req, res) => {
    const { title, formula, final_grade } = req.body;
    try {
        await db.query(
            'INSERT INTO simulations (id, user_id, title, formula, final_grade) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), req.session.userId, title, formula, final_grade]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Eroare la salvarea simulării.' });
    }
});

// 5.3 Tracker
app.get('/tracker', requireAuth, async (req, res) => {
    try {
        const univResult = await db.query('SELECT name, acronym FROM universities ORDER BY name ASC');
        const appResult = await db.query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [req.session.userId]);
        
        res.render('tracker', { 
            universities: univResult.rows,
            applications: appResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare server');
    }
});

app.post('/api/applications', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const { university_name, faculty_name, program_name, grade } = req.body;
    try {
        const uniRes = await db.query('SELECT url FROM universities WHERE name = $1 LIMIT 1', [university_name]);
        let url = uniRes.rows.length > 0 ? uniRes.rows[0].url : '';
        
        await db.query(
            'INSERT INTO applications (id, user_id, university_name, faculty_name, program_name, status, grade, university_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [uuidv4(), req.session.userId, university_name, faculty_name || '', program_name, 'Aplicat', grade || null, url]
        );
        res.redirect('/tracker');
    } catch (err) {
        console.error(err);
        res.redirect('/tracker');
    }
});

app.post('/api/applications/:id/status', requireAuth, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE applications SET status = $1 WHERE id = $2 AND user_id = $3', [status, req.params.id, req.session.userId]);
        res.redirect('/tracker');
    } catch (err) {
        console.error(err);
        res.redirect('/tracker');
    }
});

app.post('/api/applications/:id/edit', requireAuth, async (req, res) => {
    const { university_name, faculty_name, program_name, grade } = req.body;
    try {
        const uniRes = await db.query('SELECT url FROM universities WHERE name = $1 LIMIT 1', [university_name]);
        let url = uniRes.rows.length > 0 ? uniRes.rows[0].url : '';
        
        await db.query(
            'UPDATE applications SET university_name = $1, faculty_name = $2, program_name = $3, grade = $4, university_url = $5 WHERE id = $6 AND user_id = $7',
            [university_name, faculty_name || '', program_name, grade || null, url, req.params.id, req.session.userId]
        );
        res.redirect('/tracker');
    } catch (err) {
        console.error(err);
        res.redirect('/tracker');
    }
});

app.post('/api/applications/:id/delete', requireAuth, async (req, res) => {
    try {
        await db.query('DELETE FROM applications WHERE id = $1 AND user_id = $2', [req.params.id, req.session.userId]);
        res.redirect('/tracker');
    } catch (err) {
        console.error(err);
        res.redirect('/tracker');
    }
});

// 5.4 Essay AI API
app.post('/api/generate-essay', async (req, res) => {
    const { faculty, passion, achievements, future } = req.body;
    
    if (!faculty || !passion) {
        return res.status(400).json({ error: 'Date insuficiente pentru eseu.' });
    }

    let signature = '';
    if (req.session && req.session.userId) {
        try {
            const userRes = await db.query('SELECT first_name, last_name, email, phone_number FROM users WHERE id = $1', [req.session.userId]);
            if (userRes.rows.length > 0) {
                const u = userRes.rows[0];
                let contactInfo = [];
                if (u.email) contactInfo.push(`Email: ${u.email}`);
                if (u.phone_number) contactInfo.push(`Tel: ${u.phone_number}`);
                const contactStr = contactInfo.length > 0 ? `<br>${contactInfo.join(' | ')}` : '';
                signature = `${u.first_name} ${u.last_name}${contactStr}`;
            }
        } catch (e) {
            console.error('Eroare fetch user pentru eseu:', e);
        }
    }

    const prompt = `Ești un consultant educațional de top în România. Scrie o Scrisoare de Intenție / Eseu Motivațional academic, formal și convingător (aprox 400 cuvinte) pentru admiterea la facultate.
Datele candidatului:
- Aplică la: ${faculty}
- Pasiune/Motivație: ${passion}
- Realizări/Activități: ${achievements}
- Planuri de viitor: ${future}

REGULI STRICTE:
1. NU folosi niciun text conversațional de tip "Iată propunerea mea", "Aici este eseul" înainte sau după text.
2. Returnează EXCLUSIV conținutul scrisorii de intenție, gata de printat.
3. Scrisoarea trebuie să aibă introducere formală (Către Comisia de Admitere a...).
4. La final, formulează încheierea EXACT așa (fără a lăsa loc de completat sau paranteze pătrate):
Cu respect,
${signature}`;

    const apiKey = process.env.GEMINI_API_KEY;
    const maxRetries = 5;
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            
            if (!response.ok) {
                const errText = await response.text();
                let is503 = false;
                try {
                    const errJson = JSON.parse(errText);
                    if (errJson.error && errJson.error.code === 503) {
                        is503 = true;
                    }
                } catch (e) {}

                if (is503) {
                    attempt++;
                    console.log(`[API] Eroare 503 Gemini. Încercarea ${attempt}/${maxRetries}...`);
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    } else {
                        throw new Error('Serverele sunt foarte aglomerate în acest moment (High Demand). Te rugăm să aștepți un minut și să încerci din nou.');
                    }
                } else {
                    console.error('Eroare de la Gemini API:', errText);
                    throw new Error('A apărut o eroare la conexiunea cu AI-ul. Te rugăm să încerci din nou.');
                }
            }

            const data = await response.json();
            const rawText = data.candidates[0].content.parts[0].text;
            return res.json({ text: rawText });
            
        } catch (err) {
            // Dacă nu e o eroare de retry (sau a epuizat încercările), aruncăm eroarea
            if (attempt >= maxRetries || !err.message.includes('High Demand')) {
                console.error('Eroare finală generare eseu:', err.message);
                return res.status(500).json({ error: err.message });
            }
        }
    }
});

// 6. Profil
app.get('/profile', requireAuth, (req, res) => {
    res.render('profile');
});

app.post('/profile', requireAuth, async (req, res) => {
    const { county, phone_number, high_school } = req.body;
    try {
        await db.query(
            'UPDATE users SET county = $1, phone_number = $2, high_school = $3 WHERE id = $4',
            [county, phone_number, high_school, req.session.userId]
        );
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
});

// 7. Delete Account
app.post('/delete-account', requireAuth, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.session.userId]);
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
});

app.listen(PORT, () => {
    console.log(`Unilink server is running on http://localhost:${PORT}`);
});
