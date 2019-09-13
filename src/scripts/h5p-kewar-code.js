import Overlay from './h5p-kewar-code-overlay';
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
        contact: {
          name: 'Unknown',
          title: '',
          organization: '',
          url: '',
          number: '',
          email: '',
          address: {
            extended: '',
            street: '',
            locality: '',
            region: '',
            zip: '',
            country: ''
          },
          note: ''
        },
        event: {
          title: 'Unnamed event',
          allDay: false,
          dateStart: '1970/1/1',
          timeStart: '00:00',
          dateEnd: '1970/1/1',
          timeEnd: '01:00',
          timezone: '0:00',
          daylightSavings: false
        },
        email: 'add_your@email.here',
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
      const code = qrcode(KewArCode.typeNumber, KewArCode.errorCorrection);

      let payload = 'Something went wrong';
      let display = document.createElement('div').innerHTML = payload;

      if (this.params.codeType === 'contact') {
        const contact = this.buildContact(this.params.contact);
        payload = contact.payload;
        display = contact.display;
      }
      else if (this.params.codeType === 'event') {
        const contact = this.buildEvent(this.params.event);
        payload = contact.payload;
        display = contact.display;
      }
      else if (this.params.codeType === 'email') {
        payload = `mailto:${this.params.email}`;
        display = this.buildDisplay('Email', `<a href="mailto:${this.params.email}">${this.params.email}</a>`);
      }
      else if (this.params.codeType === 'location') {
        payload = `geo:${this.params.location.latitude},${this.params.location.longitude}`;
        display = this.buildDisplay('Location', [
          {name: 'latitude', content: this.params.location.latitude},
          {name: 'longitude', content: this.params.location.longitude}
        ]);
      }
      else if (this.params.codeType === 'phone') {
        payload = `tel:${this.params.phone}`;
        display = this.buildDisplay('Phone number', this.params.phone);
      }
      else if (this.params.codeType === 'sms') {
        const number = this.params.sms.number.replace(/[^+0-9]/gi, '');
        payload = `smsto:${number}:${this.params.sms.message}`;
        display = this.buildDisplay('SMS', [
          {name: 'Phone number', content: number},
          {name: 'Message', content: this.params.sms.message}
        ]);
      }
      else if (this.params.codeType === 'text') {
        payload = this.params.text;
        display = this.buildDisplay('Text', this.params.text.replace(/\n/g, '<br />'));
      }
      else if (this.params.codeType === 'url') {
        payload = this.params.url;
        display = this.buildDisplay('URL', `<a href="${this.params.url}" target="blank">${this.params.url}</a>`);
      }

      code.addData(payload);
      code.make();

      this.overlay = new Overlay(display);

      // Create DOM element
      const qrcodeContainer = document.createElement('div');
      qrcodeContainer.classList.add('h5p-kewar-code-container');
      qrcodeContainer.innerHTML = code.createSvgTag();
      qrcodeContainer.style.textAlign = this.params.behaviour.alignment;
      qrcodeContainer.addEventListener('click', () => {
        this.overlay.show();
      });

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
      $wrapper.get(0).appendChild(this.overlay.getDOM());
    };

    /**
     * Build contact.
     * @param {object} contact Contact object.
     * @param {string} contact.name Name.
     * @param {string} [contact.organization] Organization.
     * @param {string} [contact.title] Title.
     * @param {string} [contact.number] Phone number.
     * @param {string} [contact.email] Email address.
     * @param {string} [contact.url] URL.
     * @param {object} [contact.address] Address.
     * @param {object} [contact.address.extended] Address extended info.
     * @param {object} [contact.address.street] Address street.
     * @param {object} [contact.address.locality] Address locality.
     * @param {object} [contact.address.region] Address region.
     * @param {object} [contact.address.zip] Address zip.
     * @param {object} [contact.address.country] Address country.
     * @param {string} [contact.note] Note.
     * @return {object} Payload and display.
     */
    this.buildContact = function (contact) {
      const address = contact.address;

      // Payload
      let payload = `BEGIN:VCARD\n`;
      payload += `VERSION:3.0\n`;
      payload += `N:${params.name}\n`;
      payload += (contact.organization !== '') ? `ORG:${contact.organization}\n` : '';
      payload += (contact.title !== '') ? `TITLE:${contact.title}\n` : '';
      payload += (contact.number !== '') ? `TEL:${contact.number}\n` : '';
      payload += (contact.email !== '') ? `EMAIL:${contact.email}\n` : '';
      payload += (contact.url !== '') ? `URL:${contact.url}\n` : '';
      payload += (
        address.extended !== '' ||
        address.street !== '' ||
        address.locality !== '' ||
        address.region ||
        address.zip !== '' ||
        address.country !== ''
      ) ? `ADR:;${address.extended};${address.street};${address.locality};${address.region};${address.zip};${address.country}\n` : '';
      payload += (this.params.contact.note !== '') ? `NOTE:${this.params.contact.note}\n` : '';
      payload += `END:VCARD`;

      // Display
      const displayContent = [
        {name: 'Name', content: contact.name}
      ];
      if (contact.organization !== '') {
        displayContent.push({name: 'Organization', content: contact.organization});
      }
      if (contact.title !== '') {
        displayContent.push({name: 'Title', content: contact.title});
      }
      if (contact.number !== '') {
        displayContent.push({name: 'Phone number', content: contact.number});
      }
      if (contact.email !== '') {
        displayContent.push({name: 'Email', content: `<a href="mailto:${contact.email}">${contact.email}</a>`});
      }
      if (contact.url !== '') {
        displayContent.push({name: 'URL', content: `<a href="${contact.url}" target="blank">${contact.url}</a>`});
      }
      const addressChunks = [address.extended, address.street, address.locality, address.region, address.zip, address.country]
        .filter(chunk => chunk !== '')
        .join(', ');
      if (addressChunks !== '') {
        displayContent.push({name: 'Address', content: addressChunks});
      }
      if (contact.note !== '') {
        displayContent.push({name: 'Note', content: contact.note});
      }
      let display = this.buildDisplay('Contact', displayContent);

      return {
        payload: payload,
        display: display
      };
    };

    /**
     * Build event.
     * @param {object} event Event data.
     * @param {string} event.title Title.
     * @param {boolean} event.allDay If true, event will take all day.
     * @param {string} event.dateStart Start date as yyyy/mm/dd.
     * @param {string} event.timeStart Start time as hh:mm.
     * @param {string} event.dateEnd End date as yyyy/mm/dd.
     * @param {string} event.timeEnd End time as hh:mm.
     * @param {string} event.timezone Timezone offset.
     * @param {boolean} event.daylightSavings If true, consider daylight savings time.
     * @param {string} [event.location] Location.
     * @param {string} [event.description] Description.
     * @return {object} Payload and display.
     */
    this.buildEvent = function (event) {
      if (event.allDay) {
        event.timeStart = '00:00';
        event.timeEnd = '00:00';
      }

      // Date formatting
      event.dateStart = event.dateStart.split('/').map(value => parseInt(value, 10));
      event.dateEnd = event.dateEnd.split('/').map(value => parseInt(value, 10));
      event.timeStart = event.timeStart.split(':').map(value => parseInt(value, 10));
      event.timeEnd = event.timeEnd.split(':').map(value => parseInt(value, 10));

      event.timezone = event.timezone.split(':');

      let dateStart = new Date(Date.UTC(
        event.dateStart[0],
        event.dateStart[1] - 1,
        event.dateStart[2],
        event.timeStart[0] - event.timezone[0] + ((event.daylightSavings) ? 1 : 0),
        event.timeStart[1] - event.timezone[1]
      ));

      let dateEnd = new Date(Date.UTC(
        event.dateEnd[0],
        event.dateEnd[1] - 1,
        event.dateEnd[2],
        event.timeEnd[0] - event.timezone[0] + ((event.daylightSavings) ? 1 : 0),
        event.timeEnd[1] - event.timezone[1]
      ));

      if (dateEnd < dateStart) {
        dateEnd = dateStart;
      }

      const dateStartCode = dateStart.toISOString().split('.')[0].replace(/-|\.|:/g, '');
      const dateEndCode = dateEnd.toISOString().split('.')[0].replace(/-|\.|:/g, '');

      // Payload
      let payload  = `BEGIN:VEVENT\n`;
      payload += `SUMMARY:${event.title}\n`;
      payload += `DTSTART:${dateStartCode}\n`;
      payload += `DTEND:${dateEndCode}\n`;
      payload += (event.location) ? `LOCATION:${event.location}\n` : ``;
      payload += (event.description) ? `DESCRIPTION:${event.description}\n` : ``;
      payload += `END:VEVENT`;

      // Display
      const displayContent = [
        {name: 'Title', content: event.title},
        {name: 'Start', content: dateStart.toString()},
        {name: 'End', content: dateEnd.toString()}
      ];
      if (event.location) {
        displayContent.push({name: 'Location', content: event.location});
      }
      if (event.description) {
        displayContent.push({name: 'Description', content: event.description});
      }
      let display = this.buildDisplay('Event', displayContent);

      return {
        payload: payload,
        display: display
      };
    };

    /**
     * Build display for overlay.
     * @param {string} [titleText=''] Text for the title, can be empty.
     * @param {object|string} [rows=''] Content rows.
     * @param {string} rows.name Name of the row.
     * @param {string} rows.content Content of the row.
     */
    this.buildDisplay = function (titleText = '', rows = '') {
      if (typeof rows === 'string') {
        rows = [{name: '', content: rows}];
      }

      // Display
      const display = document.createElement('div');
      display.classList.add('h5p-kewar-code-display');

      // Title
      const title = document.createElement('div');
      title.classList.add('h5p-kewar-code-display-title');
      title.innerHTML = titleText;
      display.appendChild(title);

      // Rows
      rows.forEach( rowContent => {
        const row = document.createElement('div');
        row.classList.add('h5p-kewar-code-display-row');

        if (rowContent.name !== '') {
          const name = document.createElement('div');
          name.classList.add('h5p-kewar-code-display-row-name');
          name.innerHTML = `${rowContent.name}: `;
          row.appendChild(name);
        }

        const content = document.createElement('div');
        content.classList.add('h5p-kewar-code-display-row-content');
        content.innerHTML = rowContent.content;
        row.appendChild(content);

        display.appendChild(row);
      });

      return display;
    };
  }
}

/** @constant {number} */
KewArCode.typeNumber = 0; // 0 = auto sizing; otherwise 1-40, cmp. https://kazuhikoarase.github.io/qrcode-generator/js/demo/

/** @constant {string} */
KewArCode.errorCorrection = 'L'; // L (7 %), M (15 %), Q (25 %), H (30 %).
