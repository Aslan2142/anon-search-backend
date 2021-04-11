const config = require('../config.json');

const fs = require('fs');
const axios = require('axios');
const parse = require('node-html-parser').parse;

function setup(server, endpoint) {

    server.get(endpoint, (request, response) => {
        let query = request.query.q;
        if (query == undefined) {
            response.send({
                error: 'no query'
            });
            return;
        }

        let time = new Date().getTime();
        let cachePath = 'cache/' + query + '.json';
        if (fs.existsSync(cachePath)) {
            let cache = JSON.parse(fs.readFileSync(cachePath));
            if (cache.createdAt + (config.cacheTimeToLive * 1000) >= time) {
                response.send(cache);
                return;
            }
        }

        axios.request({
            method: 'GET',
            url: 'https://www.google.com/search?q=' + encodeURI(query),
            responseType: 'arraybuffer',
            reponseEncoding: 'binary'
        }).then(googleResponse => {
            let data = googleResponse.data.toString('latin1');
            let root = parse(data);
            let processedData = process(root, data);
            fs.writeFile('cache/' + query + '.json', JSON.stringify(processedData), err => { if (err) console.log(err.stack); });
            response.send(processedData);
        });
    });

}

function process(root, source) {
    let processed = {
        createdAt: new Date().getTime(),
        quickResult: {
            title: '',
            description: '',
            images: []
        },
        results: []
    };

    let containers = root.querySelectorAll('.ZINbbc.xpd.O9g5cc.uUPGi');

    containers.forEach(container => {
        try {
            if (container.querySelector('.Q0HXG') != undefined || container.querySelector('.xpc') != undefined) {
                let title = container.querySelector('.BNeawe.deIvCb.AP7Wnd').firstChild.rawText;
    
                let description = container.querySelectorAll('.BNeawe.s3v9rd.AP7Wnd')[1].firstChild.rawText;
    
                processed.quickResult = {
                    title,
                    description,
                    images: []
                }

                container.querySelectorAll('.BVG0Nb').forEach(element => {
                    let link = element.attrs.href;
                    link = link.slice(15, link.indexOf('&'))
                    link = link.replaceAll('&amp;', '&');
    
                    let thumbnail = "";
                    let thumbnailIndex = source.lastIndexOf(element.querySelector('.WddBJd').attrs.id + '\'');
                    let count = 0;
                    while (count < 3) {
                        if (source.charAt(--thumbnailIndex) == '\'') count++;
                    }
                    while (true) {
                        let char = source.charAt(++thumbnailIndex);
                        if (char == '\'' || char == '\\') break;
                        thumbnail += char;
                    }
    
                    processed.quickResult.images.push({
                        link,
                        thumbnail
                    });
                });
            }
    
            if (container.childNodes.length == 3 && container.querySelector('.x54gtf') != undefined) {
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
        } catch {}
    });

    return processed;
}

module.exports = {
    setup
}