import Modal from './modal';
import api, { isHtmlContentType } from './api';
import pageSpinner from './page-spinner';

const MODAL_SPA_ID = 'modalSpa';
const MODAL_SPA_TYPE_ARTICLE = 'article';

class ModalSpa {
    constructor() {
        this.options = null;
        this.isOpenning = false;
        this.initPage = '';
        this.defaultOptions = {
            type: '',
            url: '',
            initPage: ''
        };
        this.modalCache = {};
        this.currentModal = null;
        this.shouldOpenPopup = false;
        this.initState = window.history.state;

        this.init();
    }

    init() {
        window.addEventListener('popstate', this.onPopstate);
    }

    onPopstate = (event) => {
        modalSpa.changePage(event);
    }

    open(options) {
        this.options = { ...this.defaultOptions, ...options };
        this.shouldOpenPopup = true;

        const url = this.generateAsyncUrl(this.options.url, this.options.type);

        if (this.options.shouldWritingInitPage) {
            this.initPage = this.options.initPage;
        }

        this.openModal(url);
        this.setHistoryState(this.options.url, this.initPage);
    }

    generateAsyncUrl(url, type) {
        if (type === MODAL_SPA_TYPE_ARTICLE) {
            url += '?overlay=true';
            return url;
        }
        return '';
    }

    openModal(url) {
        if (!this.isOpenning) {
            this.isOpenning = true;
            this.getModal(url).then((modal) => {
                try {
                    modal.open();
                    this.isOpenning = false;
                    this.currentModal = modal;
                } catch (error) {
                    throw new Error('Can not open modal.');
                }
            }).catch(() => {
                this.isOpenning = false;
            });
        }
    }

    getModal(url) {
        if (this.modalCache[url]) {
            return Promise.resolve(this.modalCache[url]);
        }

        return this.getData(url).then((target) => {
            try {
                this.modalCache[url] = new Modal(target, { mobileFixed: true, article: true });

                return this.modalCache[url];
            } catch (error) {
                return Promise.reject(error);
            }
        });
    }

    getData(url) {
        if (!url) return Promise.reject();

        pageSpinner.show();

        return api.get(url).then((response) => {
            if (isHtmlContentType(response)) {
                return Promise.resolve(response.data);
            }
            return Promise.reject(new Error('Unknown result from async data'));
        }).then((result) => {
            pageSpinner.hide();
            return result;
        }, (error) => {
            pageSpinner.hide();
            return Promise.reject(error);
        });
    }

    setHistoryState(url) {
        window.history.pushState({
            id: MODAL_SPA_ID,
            url,
            initPage: this.initPage,
            type: MODAL_SPA_TYPE_ARTICLE,
        }, null, url);
    }

    changePage(event) {
        const currentState = window.history.state;

        if (this.shouldOpenPopup) {
            if (currentState === null) {
                if (this.currentModal) {
                    this.currentModal.close();
                }
            } else {
                this.openModal(this.generateAsyncUrl(event.state.url, MODAL_SPA_TYPE_ARTICLE));
            }
        } else if (this.initState &&
            this.initState.id === MODAL_SPA_ID
        ) {
            window.location.reload();
        } else if (currentState &&
            currentState.id === MODAL_SPA_ID
        ) {
            window.location.reload();
        }
    }
}

const modalSpa = new ModalSpa();

export default modalSpa;
