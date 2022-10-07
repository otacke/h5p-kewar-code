import Overlay from './h5p-kewar-code-overlay';
import Util from "../scripts/h5p-kewar-code-util";
import qrcode from "../scripts/h5p-kewar-code-qrcode";

export default class KewArCode extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content id.
   * @param {object} extras Extras like previous state, metadata, ...
   */
  constructor(params, contentId, extras) {
    super();

    this.params = Util.extend(
      {
        codeType: 'url',
        contact: {
          name: 'Unknown',
          organization: '',
          title: '',
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
        },
        l10n: {
          address: 'Address',
          contact: 'Contact',
          country: 'Country',
          dateEnd: 'End date',
          dateStart: 'Start date',
          description: 'Description',
          email: 'Email',
          event: 'Event',
          extended: 'Extended address',
          latitude: 'Latitude',
          locality: 'Locality',
          location: 'Location',
          longitude: 'Longitude',
          message: 'Message',
          name: 'Name',
          note: 'Note',
          organization: 'Organization',
          phone: 'Phone number',
          region: 'Region',
          sms: 'SMS',
          street: 'Street',
          text: 'Text',
          title: 'Title',
          url: 'URL',
          zip: 'ZIP code'
        },
        a11y: {
          openCodeInformation: 'QRCode. Display information.',
          closeCodeInformation: 'Hide information.',
        }
      },
      params
    );

    this.contentId = contentId;
    this.extras = extras;

    // Decode strings and strip potentially dangerous code
    for (let section in this.params) {
      if (['codeType', 'behaviour', 'introduction'].includes(section)) {
        continue;
      }

      this.params[section] = Util.htmlDecodeDeep(this.params[section]);
      this.params[section] = Util.stripHTMLDeep(this.params[section]);
    }

    this.on('resize', () => {
      if (!this.qrcodeContainer) {
        return;
      }

      // Adjust container size if overlay is too large
      const heightOverlay = (this.overlay) ? this.overlay.getBoxHeight() : 0;
      const heightSVG = (this.codeImage) ?  this.codeImage.getBoundingClientRect().width : 0;

      if (heightOverlay > heightSVG) {
        this.codeImage.style.height = `${heightSVG}px`;
        this.codeImage.style.maxHeight = '';
        this.qrcodeContainer.style.height = `${heightOverlay}px`;
      }
      else {
        this.codeImage.style.height = '';
        this.codeImage.style.maxHeight = this.params.behaviour.maxSize || '';
        this.qrcodeContainer.style.height = '';
      }

      // Safari needs extra resize
      if (!this.isInitialized) {
        setTimeout(() => {
          this.isInitialized = true;
          this.trigger('resize');
        }, 0);
      }
    });

    /**
     * Attach library to wrapper.
     *
     * @param {jQuery} $wrapper Content's container.
     */
    this.attach = function ($wrapper) {
      // Display content type instead of QR code if called from self.
      if (this.calledFromKewAr()) {
        const instance = H5P.newRunnable(this.params.h5p, this.contentId, $wrapper, false, this.extras);

        this.bubbleUp(instance, 'resize', this);
        this.bubbleDown(this, 'resize', instance);

        const library = !this.params.h5p.library ? null : this.params.h5p.library.split(' ')[0];
        if (library === 'H5P.Image' || this.params.h5p.library === 'H5P.TwitterUserFeed') {
          // Resize when images are loaded

          instance.on('loaded', function () {
            this.trigger('resize');
          });
        }

        return;
      }

      // Create code object
      const code = qrcode(KewArCode.typeNumber, KewArCode.errorCorrection);

      let payload = 'Something went wrong';
      let display = document.createElement('div').innerHTML = payload;

      if (this.params.codeType === 'contact') {
        ({payload, display} = this.buildContact(this.params.contact));
      }
      else if (this.params.codeType === 'event') {
        ({payload, display} = this.buildEvent(this.params.event));
      }
      else if (this.params.codeType === 'email') {
        payload = `mailto:${this.params.email}`;
        display = this.buildDisplay(this.params.l10n.email, `<a href="mailto:${this.params.email}">${this.params.email}</a>`);
      }
      else if (this.params.codeType === 'location') {
        payload = `geo:${this.params.location.latitude},${this.params.location.longitude}`;
        display = this.buildDisplay(this.params.l10n.location, [
          {name: this.params.l10n.latitude, content: this.params.location.latitude},
          {name: this.params.l10n.longitude, content: this.params.location.longitude}
        ]);
      }
      else if (this.params.codeType === 'phone') {
        payload = `tel:${this.params.phone}`;
        display = this.buildDisplay(this.params.l10n.phone, this.params.phone);
      }
      else if (this.params.codeType === 'sms') {
        const number = this.params.sms.number.replace(/[^+0-9]/gi, '');
        payload = `smsto:${number}:${this.params.sms.message}`;
        display = this.buildDisplay(this.params.l10n.sms, [
          {name: this.params.l10n.phone, content: number},
          {name: this.params.l10n.message, content: this.params.sms.message}
        ]);
      }
      else if (this.params.codeType === 'text') {
        payload = this.params.text;
        display = this.buildDisplay(this.params.l10n.text, this.params.text.replace(/\n/g, '<br />'));
      }
      else if (this.params.codeType === 'url') {
        payload = this.params.url;
        display = this.buildDisplay(this.params.l10n.url, `<a href="${this.params.url}" target="blank">${this.params.url}</a>`);
      }
      else if (this.params.codeType === 'h5p') {
        const url = window.location.href;

        payload = url.indexOf('?') === -1 ?
          window.location.href + `?kewar=${this.contentId}` :
          this.calledFromKewAr() ? url : url + `&kewar=${this.contentId}`;

        display = this.buildDisplay(
          this.params.l10n.url,
          `<a href="${payload}" target="blank">${payload}</a>`
        );
      }

      code.addData(payload);
      code.make();

      // Add overlay for presenting code information in human readable form
      this.overlay = new Overlay({
        content: display,
        callbackClosed: () => this.handleClosedOverlay(focus),
        a11y: {
          closeCodeInformation: this.params.a11y.closeCodeInformation
        }
      });

      this.mainContainer = document.createElement('div');
      this.mainContainer.classList.add('h5p-kewar-code-container-main');

      if (this.params.introduction) {
        const introduction = document.createElement('div');
        introduction.classList.add('h5p-kewar-code-introduction');
        introduction.innerHTML = this.params.introduction;
        this.mainContainer.appendChild(introduction);
      }

      // Create DOM element
      this.qrcodeContainer = document.createElement('div');
      this.qrcodeContainer.classList.add('h5p-kewar-code-container');
      this.qrcodeContainer.setAttribute('role', 'button');
      this.qrcodeContainer.setAttribute('tabindex', 0);
      this.qrcodeContainer.setAttribute('aria-label', this.params.a11y.openCodeInformation);
      this.qrcodeContainer.style.textAlign = this.params.behaviour.alignment;

      this.qrcodeContainer.addEventListener('click', () => {
        this.overlay.show();
        setTimeout(() => {
          this.trigger('resize');
        }, 0);
      });
      this.qrcodeContainer.addEventListener('keydown', (event) => {
        event = event || window.event;
        const key = event.which || event.keyCode;
        if (key === 13 || key === 32) {
          this.overlay.show(undefined, true);
          this.qrcodeContainer.removeAttribute('tabindex');
          setTimeout(() => {
            this.trigger('resize');
          }, 0);
        }
      });

      // Build SVG image from inline SVG
      this.codeImage = this.buildSVGImage(code.createSvgTag());
      if (this.params.behaviour.maxSize) {
        this.codeImage.style.maxWidth = this.params.behaviour.maxSize;
        this.codeImage.maxHeight = this.params.behaviour.maxSize;
      }
      this.qrcodeContainer.appendChild(this.codeImage);

      this.mainContainer.appendChild(this.qrcodeContainer);

      $wrapper.get(0).classList.add('h5p-kewar-code');
      $wrapper.get(0).appendChild(this.mainContainer);
      $wrapper.get(0).appendChild(this.overlay.getDOM());
    };

    /**
     * Create SVG image and use img tag to make it downloadable.
     * @param {string} inlineSVG Inline SVG.
     * @return {HTMLElement} SVG image.
     */
    this.buildSVGImage = function (inlineSVG) {
      // Set size for downloadable image
      inlineSVG = inlineSVG.replace(/width="[0-9]*px"/, `width="${KewArCode.svgImageSize}px"`);
      inlineSVG = inlineSVG.replace(/height="[0-9]*px"/, `height="${KewArCode.svgImageSize}px"`);

      const codeSVG = document.createElement('div');
      codeSVG.innerHTML = inlineSVG;

      // Apply custom colors
      const codePath = codeSVG.querySelector('path');
      codePath.setAttribute('fill', this.params.behaviour.codeColor);

      const codeRect = codeSVG.querySelector('rect');
      codeRect.setAttribute('fill', this.params.behaviour.backgroundColor);

      const imgData = `data:image/svg+xml;base64,${window.btoa(codeSVG.innerHTML)}`;
      const imageSVG = document.createElement('img');
      imageSVG.src = imgData;

      return imageSVG;
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
      payload += `N:${contact.name}\n`;
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
        {name: this.params.l10n.name, content: contact.name}
      ];
      if (contact.organization !== '') {
        displayContent.push({name: this.params.l10n.organization, content: contact.organization});
      }
      if (contact.title !== '') {
        displayContent.push({name: this.params.l10n.title, content: contact.title});
      }
      if (contact.number !== '') {
        displayContent.push({name: this.params.l10n.phone, content: contact.number});
      }
      if (contact.email !== '') {
        displayContent.push({name: this.params.l10n.email, content: `<a href="mailto:${contact.email}">${contact.email}</a>`});
      }
      if (contact.url !== '') {
        displayContent.push({name: this.params.l10n.url, content: `<a href="${contact.url}" target="blank">${contact.url}</a>`});
      }
      const addressChunks = [address.extended, address.street, address.locality, address.region, address.zip, address.country]
        .filter(chunk => chunk !== '')
        .join(', ');
      if (addressChunks !== '') {
        displayContent.push({name: this.params.l10n.address, content: addressChunks});
      }
      if (contact.note !== '') {
        displayContent.push({name: this.params.l10n.note, content: contact.note});
      }
      let display = this.buildDisplay(this.params.l10n.contact, displayContent);

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
      // QR Code readers don't interpret dates without time as full day events.
      if (event.allDay) {
        event.timeStart = '00:00';
        event.timeEnd = '23:59';
        event.timezone = '0:00';
        event.daylightSavings = false;
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

      const dateStartCode = dateStart
        .toISOString()
        .split('.')[0]
        .replace(/-|\.|:/g, '')
        .concat(event.allDay ? '' : 'Z'); // Z indicates UTC, not floating time
      const dateEndCode = dateEnd
        .toISOString()
        .split('.')[0]
        .replace(/-|\.|:/g, '')
        .concat(event.allDay ? '' : 'Z');  // Z indicates UTC, not floating time

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
        {name: this.params.l10n.title, content: event.title},
        {name: this.params.l10n.dateStart, content: dateStart.toString()},
        {name: this.params.l10n.dateEnd, content: dateEnd.toString()}
      ];
      if (event.location) {
        displayContent.push({name: this.params.l10n.location, content: event.location});
      }
      if (event.description) {
        displayContent.push({name: this.params.l10n.description, content: event.description});
      }
      let display = this.buildDisplay(this.params.l10n.event, displayContent);

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

    /**
     * Handle close callback from overlay.
     * @param {boolean} focus If true, container will get focus.
     */
    this.handleClosedOverlay = function (focus) {
      if (focus) {
        this.qrcodeContainer.setAttribute('tabindex', 0);
        this.qrcodeContainer.focus();
      }

      this.trigger('resize');
    };

    /**
     * Check if KewAr called itself.
     * Uses GET parameter kewar=true.
     * @return {boolean} True, if KewAr called itself.
     */
    this.calledFromKewAr = function () {
      return new RegExp(`[?&]kewar=${this.contentId}`).test(window.location.href);
    };

    /**
     * Make it easy to bubble events from child to parent.
     * @private
     * @param {Object} origin Origin of event.
     * @param {string} eventName Name of event.
     * @param {Object} target Target to trigger event on.
     */
    this.bubbleUp = function (origin, eventName, target) {
      origin.on(eventName, function (event) {
        // Prevent target from sending event back down
        target.bubblingUpwards = true;

        // Trigger event
        target.trigger(eventName, event);

        // Reset
        target.bubblingUpwards = false;
      });
    };

    /**
     * Makes it easy to bubble events from parent to children
     *
     * @private
     * @param {Object} origin Origin of the Event
     * @param {string} eventName Name of the Event
     * @param {Array} targets Targets to trigger event on
     */
    this.bubbleDown = function (origin, eventName, targets) {
      if (!Array.isArray(targets)) {
        targets = [targets];
      }

      origin.on(eventName, function (event) {
        if (origin.bubblingUpwards) {
          return; // Prevent send event back down.
        }

        targets.forEach(target => {
          target.trigger(eventName, event);
        });
      });
    };

  }
}

/** @constant {number} */
KewArCode.typeNumber = 0; // 0 = auto sizing; otherwise 1-40, cmp. https://kazuhikoarase.github.io/qrcode-generator/js/demo/

/** @constant {string} */
KewArCode.errorCorrection = 'L'; // L (7 %), M (15 %), Q (25 %), H (30 %).

/** @constant {number} */
KewArCode.svgImageSize = 4096; // Size of downloadable image in px
