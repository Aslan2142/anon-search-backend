const axios = require('axios');
const parse = require('node-html-parser').parse;

function setup(server, endpoint) {

    server.get(endpoint, (request, response) => {
        if (request.query.q == undefined) {
            response.send({
                error: 'no query'
            });
            return;
        }

        axios.request({
            method: 'GET',
            url: 'https://www.google.com/search?q=' + request.query.q,
            responseType: 'arraybuffer',
            reponseEncoding: 'binary'
        }).then(googleResponse => {
            let root = parse(googleResponse.data.toString('latin1'));
            response.send(process(root));
        });
    });

}

function process(root) {
    let processed = {
        imageContainer: null,
        results: []
    };

    let containers = root.querySelectorAll('.ZINbbc.xpd.O9g5cc.uUPGi');

    containers.forEach(container => {
        if (container.childNodes.length == 4) {
            let title = container.querySelector('.BNeawe.deIvCb.AP7Wnd').firstChild.rawText;

            let description = container.querySelectorAll('.BNeawe.s3v9rd.AP7Wnd')[1].firstChild.rawText;

            processed.imageContainer = {
                title,
                description,
                images: []
            }

            container.querySelectorAll('.BVG0Nb').forEach(element => {
                let link = element.attrs.href;
                link = link.slice(15, link.indexOf('&'))

                let thumbnail = link; //TO-DO - Generate a real thumbnail

                processed.imageContainer.images.push({
                    link,
                    thumbnail
                });
            });
        }

        if (container.childNodes.length == 3) {
            if (!container.firstChild.rawAttrs.includes('kCrYT')) return;
            if (container.querySelector('.BNeawe.vvjwJb.AP7Wnd') == null) return;
            
            let title = container.querySelector('.BNeawe.vvjwJb.AP7Wnd').firstChild.rawText;
            
            let link = container.firstChild.firstChild.attrs.href;
            link = link.slice(7, link.indexOf('&'))

            let description = container.querySelector('.BNeawe.s3v9rd.AP7Wnd').firstChild.rawText;

            processed.results.push({
                title,
                link,
                description
            });
        }
    });

    return processed;
}

module.exports = {
    setup
}