const configs = require('./configs');
const server = require('./server');
const database = require('./db_async');




(async function() {
    const dbConfig = configs.getDbConfig();
    const db = await database.init(dbConfig);

    const serverConfig = configs.getServerConfig();
    const appServer = server.init(serverConfig, db);

    appServer.listen(process.env.PORT || serverConfig.port, () => {
        console.log(`Server listening on port ${serverConfig.port}..`);
    });
})();