import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'a-loading',
  styleUrl: 'a-loading.scss',
  shadow: false,
})
export class Loading {
  render() {
    return (
      <Host class="overlay">
        <div class="loading"></div>
      </Host>
    );
  }
}
