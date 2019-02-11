const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: inline-block;
            border-radius: var(--atom-ellipse_border-radius, 50%);
        }
    </style>
    <slot></slot>
`;

class Ellipse extends HTMLElement {

    static get is() {
        return 'atom-ellipse';
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

customElements.define(Ellipse.is, Ellipse);