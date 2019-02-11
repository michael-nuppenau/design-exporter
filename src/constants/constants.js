const constants = module.exports = {};

constants.FIGMA_ELEMENTS = {
    FRAME: 'FRAME',
    GROUP: 'GROUP',
    TEXT: 'TEXT',
    ELLIPS: 'ELLIPS',
    RECTANGLE: 'RECTANGLE',
    COMPONENT: 'COMPONENT',
    INSTANCE: 'INSTANCE'
};

constants.FIGMA_INSTRUCTING_NAMES = {
    ROW: 'EXPORTER-ROW',
    COL: 'EXPORTER-COL',
    CELL: 'EXPORTER-CELL'
};

constants.FIGMA_GROUPPING_ELEMENTS = [
    constants.FIGMA_ELEMENTS.FRAME,
    constants.FIGMA_ELEMENTS.GROUP
];

constants.FIGMA_BLOCK_ELEMENTS = [
    constants.FIGMA_ELEMENTS.ELLIPS,
    constants.FIGMA_ELEMENTS.RECTANGLE,
    constants.FIGMA_ELEMENTS.COMPONENT,
    constants.FIGMA_ELEMENTS.INSTANCE
];

constants.FIGMA_PRIMITIVES = [
    constants.FIGMA_ELEMENTS.ELLIPS,
    constants.FIGMA_ELEMENTS.RECTANGLE,
    constants.FIGMA_ELEMENTS.TEXT
];

constants.LEVELS = {
    PRIMITIVES: 'PRIMITIVES',
    BASIC_STYLES: 'BASIC STYLES',
    ATOMS: 'ATOMS',
    MOLECULES: 'MOLECULES',
    CELLS: 'CELLS',
    TEMPLATES: 'TEMPLATES'
};

constants.CSS = {
    VAR_PREFIX: '--',
    FONT_FAMILY: 'font-family',
    FONT_SIZE: 'font-size',
    FONT_WEIGHT: 'font-weight',
    COLOR: 'color',
    BOX_SHADOW: 'box-shadow',
};

constants.COMPONENT_SPLIT_SYMBOL = '__';
constants.SPACE_INDENTION = '    ';

constants.FILES = {
    TEMPLATE_EXTENSION: 'tmpl',
    OUTPUT_EXTENSION: 'js',
    PRIMITIVES_FOLDER: '_primitives',
    DEFAULT_TEMPLATE: 'default.tmpl',
    CSS_GLOBALS: 'style-globals.css'
};

constants.PRIMITIVES_TEMPLATES = {
    RECTANGLE: 'rectangle',
    ELLIPSE: 'ellipse',
    TEXT: 'text-block',
}

constants.TEMPLATES = {
    EXPORTER_DEPENDENCIES: '<!-- EXPORTER_DEPENDENCIES -->',
    EXPORTER_COMPONENT_NAME: '<!-- EXPORTER_COMPONENT_NAME -->',
    EXPORTER_COMPONENT_CLASS_NAME: '<!-- EXPORTER_COMPONENT_CLASS_NAME -->',
    //DEPENDENCY_IMPORT_TEMPLATE: (type, name) => `<link rel="import" href="../${type}/${name}.html">`
    DEPENDENCY_IMPORT_TEMPLATE: (type, name) => `import '../${type}/${name}.js';`
};

