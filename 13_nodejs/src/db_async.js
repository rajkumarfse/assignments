const mysql = require('mysql2/promise');


module.exports.init = async (configs) => {
    return await mysql.createConnection({
        connectionLimit: configs.connectionLimit,
        host: configs.host,
        user: configs.user,
        password: configs.password,
        database: configs.database,
        debug: configs.debug
    });
};