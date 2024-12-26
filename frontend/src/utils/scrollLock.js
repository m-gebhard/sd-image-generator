const body = document.querySelector('body');
let scrollPosition = 0;

export default {
    lock() {
        scrollPosition = window.pageYOffset;
        body.style.position = 'fixed';
        body.style.top = `-${scrollPosition}px`;
        body.style.width = '100%';
    },
    unlock() {
        body.style.removeProperty('position');
        body.style.removeProperty('top');
        body.style.removeProperty('width');

        window.scrollTo(0, scrollPosition);
    },
};
