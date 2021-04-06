const config = require('./config.json');

const express = require('express');
const cors = require('cors');

let server = express();
server.use(cors());
server.listen(config.port, config.host, () => {
    console.log('Server started on ' + config.host + ':' + config.port);
});

config.controllers.forEach(controller => {
    require('./controllers/' + controller.name).setup(server, controller.endpoint);
});
