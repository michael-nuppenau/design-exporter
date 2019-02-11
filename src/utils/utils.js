const request = require('request');

const utils = module.exports = {};

utils.rgbToHex = (r, g, b) => '#' + ((1 << 24) + (r*255 << 16) + (g*255 << 8) + b*255).toString(16).slice(1);

utils.getData = (options) => {
    return new Promise((resolve) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            else {
                throw new Error(error);
            }
        });
    });
};

utils.getBoxShadow = (x, y, radius, colorRGBA) => `${x}px ${y}px ${radius}px rgba(${colorRGBA.r*255}, ${colorRGBA.g*255}, ${colorRGBA.b*255}, ${Math.round(colorRGBA.a * 10)/10})`;

utils.getIdByName = (name, ids) => {
    for (let id of Object.keys(ids)) {
        const el = ids[id];
        if (el && el.name === name) {
            return id;
        }
    }
};

utils.addMissingProperties = (o1, o2, prefix = '') => Object.keys(o1).reduce((acc, k) => {
    const prop1 = o1[k];
    const prop2 = o2[k] || o2[prefix + k];
    acc[prefix + k] = prop2 == null ? prop1 : prop2;
    return acc;
}, {});

utils.getIconName = el => (Array.isArray(el.children) && el.children.find(item => item.visible !== false) || {}).name;

utils.hyphensToCamelCase = (text, _capitalize) => {
    let result = text.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/\s/g, '');

    if (_capitalize) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
};

utils.spacesToHyphens = (text) => text.replace(/\s/g, '-');


utils.figmaIdTOSafeString = text => text.replace(/[;:]/g, (a) =>{
    switch(a) {
        case ';':
            return '-';
        case ':':
            return '_';
        default:
            return a;
    }
});

