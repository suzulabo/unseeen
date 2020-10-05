import { Component, h, Host, State } from '@stencil/core';

@Component({
  tag: 'app-terms',
  styleUrl: 'app-terms.scss',
})
export class AppTerms {
  @State()
  terms: string;

  private async loadTerms() {
    if (this.terms) {
      return;
    }

    const res = await fetch('/assets/terms.html');
    if (!res.ok) {
      throw new Error(`loadTerms Error: ${res.statusText}`);
    }
    this.terms = await res.text();
  }

  componentWillLoad() {
    void this.loadTerms();
  }

  render() {
    return <Host innerHTML={this.terms}></Host>;
  }
}
