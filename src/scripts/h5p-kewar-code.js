import Util from "../scripts/h5p-kewar-code-util";
import qrcode from "../scripts/h5p-kewar-code-qrcode";

export default class KewArCode extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   */
  constructor(params) {
    super();

    this.params = Util.extend(
      {
        codeType: 'url',
        location: {
          latitude: '69.646007',
          longitude: '18.954036'
        },
        phone: '+123456789',
        sms: {
          number: '+123456789',
          message: 'Please fetch milk and bread!'
        },
        text: 'Please fetch\n* milk\n* bread',
        url: 'https://h5p.org',
        behaviour: {
          codeColor: '#000000',
          backgroundColor: '#ffffff',
          alignment: 'center'
        }
      },
      params
    );

    /**
     * Attach library to wrapper.
     *
     * @param {jQuery} $wrapper Content's container.
     */
    this.attach = function ($wrapper) {

      // Create codeObject
      const code = qrcode(4, 'L');

      let payload = 'Something went wrong';
      if (this.params.codeType === 'location') {
        payload = `geo:${this.params.location.latitude},${this.params.location.longitude}`;
      }
      else if (this.params.codeType === 'phone') {
        payload = `tel:${this.params.phone}`;
      }
      else if (this.params.codeType === 'sms') {
        const number = this.params.sms.number.replace(/[^+0-9]/gi, '');
        payload = `smsto:${number}:${this.params.sms.message}`;
      }
      else if (this.params.codeType === 'text') {
        payload = this.params.text;
      }
      else if (this.params.codeType === 'url') {
        payload = this.params.url;
      }
      code.addData(payload);

      code.make();

      // Create DOM element
      const qrcodeContainer = document.createElement('div');
      qrcodeContainer.classList.add('h5p-kewar-code-container');
      qrcodeContainer.innerHTML = code.createSvgTag();
      qrcodeContainer.style.textAlign = this.params.behaviour.alignment;

      const codeSVG = qrcodeContainer.querySelector('svg');
      codeSVG.removeAttribute('width');
      codeSVG.removeAttribute('height');

      if (this.params.behaviour.maxSize) {
        codeSVG.style.maxWidth = this.params.behaviour.maxSize;
        codeSVG.style.maxHeight = this.params.behaviour.maxSize;
      }

      const codePath = qrcodeContainer.querySelector('path');
      codePath.setAttribute('fill', this.params.behaviour.codeColor);

      const codeRect = qrcodeContainer.querySelector('rect');
      codeRect.setAttribute('fill', this.params.behaviour.backgroundColor);

      $wrapper.get(0).classList.add('h5p-kewar-code');
      $wrapper.get(0).appendChild(qrcodeContainer);
    };
  }
}
