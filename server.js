const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = express()

const { v4: uuidv4 } = require('uuid')
const cookieParser = require('cookie-parser')
const ShortURL = require('./models/shortURL')
const User = require('./models/user')
const { setUser } = require('./service/auth')
const { restrictToLoginUserOnly, checkAuth } = require('./middleware/auth')

mongoose.connect('mongodb+srv://yash898gupta:IwbalvJdxXVvPQnR@cluster0.dmasw8x.mongodb.net/', {
    useNewURLParser: true, useUnifiedTopology: true
})
const shortId = require('shortid')

const shortURLschema = new mongoose.Schema(
    {
        og: {
            type: String,
            require: true
        },

        short: {
            type: String,
            require: true,
            default: shortId.generate
        },

        clicks: {
            type: Number,
            require: true,
            default: 0
        },

        description: {
            type: String,
            require: false,
            default: "NO TEXT"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        }
    }
)


const url_shortner = mongoose.model('shorturl', shortURLschema);



app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', checkAuth, async (req, res) => {
    if (!req.user) return res.redirect("/login");
    const shortUrls = await ShortURL.find({ createdBy: req.user._id });
    res.render('index.ejs', { shortUrls: shortUrls })
})

app.get('/search', restrictToLoginUserOnly, async (req, res) => {
    res.render('search.ejs')
})

app.post('/shortURLs', restrictToLoginUserOnly, async (req, res) => {
    await ShortURL.create({ og: req.body.ogURL, description: req.body.description, createdBy: req.user._id })
    res.redirect('/')
})

app.get('/signup', checkAuth, async (req, res) => {
    res.render('signup.ejs')
})

app.post('/user', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    await User.create({ name: req.body.name, email: req.body.email, password: hashedPassword })
    res.redirect('/login')
})

app.get('/login', checkAuth, async (req, res) => {
    res.render('login.ejs')
})

app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
        return res.render('login', {
            message: "Invalid email",
        });

    if (await bcrypt.compare(password, user.password)) {


        //const sessionId = uuidv4();
        //setUser(sessionId,user);
        //res.cookie('uid',sessionId);
        const token = setUser(user);
        res.cookie('uid', token);
        res.redirect('/');
    }
    else {
        return res.render('login', {
            message: "Invalid password",
        });
    }

})



app.post('/SearchHere', restrictToLoginUserOnly, async (req, res) => {
    res.redirect('/find?t=' + req.body.search)
})

app.get('/find', restrictToLoginUserOnly, async (req, res) => {
    try {
        console.log(req.query.t)
        var result = await url_shortner.aggregate([
            {
                '$search': {
                    'index': 'search-text',
                    'text': {
                        'query': req.query.t,
                        'path': {
                            'wildcard': '*'
                        }
                    }
                }
            }
        ])
        console.log(Object.values(result))
        res.status(200).send(result)
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})






app.get('/:shortURL', restrictToLoginUserOnly, async (req, res) => {
    const shortURL = await ShortURL.findOne({ short: req.params.shortURL })
    if (shortURL == null) return res.sendStatus(404)
    shortURL.clicks++
    shortURL.save()

    res.redirect(shortURL.og)
})


app.listen(process.env.PORT || 5000); 