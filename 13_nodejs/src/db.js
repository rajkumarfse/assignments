const mysql = require('mysql2');


module.exports.init = (configs) => {
    return mysql.createPool({
        connectionLimit: configs.connectionLimit,
        host: configs.host,
        user: configs.user,
        password: configs.password,
        database: configs.database,
        debug: configs.debug
    });
};