const constants = require('./constants/constants');
const CSSExporter = require('./css-exporter/css-exporter');
const ComponentExporter = require('./component-exporter/component-exporter');
const ComponentBuilder = require('./component-builder/component-builder');

const buildDir = './testapp/build';
const templateDir = './templates';

const main = module.exports = {};

main.init = (data, showAllData) => {
    return templater(data, showAllData);
}

function templater(data, showAllData) {
    const stylesIds = data.styles;
    const stylesData = data.document.children[0].children.find(el => el.name === constants.LEVELS.BASIC_STYLES).children;

    const componentsData = {
        atoms: data.document.children[0].children.find(el => el.name === constants.LEVELS.ATOMS).children,
        molecules: data.document.children[0].children.find(el => el.name === constants.LEVELS.MOLECULES).children,
        cells: data.document.children[0].children.find(el => el.name === constants.LEVELS.CELLS).children,
    }

    const cssExporter = new CSSExporter(stylesIds, stylesData);
    const cssVariables = cssExporter.getCSSGlobals();

    const componentExporter = new ComponentExporter(componentsData, cssVariables);
    const componentsBuildData = componentExporter.getAllComponents();
    const componentsStylesData = componentExporter.getComponentsAsCSS(componentsBuildData);

    const componentBuilder = new ComponentBuilder(templateDir, buildDir, componentExporter.levels, componentsStylesData, componentsBuildData);
    componentBuilder.buildComponents();
    componentBuilder.createGlobalStylesFile(cssVariables);

    let allData;
    if (showAllData) {
        allData = JSON.stringify(data, null, 4);
    }

    const template = `
        <html>
            <style>
                textarea {
                    height: 200px;
                    width: 100%;
                }
            </style>
            <body>
                <h1>CSS variables</h1>
                <textarea>${JSON.stringify(cssVariables, null, 4)}</textarea>
                <h1>Components params as JSON</h1>
                <textarea>${JSON.stringify(componentsBuildData, null, 4)}</textarea>
                <h1>Components styles</h1>
                <textarea>${JSON.stringify(componentsStylesData, null, 4)}</textarea>
                <section style="${!allData && 'display: none;'}">
                    <h1>All data</h1>
                    <textarea>${allData}</textarea>
                </section>
            </body>
        </html>
    `;

    return template;
}

