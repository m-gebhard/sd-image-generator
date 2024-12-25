export default (b64Image) =>
    (document.querySelector('#app').style.backgroundImage = `url(${b64Image})`);
