module.exports.init = (app, db) => {

    app.get('/', async function(req, res) {
        res.redirect('/items');
    });

    app.get('/login', async function(req, res) {
        res.render('login.html');
    });

    app.post('/login', async function(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        const [rows, fields] = await db.execute(`SELECT * FROM users WHERE username="${username}" AND password= PASSWORD("${password}")`);
        console.log(`SELECT * FROM users WHERE username="${username}" AND password= PASSWORD("${password}")`);
        if (rows.length) {
            req.session.user = {
                id: rows[0].id,
                name: rows[0].username
            };
            res.send({"status": 1 });
        }else {
            res.send({"status": 0 });
        }        
    });

    app.get('/logout', async function(req, res) {
        req.session.destroy(function(err) {
            if(err) {  
                console.log(err);
            } else  {  
                res.redirect('/');
            }  
        });
    });
}
