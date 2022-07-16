const configApi = {
    dev: {
        SERVER_URI: 'http://127.0.0.1/'
    },
    prod: {
        SERVER_URI: 'https://api.testdeveloper.ru/flea/'
    }
};
if (process.env.NODE_ENV === 'dev') {module.exports = configApi['dev']}
else {module.exports = configApi['prod'];}