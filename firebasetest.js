var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
 
var config = {
    apiKey: "AIzaSyC7QS1wzXWEkP1ZGF5WZLlYsW1zJCBIxd8",
    authDomain: "mac-bot-e4286.firebaseapp.com",
    databaseURL: "https://mac-bot-e4286.firebaseio.com",
    storageBucket: "mac-bot-e4286.appspot.com",
    messagingSenderId: "611771779733"
};

var app = firebase.initializeApp(config); 
 