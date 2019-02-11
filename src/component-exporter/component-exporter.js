const constants = require('../constants/constants');
const utils = require('../utils/utils');

function addElementToList(el, list, type, groupName = null) {
    if (el.type === constants.FIGMA_ELEMENTS.COMPONENT && el.name) {

        if (list[el.name]) {
            throw new Error(`Duplicated component with the name: ${el.name}`);   // Add error to stack
        }

        list[el.id] = {
            id: el.id,
            type: type,
            name: el.name,
            group: groupName
        };
    }
}

class ComponentExporter {

    constructor (data, cssVariables) {

        this.data = data;
        this.componentsIds = this.getComponentsList(data);
        this.cssVariables = cssVariables;
    }

    getComponentsList(data) {
        const list = {};
        this.levels.forEach(type => {
            data[type].forEach(el => {
                if (el.type === constants.FIGMA_ELEMENTS.GROUP && Array.isArray(el.children)) {
                    el.children.forEach(childEl => {
                        addElementToList(childEl, list, type, el.name);
                    });
                } else {
                    addElementToList(el, list, type);
                }
            });
        });
        return list;
    }

    get levels() {
        return Object.keys(this.data);
    }

    getComponent(level, componentName, groupName) {
        const data = this.getGroupData(level, groupName);
        const id = utils.getIdByName(componentName, this.componentsIds);
        const instances = data.filter(el => el.type === constants.FIGMA_ELEMENTS.INSTANCE && el.componentId === id);
        const component = data.find(el => el.id === id);

        if (!component) {
            throw new Error(`There is no data for '${componentName}' component.`);  // Add error to stack
        }

        if (component.visible === false) {
            return;
        }

        const instancesData = {};
        instancesData[componentName] = this.collectInstanceData(component, {}, this.cssVariables);

        if (instances.length) {
            instances.forEach(i => {
                instancesData[i.name] = this.collectInstanceData(i, {}, this.cssVariables);
            });
        }

        return {
            level: level,
            name: componentName,
            dependencies: this.getComponentDependencies(component),
            instances: instancesData
        };
    }

    getAllComponents() {
        return Object.keys(this.componentsIds).map(id => {
            const el = this.componentsIds[id];
            return el.type && this.getComponent(el.type, el.name, el.group);
        });
    }

    getComponentsAsCSS(data) {
        const results = [];
        data = data || this.getAllComponents();

        data.forEach(component => {
            const componentStyle = {
                level: component.level,
                name: component.name,
                dependencies: JSON.parse(JSON.stringify(component.dependencies)),
                data: ComponentExporter.collectStyles(component.instances)
            };

            results.push(componentStyle);
        });

        return results;
    }

    static collectStyles(items = {}, result = {}) {

        const ignoredKeys = ['type', 'name', 'id'];

        const addProperties = (item, result, name, suffix = '') => {
            (item.visible !== false) && Object.keys(item).forEach(key => {
                if (key === 'children') {
                    result = extractChildren(item.children, name + suffix, result);
                } else {
                    if (!ignoredKeys.includes(key)) {
                        let subName = utils.spacesToHyphens(name + suffix + key);
                        result[subName] = item[key];
                    }
                }
            })
            return result;
        };

        const extractChildren = (children, name, result) => {
            if (Array.isArray(children)) {
                const extractedNames = [];
                children.forEach(item => {
                    let subName = name + (item.type || item.name);
                    if (extractedNames.includes(subName)) {
                        subName = subName + utils.spacesToHyphens(item.name);
                        if (extractedNames.includes(subName)) {
                            console.log('Avoid using same names on the same level!');  // Add error to stack
                            subName = subName + utils.figmaIdTOSafeString(item.id);
                        }
                    }
                    extractedNames.push(subName)
                    result = addProperties(item, result, subName, constants.COMPONENT_SPLIT_SYMBOL);
                });
            }
            return result;
        }

        Object.keys(items).forEach(name => {
            const item = items[name];
            result = addProperties(item, result, name, constants.COMPONENT_SPLIT_SYMBOL);
        });

        return result;
    }

    getGroupData(level, groupName) {
        if (!this.levels.includes(level)) {
            throw new Error(`No level '${level}' exists for components data.`);   // Add error to stack
        }

        if (groupName != null) {
            const group = this.data[level].find(el => el.name === groupName && el.type === constants.FIGMA_ELEMENTS.GROUP);

            if (group && Array.isArray(group.children)) {
                return group.children;
            }
        }

        return this.data[level];
    }

    getComponentDependencies(component, results = [], addedIds = []) {
        component && Array.isArray(component.children) && component.children.forEach(item => {
            if (item.type === constants.FIGMA_ELEMENTS.INSTANCE && item.componentId) {
                const dependency = this.componentsIds[item.componentId];
                if (dependency && !addedIds.includes(item.componentId)) {
                    addedIds.push(item.componentId);
                    results.push({
                        id: dependency.id,
                        level: dependency.type,
                        name: dependency.name
                    });
                }
            } else {
                if (item.children) {
                    return this.getComponentDependencies(item, results, addedIds);
                } else if (constants.FIGMA_PRIMITIVES.includes(item.type) && !results.find(r => r.name === item.type)) {
                    results.push({
                        id: item.id,
                        level: constants.LEVELS.PRIMITIVES,
                        name: item.type
                    });
                }
            }
        });

        return results;
    }


    static alignToFlexJustifyHorizontal(align) {
        switch(align) {
            case 'CENTER':
                return 'center';
            case 'RIGHT':
                return 'flex-end';
            case 'LEFT':
                return 'flex-start';
            default:
                return 'space-between';
        }
    }

    static alignToFlexJustifyVertical(align) {
        switch(align) {
            case 'CENTER':
                return 'center';
            case 'BOTTOM':
                return 'flex-end';
            case 'TOP':
                return 'flex-start';
            default:
                return 'space-between';
        }
    }

    static getAlign(items, direction) {  // Workaround. Hopefully, Figma improves this in future.
        const firstAlign = items && items[0] && items[0].children && items[0].children[0].constraints[direction];
        const elementsWithSameAlign = items.filter(item => item.children && item.children[0].constraints[direction] === firstAlign);

        if (elementsWithSameAlign.length == items.length) {
            return firstAlign;
        } else {
            return 'MIXED';
        }
    }

    processRow(children, data) {
        const cells = children.filter(el => this.notEmptyCell(el));
        const isMulticell = cells.length > 1;
        const align = ComponentExporter.getAlign(cells, 'horizontal');
        const scale = (align === 'SCALE');

        data['justify-content'] = ComponentExporter.alignToFlexJustifyHorizontal(align);

        if (!isMulticell && scale) {
            data['cell-flex-grow'] = 1;
        } else {
            data['cell-flex-grow'] = 'unset';
        }

        return data;
    }

    processCol(children, data) {
        const cells = children.filter(el => this.notEmptyCell(el));
        const align = ComponentExporter.getAlign(cells, 'vertical');
        data['justify-content'] = ComponentExporter.alignToFlexJustifyVertical(align);

        return data;
    }

    notEmptyRow(component) {
        return component.type === constants.FIGMA_ELEMENTS.GROUP && component.name === constants.FIGMA_INSTRUCTING_NAMES.ROW && component.children && component.children.length;
    }

    notEmptyCol(component) {
        return component.type === constants.FIGMA_ELEMENTS.GROUP && component.name === constants.FIGMA_INSTRUCTING_NAMES.COL && component.children && component.children.length;
    }

    notEmptyCell(component) {
        return component.type === constants.FIGMA_ELEMENTS.GROUP && component.name === constants.FIGMA_INSTRUCTING_NAMES.CELL && component.children && component.children.length;
    }

    collectInstanceData(component, data, cssVariables) {
        let updatedData = data;

        updatedData.id = component.id;

        if (component.visible !== false) {
            if (component.absoluteBoundingBox) {
                updatedData['height'] = component.absoluteBoundingBox.height;
                updatedData['width'] = component.absoluteBoundingBox.width;
            }

            if (component.constraints.horizontal === 'SCALE') {
                updatedData['width'] = '100%';
            }

            if (component.constraints.vertical === 'SCALE') {
                updatedData['height'] = '100%';
            }

            if (this.notEmptyRow(component)) {
                updatedData = this.processRow(component.children, updatedData);
            }

            if (this.notEmptyCol(component)) {
                updatedData = this.processCol(component.children, updatedData);
            }

            if (component.name === 'simple-icon') { // Too hardcoded, should be refactored.
                updatedData['name'] = utils.getIconName(component);
            }

            if (component && Array.isArray(component.children)) {

                updatedData.children = [];

                component.children.forEach(item => {
                    const childData = {
                        id: item.id,
                        type: this.getItemType(item),
                        name: item.name
                    };
                    const styles = item.styles;
                    let borderColor;

                    if (item.visible === false) {
                        childData.visible = false;
                    }

                    if (item.absoluteBoundingBox) {
                        childData['height'] = item.absoluteBoundingBox.height;
                        childData['width'] = item.absoluteBoundingBox.width;
                    }

                    if (item.type === constants.FIGMA_ELEMENTS.TEXT) {
                        childData['textValue'] = item.characters;
                    }

                    styles && Object.keys(styles).forEach(key => {
                        cssVariables.forEach(el => {
                            if (el.visible !== false && el.belongsToId === styles[key]) {
                                if (key === 'stroke') {
                                    borderColor = el.name;
                                } else {
                                    const type = ((item.type !== constants.FIGMA_ELEMENTS.TEXT && el.type === 'color') ? 'background-color' : el.type);
                                    childData[type] = el.name;
                                }
                            }
                        })
                    })

                    if (!isNaN(item.cornerRadius)) {
                        childData['border-radius'] = item.cornerRadius;
                    }

                    if (item.strokeWeight && borderColor) {
                        if (item.strokes && item.strokes[0]) {
                            childData['border'] = `${item.strokeWeight}px solid var(${borderColor})`; // only solid, only non-transparent
                        }
                    }

                    if (item.children) {
                        updatedData.children.push(this.collectInstanceData(item, childData, cssVariables));
                    } else {
                        updatedData.children.push(childData);
                    }
                });
            }
        }



        return updatedData;
    }

    getItemType(item) {
        return item.componentId && this.componentsIds[item.componentId] && this.componentsIds[item.componentId].name || item.type;
    }


}

module.exports = ComponentExporter;