import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'a-download-link',
  styleUrl: 'a-download-link.scss',
  shadow: false,
})
export class DownloadLink {
  @Prop()
  filename: string;

  @Prop()
  blob: Blob;

  private objectURL: string;

  componentDidUnload() {
    if (this.objectURL) {
      URL.revokeObjectURL(this.objectURL);
    }
  }

  render() {
    if (this.objectURL) {
      URL.revokeObjectURL(this.objectURL);
    }
    if (this.blob) {
      this.objectURL = URL.createObjectURL(this.blob);
    } else {
      this.objectURL = null;
    }

    return (
      <Host>
        <a href={this.objectURL} download={this.filename}>
          <slot></slot>
        </a>
      </Host>
    );
  }
}
