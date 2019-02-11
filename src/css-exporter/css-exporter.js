const constants = require('../constants/constants');
const StyleDataElement = require('./style-data-element');

class CSSExporter {

    static get GROUP_NAMES() {
        return {
            CHARACTER_STYLES: 'CHARACTER STYLES',
            COLORS: 'COLORS',
            SHADOWS: 'SHADOWS',
            FONT_FAMILY: 'FONT FAMILY'
        }
    }

    constructor (stylesIds, stylesData) {

        this.stylesIds = stylesIds;

        const getCorrectGroup = (groupName) => stylesData.find(el => el.name === groupName && el.type === constants.FIGMA_ELEMENTS.GROUP);

        const charactersData = getCorrectGroup(CSSExporter.GROUP_NAMES.CHARACTER_STYLES);
        const colorsData = getCorrectGroup(CSSExporter.GROUP_NAMES.COLORS);
        const shadowsData = getCorrectGroup(CSSExporter.GROUP_NAMES.SHADOWS);
        const fontFamilyData = getCorrectGroup(CSSExporter.GROUP_NAMES.FONT_FAMILY).children.find(el => el.name === constants.CSS.FONT_FAMILY);

        this.getCSSGlobals = () => {
            return [new StyleDataElement(constants.CSS.FONT_FAMILY, null, fontFamilyData)]
            .concat(this.extractData(shadowsData, constants.CSS.BOX_SHADOW))
            .concat(this.extractData(colorsData, constants.CSS.COLOR))
            .concat(this.extractData(charactersData, constants.CSS.FONT_SIZE))
            .concat(this.extractData(charactersData, constants.CSS.FONT_WEIGHT));
        };
    }

    extractData(data, elCSSType) {
        let results;
        if (data && Array.isArray(data.children)) {
            results = data.children
                .filter(el => el.styles && el.type === CSSExporter.typeFromName(elCSSType))
                .map(el => new StyleDataElement(elCSSType, this.getStyleId(data.name, el), el));
        } else {
            throw(new Error('no data for ' + data && data.name));
        }

        return results;
    }

    getStyleId(name, el) {
        switch(name) {
            case CSSExporter.GROUP_NAMES.CHARACTER_STYLES:
                return this.stylesIds[el.styles.text].name;
            case CSSExporter.GROUP_NAMES.SHADOWS:
                return this.stylesIds[el.styles.effect].name;
            case CSSExporter.GROUP_NAMES.COLORS:
                return this.stylesIds[el.styles.fill].name;
        }
    }

    static typeFromName(name) {
        switch(name) {
            case constants.CSS.BOX_SHADOW:
            case constants.CSS.COLOR:
                return constants.FIGMA_ELEMENTS.RECTANGLE;
            case constants.CSS.FONT_SIZE:
            case constants.CSS.FONT_WEIGHT:
                return constants.FIGMA_ELEMENTS.TEXT;
        }
    }

}

module.exports = CSSExporter;