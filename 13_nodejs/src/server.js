const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mustache = require('mustache-express');
const session = require('express-session');


module.exports.init = (configs, db) => {
    const app = express();    
    
    //Some middleware configs
    app.use(morgan(configs.logger.format));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('static'));
    app.use(session({
        secret: 'esationary app session',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } //need https for secure cookie
    }));

    //Template engine
    app.engine('html', mustache(__dirname + '/views/partials', '.html'));
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    //Login redirect
    app.use((req, res, next) => {
        console.log(req.originalUrl);
        if(req.originalUrl != '/login') {
            //for development
            //req.session.user = { id: 1, name: 'rajkumar' };            
            if (req.session.user && req.session.user.id) {
                next();
            }else {
                res.redirect('/login');
            }
        }else {
            next();
        }              
    });
    
    //Routes
    require('./routes/user').init(app, db);
    require('./routes/items').init(app, db);
    require('./routes/cart').init(app, db);
    require('./routes/order').init(app, db);

    

    //Error handling
    app.use((err, req, res, next) => {
        console.log(err);
        res.status(500).send(err);
    });

    return app;
}