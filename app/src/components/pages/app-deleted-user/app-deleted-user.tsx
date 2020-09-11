import { Component, h, Host } from '@stencil/core';
import { getApp } from '../../../app/app';
import { msgs } from '../../../i18n/i18n';

@Component({
  tag: 'app-deleted-user',
  styleUrl: 'app-deleted-user.scss',
})
export class AppDeletedUser {
  private app = getApp();

  render() {
    return (
      <Host>
        <p>{msgs().deletedUser.desc}</p>

        <div>
          {msgs().deletedUser.storedID}
          {this.app.storedUserID}
        </div>

        <div class="home">
          <a
            onClick={() => {
              void this.app.deleteID();
            }}
          >
            {msgs().label.home}
          </a>
        </div>
      </Host>
    );
  }
}
