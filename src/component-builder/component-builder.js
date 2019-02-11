const fse =  require('fs-extra');
const constants = require('../constants/constants');
const utils = require('../utils/utils');

class ComponentBuilder {

    constructor(templateDir, buildDir, levels, data, componentsBuildData) {

        this.templateDir = templateDir;
        this.buildDir = buildDir;
        this.levels = levels.slice();
        this.data = data;
        this.componentsBuildData = componentsBuildData;

    }

    getAvailableTemplates() {
        const templates = {};
        for (const level of this.levels) {
            const path = this.templateDir + '/' + level + '/';
            templates[level] = [];

            if (fse.existsSync(path)) {
                fse.readdirSync(path).forEach(file => {
                    const templateName = file.split('.' + constants.FILES.TEMPLATE_EXTENSION);

                    if (templateName[1] === '') {
                        templates[level].push(templateName[0]);
                    }
               })
            }
        }
        return templates;
    }

    async movePrimitives() {
        const path = this.templateDir + '/' + constants.FILES.PRIMITIVES_FOLDER + '/';
        const primitiveDestDir = this.buildDir + '/' + constants.FILES.PRIMITIVES_FOLDER;

        if (fse.existsSync(path) && fse.existsSync(this.buildDir)) {
            await fse.emptyDir(primitiveDestDir);
            fse.copySync(path, primitiveDestDir);
        }
    }

    async buildComponents(_withTemplatesOnly) {
        const templates = this.getAvailableTemplates();
        const pathToDefaultTemplate = this.templateDir + '/' + constants.FILES.DEFAULT_TEMPLATE;
        const deafaultTemplateAvailable = !_withTemplatesOnly && fse.existsSync(pathToDefaultTemplate);

        await fse.emptyDir(this.buildDir);
        this.movePrimitives();

        this.data.forEach(el => {
            if (templates[el.level] && templates[el.level].includes(el.name)) {
                this.buildFromTemplate(el);
            } else {
                if (deafaultTemplateAvailable) {
                    this.buildFromTemplate(el, pathToDefaultTemplate);
                }
            }
        });
    }

    createGlobalStylesFile(data) {
        const output = ':root {\n' + (Array.isArray(data) && data.map(item => `${constants.SPACE_INDENTION}${item.name || item.type}: ${item.value};`).join('\n') || '') + '\n}';
        const path = this.buildDir + '/' + constants.FILES.CSS_GLOBALS;
        fse.remove(path, () => {
            setTimeout(()=> {
                fse.writeFileSync(path, output, 'utf8');
            }, 100);
        });
    }

    static getFolderByLevel(level) {
        return level === constants.LEVELS.PRIMITIVES ? constants.FILES.PRIMITIVES_FOLDER : level;
    }

    static getName(el) {
        return el.level === constants.LEVELS.PRIMITIVES ? constants.PRIMITIVES_TEMPLATES[el.name] : el.name;
    }

    static getHTMLTag(el) {
        switch(el.type) {
            case constants.FIGMA_ELEMENTS.TEXT:
                return el.children ? 'span' : 'slot1';
            default:
             return '';
        }
    }

    buildHTML(defaultContent, data) {
        let result = '';

        if (this.componentsBuildData) {
            const component = this.componentsBuildData.find(el => el.name === data.name);
            let mainInstance;

            if (component && component.instances) {
                mainInstance = component.instances[0];
            }
            console.log(mainInstance)
            mainInstance && mainInstance.children.forEach(el => {
                const tagName = ComponentBuilder.getHTMLTag(el);
                result += '<' + tagName + '>\n';
                console.log(el.name)
                result += '</' + tagName + '>\n';
            });
        }

        return result || defaultContent;
    }

    async buildFromTemplate(el, templatePath) {
        templatePath = templatePath || this.templateDir + '/' + ComponentBuilder.getFolderByLevel(el.level) + '/' + ComponentBuilder.getName(el) + '.tmpl';
        const path = this.buildDir + '/' + el.level + '/';

        const componentTemplate = fse.readFileSync(templatePath).toString()
        .replace(/<style>([\s\S]*)<\/style>/gi, (a) => a.replace(/[$]{([^}]+)}/g, (_a, name) => {return el.data[name] || 'unset'}))
        .replace(new RegExp(`${constants.TEMPLATES.EXPORTER_COMPONENT_NAME}`, 'g'), el.name)
        .replace(new RegExp(`${constants.TEMPLATES.EXPORTER_DEPENDENCIES}`, 'g'), () => ComponentBuilder.getDependenciesText(el.dependencies))
    //    .replace(/<!-- EXPORTER_TEMPLATE([\s\S]*)END_EXPORTER_TEMPLATE -->/gi, (_a, content) => this.buildHTML(content, el))
        .replace(new RegExp(`${constants.TEMPLATES.EXPORTER_COMPONENT_CLASS_NAME}`, 'g'), () => utils.hyphensToCamelCase(el.name, true));

        if (!fse.existsSync(path)) {
            await fse.emptyDir(path);
        }

        fse.writeFileSync(path + el.name + '.' + constants.FILES.OUTPUT_EXTENSION, componentTemplate, 'utf8');
    }

    static getDependenciesText(data) {
        return data.map(item => {
            return constants.TEMPLATES.DEPENDENCY_IMPORT_TEMPLATE(ComponentBuilder.getFolderByLevel(item.level), ComponentBuilder.getName(item));
        }).join('\n');
    }

}

module.exports = ComponentBuilder;