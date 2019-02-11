const express = require('express');
const fse =  require('fs-extra');
const main = require('./src/main');
const utils = require('./src/utils/utils');
const app = express();
const API_url = ''; // Link to Figma file
const API_token = ''; // Figma token


async function loadFromFigma() {
    return utils.getData({
        url: API_url,
        headers: {
            'X-Figma-Token': API_token
        }
    });
}

function loadFromFile(filename = 'testdata.json') {
    return JSON.parse(fse.readFileSync(filename));
}


app.get('/', async (_req, res) => {
    let showAllData;
    try {
        const result = await loadFromFigma();
        //    const result = await loadFromFigma(); showAllData = true;
        //    const result = loadFromFile();

        res.send(main.init(result, showAllData));
    } catch(e) {
        console.log(e);
        res.send(e);
    }
});



app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

