const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: inline-block;
            overflow: hidden;
            height: 100%;
        }

        .wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
            height: 100%;
        }
    </style>
    <div class="wrapper">
        <slot></slot>
    </div>
`;

class TextBlock extends HTMLElement {

    static get is() {
        return 'text-block';
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

customElements.define(TextBlock.is, TextBlock);