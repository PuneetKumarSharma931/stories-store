const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

//Load Config
dotenv.config({ path: './config/config.env' });

//Passport Config
require('./config/passport')(passport);

connectDB();

const app = express();

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
}));

//Logging
if (process.env.NODE_ENV === 'development') {

    app.use(morgan('dev'));
}

//Handlebars Helpers
const { formatDate, truncate, stripTags, editIcon, select, likeIcon, dislikeIcon, showCommentButton, showCommentMoreVert } = require('./helpers/hbs');

//Handlebars
app.engine('.hbs', engine({ helpers: {formatDate, truncate, stripTags, editIcon, select, likeIcon, dislikeIcon, showCommentButton, showCommentMoreVert}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

//Session Middleware
app.use(session({
    secret: 'Puneet Kumar Sharma StorieStore',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Setting Global Var
app.use((req, res, next)=>{

    res.locals.user = req.user || null;

    next();
});

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{

    console.log(`Server is running in ${process.env.NODE_ENV} mode on port: ${PORT}`);
});