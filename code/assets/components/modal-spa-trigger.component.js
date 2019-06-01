import BaseComponent from 'Foundation/Boilerplate/UI/base-component';
import modalSpa from '../../../general/js/modal-spa';

let shouldWritingInitPage = true;

export default class ModalSpaTrigger extends BaseComponent {
    constructor(...args) {
        super(...args);

        this.url = this.element.getAttribute('href') || this.getAttribute(this.element, 'href');
        this.initPage = window.location.pathname;

        this.init();
    }

    init() {
        this.addListener(this.element, 'click', this.onClickElement);
    }

    onClickElement = (event) => {
        event.preventDefault();

        if (!document.body.classList.contains('is-editing')) {
            modalSpa.open({
                type: 'article',
                url: this.url,
                initPage: this.initPage,
                shouldWritingInitPage
            });

            shouldWritingInitPage = false;
        }
    }
}
