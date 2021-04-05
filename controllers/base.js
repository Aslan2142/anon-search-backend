function setup(server, endpoint) {

    server.get(endpoint, (request, response) => {
        response.send({
            'online': true
        });
    });

}

module.exports = {
    setup
}