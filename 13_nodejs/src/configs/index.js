var config = require(`./config.${process.env.APP_ENV || "dev"}.json`);

module.exports.getDbConfig = () => config.database;

module.exports.getServerConfig = () => config.server;
