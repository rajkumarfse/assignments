const models = require('../models');

module.exports.init = (app, db) => {

    app.get('/cart', async function(req, res) {
        const user_id = req.session.user.id;
        const cart = await models.getCartByUserId(db, user_id);

        res.render('cart.html', {"cart": cart, "cart_section": true });
    });    
    
    app.post('/cart/add-to-cart', async function(req, res) {
        if(await models.addToCart(db, req.session.user.id, req.body)) {
            res.send({"status": 1 });
        } else {
            res.send({"status": 0 });
        }
    });

    app.post('/cart/update-cart', async function(req, res) {
        if(await models.addToCart(db, req.session.user.id, req.body)) {
            const user_id = req.session.user.id;
            const cart = await models.getCartByUserId(db, user_id);
            res.render('cart.html', {"cart": cart , is_partial : true});
        } else {
            res.send({"status": 0 });
        }
    });

    app.post('/cart/remove-item', async function(req, res) {
        if(await models.removeFromCart(db, req.session.user.id, req.body)) {
            const user_id = req.session.user.id;
            const cart = await models.getCartByUserId(db, user_id);
            res.render('cart.html', {"cart": cart , is_partial : true});
        } else {
            res.send({"status": 0 });
        }
    });

}