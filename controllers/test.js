const fs = require('fs');
const axios = require('axios');
const parse = require('node-html-parser').parse;

function setup(server, endpoint) {

    server.get(endpoint, (request, response) => {
        axios.request({
            method: 'GET',
            url: 'https://www.google.com/search?q=' + request.query.q,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary'
        }).then(googleResponse => {
            let data = googleResponse.data.toString('latin1');

            fs.writeFileSync('test.html', data);
            response.send(data);
        });
    });

}

module.exports = {
    setup
}