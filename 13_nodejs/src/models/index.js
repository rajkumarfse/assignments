
module.exports.getCartByUserId = async (db, user_id) => {
    let cart = null;
    const [rows, fields] = await db.execute(`SELECT * FROM cart WHERE user_id=${user_id}`);
    if (rows.length) {
        cart = rows.pop();
        console.log(`Cart ID: ${cart.id}`);
        
        const [rows2, fields] = await db.execute(`SELECT i.id, i.title, i.image_path, i.price, ci.qty 
        FROM cart_items ci 
        LEFT JOIN items i ON ci.item_id=i.id WHERE cart_id=${cart.id}`);    

        if (rows2.length) {
            let total = 0;
            for(let i=0; i < rows2.length; i++) {            
                let item_id = rows2[i].id;
                const [rowsInner, fieldsInner] = await db.execute(`SELECT * FROM items_attributes WHERE item_id=${item_id}`);
                rows2[i].attr = rowsInner ? rowsInner : [];
                rows2[i].total = rows2[i].price * rows2[i].qty;
                total += rows2[i].total;
            }
            cart.items = rows2;
            cart.total = total;
        }            
    } else {
        const [result] = await db.execute(`INSERT INTO cart (user_id, status) VALUES(${user_id}, 1)`);
        if(result.affectedRows) {                
            const [cart_row, fields] = await db.execute(`SELECT * FROM cart WHERE id=${result.insertId}`);
            cart = cart_row.pop();
        }
    }        
    return cart;
}

module.exports.addToCart = async (db, user_id, item) => {
    if (item.id) {
        let cart = await module.exports.getCartByUserId(db, user_id);

        if (!cart) return false;

        await db.beginTransaction();
        if (module.exports.isItemExistIncart(cart, item.id)) {
            await db.execute(`UPDATE cart_items 
            SET qty=${item.qty} 
            WHERE cart_id=${cart.id} AND item_id=${item.id}`);

        } else {
            await db.execute(`INSERT INTO cart_items
            (cart_id, item_id, qty) VALUES(${cart.id}, ${item.id}, ${item.qty})`);
        }           
        await db.commit();

        return true;
    }
    return false;
}


module.exports.removeFromCart = async (db, user_id, item) => {
    if (item.id) {       
        let cart = await module.exports.getCartByUserId(db, user_id);

        if (!cart) return false;

        await db.beginTransaction();
        if (module.exports.isItemExistIncart(cart, item.id)) {
            await db.execute(`DELETE FROM cart_items 
            WHERE cart_id=${cart.id} AND item_id=${item.id}`);

        }        
        await db.commit();

        return true;
    }
    return false;
}

module.exports.isItemExistIncart = (cart, item_id) => {
    if (cart.items && cart.items.length) {            
        let filtered = cart.items.filter(item => item.id == item_id);
        if (filtered.length) return true;
    }
    return false;
}

module.exports.placeOrder = async (db, cart) => {
    console.log("Begin place order.....");
    console.log(cart);
    if (cart.id) {
        const [result] = await db.execute(`INSERT INTO orders (user_id, status) VALUES (? , ?)`, [cart.user_id, 1]);
        console.log(result);
        if (result.affectedRows) {
            const order_id = result.insertId;
            for (let i=0; i < cart.items.length; i++) {
                let item = cart.items[i];
                const [result2] = await db.execute(`INSERT INTO orders_items (order_id, item_id, title, image_path, price, qty) 
                VALUES (?, ?, ?, ?, ?, ?)`, [order_id, item.id, item.title, item.image_path, item.price, item.qty]);
                if (item.attr && item.attr.length) {
                    for (let j=0; j < item.attr.length; j++) {
                        let attr = item.attr[j];
                        const [result3] = await db.execute(`INSERT INTO orders_items_attributes (order_id, item_id, name, value) 
                        VALUES (?, ?, ?, ?)`, [order_id, item.id, attr.name, attr.value]);
                    }
                }
                await db.execute(`DELETE FROM cart_items WHERE cart_id=? AND item_id=?`, [cart.id, item.id]);
            }            
        }
        await db.execute(`DELETE FROM cart WHERE id=? AND user_id=?`, [cart.id, cart.user_id]);
    }
}

module.exports.getOrdersByUserId = async (db, user_id) => {
    let orders = null;
    const [rows, fields] = await db.execute(`SELECT * FROM orders WHERE user_id=? ORDER BY id DESC`, [user_id]);

    if (rows.length) {
        orders = [];
        for (let i=0; i < rows.length; i++) {
            let order = rows[i];
            order.items = [];
            order.total = 0;
            order.status_text = order.status == 1 ? 'Pending' : 'Completed';
            order.is_pending  = order.status == 1 ? true : false;

            const [rows2, fields] = await db.execute(`SELECT * FROM orders_items WHERE order_id=?`, [order.id]);
            for (let j=0; j < rows2.length; j++) {
                order.items.push(rows2[j]);
                const [rows3, fields] = await db.execute(`SELECT * FROM orders_items_attributes WHERE order_id=? AND item_id=?`, [order.id, rows2[j].item_id]);
                order.items[j].attr = rows3;
                order.items[j].total = rows2[j].price * rows2[j].qty;
                order.total += order.items[j].total;
            }
            orders.push(order);
        }
    }     
    return orders;
}

module.exports.getOrderByOrderId = async (db, order_id) => {
    let order = null;
    const [rows, fields] = await db.execute(`SELECT * FROM orders WHERE id=?`, [order_id]);

    if (rows.length) {
        order = rows.pop();
        order.items = [];
        order.total = 0;
        order.status_text = order.status == 1 ? 'Pending' : 'Completed';
        order.is_pending  = order.status == 1 ? true : false;
        
        const [rows2, fields] = await db.execute(`SELECT * FROM orders_items WHERE order_id=?`, [order.id]);
        for (let j=0; j < rows2.length; j++) {
            order.items.push(rows2[j]);
            const [rows3, fields] = await db.execute(`SELECT * FROM orders_items_attributes WHERE order_id=? AND item_id=?`, [order.id, rows2[j].item_id]);
            order.items[j].attr = rows3;
            order.items[j].total = rows2[j].price * rows2[j].qty;
            order.total += order.items[j].total;
        }            
    }     
    return order;
}

module.exports.isOrderCancellable = async (db, order_id) => {
    const [rows, fields] = await db.execute(`SELECT * FROM orders WHERE id=?`, [order_id]);
    if (rows.length) {
        let order = rows.pop();
        if (order.status == 1)  {
            return true;
        }
    }
    return false;
}

module.exports.cancelOrder = async (db, order_id) => {
    if(module.exports.isOrderCancellable(db, order_id)) {
        const [result1] = await db.execute(`DELETE FROM orders WHERE id=?`, [order_id]);
        const [result2] = await db.execute(`DELETE FROM orders_items WHERE order_id=?`, [order_id]);
        const [result3] = await db.execute(`DELETE FROM orders_items_attributes WHERE order_id=?`, [order_id]);
        return true;
    }    
    return false;
}

module.exports.removeItemFromOrder = async (db, order_id, item_id) => {
    if(module.exports.isOrderCancellable(db, order_id)) {        
        const [result1] = await db.execute(`DELETE FROM orders_items WHERE order_id=? AND item_id=?`, [order_id, item_id]);
        const [result2] = await db.execute(`DELETE FROM orders_items_attributes WHERE order_id=? AND item_id=?`, [order_id, item_id]);
        return true;
    }    
    return false;
}

module.exports.updateOrderItem = async (db, order_id, item) => {
    if(module.exports.isOrderCancellable(db, order_id)) {
        const [result1] = await db.execute(`UPDATE orders_items SET qty=? WHERE order_id=? AND item_id=?`, [item.qty, order_id, item.id]);
    }
}