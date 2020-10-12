import { Component, h, Host } from '@stencil/core';
import { getApp } from '../../../app/app';
import { msgs } from '../../../i18n/i18n';
import { If } from '../../ui/if';

@Component({
  tag: 'app-settings',
  styleUrl: 'app-settings.scss',
})
export class AppSettings {
  private app = getApp();

  render() {
    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().settings.title}
        ></stencil-route-title>
        <If if={!this.app.ready}>
          <section>
            <h2>{msgs().settings.start.title}</h2>
            <p>{msgs().settings.start.desc}</p>
            <div class="btn">
              <stencil-route-link url="/start" anchorClass="button">
                {msgs().settings.start.naviBtn}
              </stencil-route-link>
            </div>
          </section>
        </If>
        <If if={this.app.ready}>
          <section>
            <h2>{msgs().settings.changePassword.title}</h2>
            <div class="btn">
              <stencil-route-link url="/change-password" anchorClass="button">
                {msgs().settings.changePassword.btn}
              </stencil-route-link>
            </div>
          </section>
          <hr></hr>
          <section>
            <h2>{msgs().settings.deleteID.title}</h2>
            <p>{msgs().settings.deleteID.desc}</p>
            <div class="btn">
              <stencil-route-link
                url="/delete-user"
                anchorClass="button danger"
              >
                {msgs().settings.deleteID.btn}
              </stencil-route-link>
            </div>
          </section>
        </If>
      </Host>
    );
  }
}
