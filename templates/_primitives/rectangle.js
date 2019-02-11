const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: inline-block;
            height: 100%;
            width: 100%;
        }
    </style>
    <slot></slot>
`;

class Rectangle extends HTMLElement {

    static get is() {
        return 'atom-rectangle';
    }

    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        }
    }

}

customElements.define(Rectangle.is, Rectangle);