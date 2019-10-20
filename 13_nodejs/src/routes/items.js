
module.exports.init = (app, db) => {

    app.get('/items', async function(req, res) {
        const [rows, fields] = await db.execute("SELECT * FROM items");        
        for(let i=0; i < rows.length; i++) {            
            let item_id = rows[i].id;
            const [rowsInner, fieldsInner] = await db.execute(`SELECT * FROM items_attributes WHERE item_id=${item_id}`);
            rows[i].attr = rowsInner ? rowsInner : [];
        }
        res.render('items.html', {"items": rows , "items_section": true});
    });
    
    app.get('/items/:id', async function(req, res) {        
        console.log(req.session);
        const [rows, fields] = await db.execute(`SELECT * FROM items WHERE id=${req.params.id}`);
        for(let i=0; i < rows.length; i++) {            
            let item_id = rows[i].id;
            console.log(item_id);
            const [rowsInner, fieldsInner] = await db.execute(`SELECT * FROM items_attributes WHERE item_id=${item_id}`);
            rows[i].attr = rowsInner ? rowsInner : [];
        }
        res.render('items_detail.html', {"items": rows, "items_section": true });
    });    
}