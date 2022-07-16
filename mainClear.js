const server = require('./server/app.js');
// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const ps = require('ps-node');
const psList = require('ps-list');
const path = require('path');
const fs = require('fs');

const deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
          var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
  }
};

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280, height: 720, titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#f8f9fa',
        symbolColor: '#E0040B'
    }, 
    icon: __dirname + '/icon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.on('will-resize', (event) => {
    event.preventDefault();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.env.NODE_ENV === 'dev') {
    botFolder = path.join(__dirname, '/system');
  } else {
    botFolder = path.join(__dirname, '../app.asar.unpacked/node_modules/process-exists/node_modules/ps-list/system');
  }
  
  psList().then(data => {
      let fleamarket = false;
      for(let i in data){
          if (data[i].name === 'fleamarket.exe') {
              fleamarket = data[i];
              break;
          }
      }
      
      if (fleamarket !== false) {
          ps.kill(fleamarket.pid, function( err ) {
              if (err) {
                  //throw new Error( err );
              }
              else {
                deleteFolderRecursive(botFolder);
                app.quit();
              }
          });
      } else {
        deleteFolderRecursive(botFolder);
        app.quit();
      }
  });

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
