const constants = require('../constants/constants');
const utils = require('../utils/utils');

class StyleDataElement {
    constructor (type, id, el) {
        this.type = type;
        this.belongsToId = StyleDataElement.getBelongsToId(type, el.styles);
        this.name = StyleDataElement.getName(type, id);
        this.value = StyleDataElement.getValue(type, el);
    }

    static getName(type, name) {
        switch(type) {
            case constants.CSS.FONT_SIZE:
                return constants.CSS.VAR_PREFIX + name + '--' + constants.CSS.FONT_SIZE;

            case constants.CSS.FONT_WEIGHT:
                return constants.CSS.VAR_PREFIX + name + '--' + constants.CSS.FONT_WEIGHT;

            default:
                return name && (constants.CSS.VAR_PREFIX + name) || undefined;
        }
    }

    static getBelongsToId(type, styles) {
        switch(type) {
            case constants.CSS.FONT_SIZE:
            case constants.CSS.FONT_WEIGHT:
                return styles.text;

            case constants.CSS.COLOR:
                return styles.fill;

            case constants.CSS.BOX_SHADOW:
                return styles.effect;

            default:
                return undefined;
        }
    }

    static getValue(type, el) {
        switch(type) {
            case constants.CSS.FONT_FAMILY:
                return el.characters;

            case constants.CSS.FONT_SIZE:
                return el.style && el.style.fontSize && el.style.fontSize + 'px';

            case constants.CSS.FONT_WEIGHT:
                return el.style && el.style.fontWeight;

            case constants.CSS.COLOR:
                const rgbColor = el.fills[0].color;
                return utils.rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);

            case constants.CSS.BOX_SHADOW:
                const effects = el.effects[0];
                const offset = effects.offset;
                return utils.getBoxShadow(offset.x, offset.y, effects.radius, effects.color);

            default:
                return undefined;
        }
    }
}

module.exports = StyleDataElement;