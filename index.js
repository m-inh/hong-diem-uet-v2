'use strict';

require('dotenv').config();
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
global.helpers = require('./helpers');
const mongodb = require('./mongoose');

mongodb()
    .then(
        message => {
            console.log(message);

            const routes = require('./routes');

            app.use(express.static(__dirname + '/public'));
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({extended: true}));
            app.use('/api', routes);

            const PORT = process.env.PORT || 2345;
            // Start server at PORT
            app.listen(PORT, () => {
                console.log(`*listening on ${PORT}`);
            });
        }
    )
    .catch(error => console.log(error));