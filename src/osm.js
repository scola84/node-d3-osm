/* eslint prefer-reflect: "off" */

import { select } from 'd3';
import leaflet from 'leaflet';
import { Observer } from '@scola/d3-model';

export default class OSM extends Observer {
  constructor() {
    super();

    this._inset = false;
    this._media = null;

    this._root = select('body')
      .append('div')
      .remove()
      .classed('scola map', true)
      .styles({
        'margin-bottom': '2em',
        'overflow': 'hidden',
        'transform': 'scale(1)'
      });

    this._body = this._root
      .append('div')
      .styles({
        'height': '100%',
        'width': '100%'
      });

    this._map = leaflet.map(this._body.node());
  }

  destroy() {
    super.destroy();

    this._deleteInset();
    this._map.remove();

    this._root.dispatch('destroy');
    this._root.remove();
    this._root = null;
  }

  root() {
    return this._root;
  }

  height(value = null) {
    if (value === null) {
      return this._root.style('height');
    }

    this._root.style('height', value);
    return this;
  }

  width(value = null) {
    if (value === null) {
      return this._root.style('width');
    }

    this._root.style('width', value);
    return this;
  }

  inset(width = '48em') {
    if (width === null) {
      return this._inset;
    }

    if (width === false) {
      this._deleteInset();
    }

    if (this._media === null) {
      this._insertInset(width);
    }

    return this;
  }

  tile(url, options) {
    leaflet
      .tileLayer(url, options)
      .addTo(this._map);

    return this;
  }

  _insertInset(width) {
    this._media = this._root
      .media(`not all and (min-width: ${width})`)
      .call(() => { this._inset = false; })
      .media(`(min-width: ${width})`)
      .call(() => { this._inset = true; })
      .styles({
        'border-radius': '0.5em',
        'margin-left': '1em',
        'margin-right': '1em'
      })
      .start();

    return this;
  }

  _deleteInset() {
    if (this._media) {
      this._media.destroy();
      this._media = null;
    }

    return this;
  }

  _set(setEvent) {
    if (setEvent.name !== this._name) {
      return;
    }

    const [
      lat = null,
      lng = null,
      zoom = null
    ] = this._format(setEvent.value) || [];

    if (lat === null || lng === null || zoom === null) {
      return;
    }

    this._map.setView([lat, lng], zoom);
  }
}
