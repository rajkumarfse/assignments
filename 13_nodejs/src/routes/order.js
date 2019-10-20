const models = require('../models');

module.exports.init = (app, db) => {
    app.post('/order/place-order', async function(req, res) {
        const user_id = req.session.user.id;
        let cart = await models.getCartByUserId(db, user_id);
        if(cart) {
            await models.placeOrder(db, cart);
            cart = await models.getCartByUserId(db, user_id);
            res.render('cart.html', {"cart": cart , is_partial : true});
        } else {
            res.send({"status": 0 });
        }
    });

    app.get('/orders', async function(req, res) {
        const user_id = req.session.user.id;
        const orders = await models.getOrdersByUserId(db, user_id);
        res.render('orders.html', {"orders": orders, "orders_section": true});
    });

    app.get('/orders/:id', async function(req, res) {   
        const order = await models.getOrderByOrderId(db, req.params.id);
        res.render('order_detail.html', {"order": order, "orders_section": true});
    });

    app.post('/orders/cancel-order', async function(req, res) {
        if(await models.cancelOrder(db, req.body.id)) {
            const user_id = req.session.user.id;
            const orders = await models.getOrdersByUserId(db, user_id);           
            res.render('orders.html', {"orders": orders , is_partial : true});
        } else {
            res.send({"status": 0 });
        }
    });

    app.post('/orders/remove-item/:id', async function(req, res) {
        let item_id = req.body.id;
        let order_id = req.params.id;
        let status = isCancelled = false;
        if(item_id &&  order_id) {
            if(await models.removeItemFromOrder(db, order_id, item_id)) {
                status = true;
                const order = await models.getOrderByOrderId(db, order_id);
                if(!order.items.length) { //cancel the order
                    if(await models.cancelOrder(db, order_id)) {                        
                        isCancelled = true;
                    }
                }                                             
            }
        }
        if(!isCancelled) {
            const order = await models.getOrderByOrderId(db, order_id);
            res.render('order_detail.html', {"order": order , is_partial : true});
        } else {
            res.send({"status": status , "isCancelled" : isCancelled});
        }
    });


    app.post('/orders/update-order/:id', async function(req, res) {        
        let order_id = req.params.id;
        let items = req.body.items;
        if(items.length) {
            for(let i=0; i < items.length ; i++) {
                await models.updateOrderItem(db, order_id, items[i]);
            }
            const order = await models.getOrderByOrderId(db, order_id);
            res.render('order_detail.html', {"order": order , is_partial : true});
        } else {
            res.send({"status": false});
        }
    });

    
};