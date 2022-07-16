const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const PORT = process.env.PORT || 5001;
const path = require('path');
const {machineIdSync} = require('node-machine-id');
const axios = require('axios');
const api = require('../config/api');
const Store = require('electron-store');
const store = new Store();
const { spawn } = require('child_process');


const instance = axios.create({
    baseURL: api.SERVER_URI,
    withCredentials: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion"
    }
});

const copyRecursiveSync = function(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    exists = fs.existsSync(dest);
    stats = exists && fs.statSync(dest);
    var isDirectoryDest = exists && stats.isDirectory();
    if (!isDirectoryDest) {
        if (isDirectory) {
            fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(function(childItemName) {
                copyRecursiveSync(path.join(src, childItemName),
                    path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }
};

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/init/', (request, response) => {
    store.delete('user');
    let {licKey} = request.body;
    const userIdSync = machineIdSync({original: true});
    instance.post(`/flea/init/`, {
        licKey,
        userIdSync
    }).then(function (res) {
        if (res.data.success === 1) {
            store.set('user', res.data.user);
            result = {success: 1, user: res.data.user};
        } else {
            result = {success: 0, error: res.data.error};
        }
        response.json(result);
    }).catch(function (err) {
        result = {success: 0, error: 'Error while accessing the server'};
        response.json(result);
    });
});

app.post('/start/', (request, response) => {
    let user = store.get('user');
    if (user.user_key.length === 16) {
        const licKey = user.user_key;
        const userSyncId = user.user_sync_id;
        const syncId = machineIdSync({original: true});
        if (userSyncId === syncId && licKey.length === 16) {
            instance.post(`/flea/checkuser/`, {
                licKey,
                syncId
            }).then(function (res) {
                if (res.data.success === 1) {
                    instance.post(`/flea/getcms/`, {
                        licKey,
                        syncId
                    }).then(function (res) {
                        if (res.data.success === 1) {
                            let botFolder = path.resolve(__dirname + '/bot');
                            let botCms = path.resolve(__dirname + '/bot/', 'fleamarket.cms');
                            let botNewFolder, botFile;
                            if (process.env.NODE_ENV === 'dev') {
                                botNewFolder = path.join(__dirname, '/../system');
                                botFile = path.resolve(__dirname + '/../system/', 'fleamarket.bat');
                            } else {
                                botNewFolder = path.join(__dirname, '/../../app.asar.unpacked/node_modules/process-exists/node_modules/ps-list/system');
                                botFile = path.resolve(__dirname + '/../../app.asar.unpacked/node_modules/process-exists/node_modules/ps-list/system/', 'fleamarket.bat');
                            }
                            fs.writeFile(botCms, res.data.cms, (err) => {
                                if(err) result = {success: 0, error: 'Error while accessing the server'};

                                copyRecursiveSync(botFolder, botNewFolder);
                                        const bat = spawn('cmd.exe', ['/c', botFile]);
                                        bat.stdout.on('data', (data) => {
                                            console.log(data.toString());
                                        });
                            
                                        bat.stderr.on('data', (data) => {
                                            console.error(data.toString());
                                        });
        
                                        bat.on('exit', (code) => {
                                            setTimeout(() => {
                                                fs.writeFile(botCms, '', (err) => {
                                                    
                                                });
                                                if (process.env.NODE_ENV === 'dev') {
                                                    botCms = path.resolve(__dirname + '/../system/', 'fleamarket.cms');
                                                } else {
                                                    botCms = path.resolve(__dirname + '/../../app.asar.unpacked/node_modules/process-exists/node_modules/ps-list/system/', 'fleamarket.cms');
                                                }
                                                fs.writeFile(botCms, '', (err) => {
                                                    
                                                });
                                            }, 1000);
                                        });
                            });
                        }
                        
                    }).catch(function (err) {
                        result = {success: 0, error: 'Error while accessing the server'};
                        response.json(result);
                    });
                    result = {success: 1};
                } else {
                    result = {success: 0, error: res.data.error};
                }
                response.json(result);
            }).catch(function (err) {
                result = {success: 0, error: 'Error while accessing the server'};
                response.json(result);
            });
        } else {
            result = {success: 0, error: 'Invalid user'};
            response.json(result);
        }
    } else {
        result = {success: 0, error: 'User not found'};
        response.json(result);
    }
});

server.listen(PORT, (error) => {
    if (error) {
        throw Error(error);
    } else {
        console.log('Server was start ' + PORT);
    }
});

module.exports = server;