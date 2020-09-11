import { Component, h, Host } from '@stencil/core';
import { getApp } from '../../../app/app';
import { msgs } from '../../../i18n/i18n';
import { If } from '../../ui/if';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: false,
})
export class AppHome {
  private app = getApp();

  render() {
    return (
      <Host>
        <stencil-route-title pageTitle="Home"></stencil-route-title>
        <If if={!this.app.ready}>
          <section class="start">
            <h2>{msgs().home.start.title}</h2>
            <p>
              <p>{msgs().home.start.desc}</p>
            </p>
            <div class="btn">
              <stencil-route-link url="/start" anchorClass="button">
                {msgs().home.start.naviBtn}
              </stencil-route-link>
            </div>
          </section>
        </If>
        <If if={this.app.ready}>
          <section class="recipient">
            <h2>{msgs().home.recipient.title}</h2>
            <p>{msgs().home.recipient.desc}</p>
            <div class="box">ID: {this.app.userID}</div>
            <div class="btn">
              <button
                onClick={(event) => {
                  void navigator.clipboard.writeText(this.app.userID);
                  (event.target as HTMLElement).blur();
                }}
              >
                <ion-icon name="copy-outline"></ion-icon>
                {msgs().home.recipient.copyBtn}
              </button>
            </div>
          </section>
        </If>
        <section class="send-file">
          <h2>{msgs().home.sendFile.title}</h2>
          <p>
            <p>{msgs().home.sendFile.desc}</p>
          </p>
          <div class="btn">
            <stencil-route-link url="/encrypt" anchorClass="button">
              {msgs().home.sendFile.naviBtn}
            </stencil-route-link>
          </div>
          <div class="btn">
            <stencil-route-link url="/upload-history">
              {msgs().home.sendFile.historyBtn}
            </stencil-route-link>
          </div>
        </section>
        <If if={this.app.ready}>
          <section class="recv-file">
            <h2>{msgs().home.recvFile.title}</h2>
            <p>
              <p>{msgs().home.recvFile.desc}</p>
            </p>
            <div class="btn">
              <stencil-route-link url="/decrypt" anchorClass="button">
                {msgs().home.recvFile.naviBtn}
              </stencil-route-link>
            </div>
          </section>
        </If>
      </Host>
    );
  }
}
