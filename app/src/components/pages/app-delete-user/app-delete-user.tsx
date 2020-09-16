import { Component, h, Host, State } from '@stencil/core';
import { getApp } from 'src/app/app';
import { atLeast } from 'src/app/utils';
import { showLoading } from 'src/components/ui/a-loading/a-loading-util';
import { If } from 'src/components/ui/if';
import { msgs } from '../../../i18n/i18n';

@Component({
  tag: 'app-delete-user',
  styleUrl: 'app-delete-user.scss',
})
export class AppDeleteUser {
  private app = getApp();

  @State()
  password: string;

  @State()
  passwordError = false;

  @State()
  deleted = false;

  private async deleteUser() {
    this.passwordError = false;
    this.deleted = false;

    if (!this.password) {
      return;
    }

    await showLoading(async () => {
      const password = this.password == this.app.userID ? null : this.password;
      if (password) {
        const r = await this.app.verifyPassword(password);
        if (!r) {
          this.passwordError = true;
          return;
        }
      }

      await atLeast<void>(this.app.deleteID(password));
      this.deleted = true;
    });
  }

  render() {
    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().deleteUser.title}
        ></stencil-route-title>
        <h1>{msgs().deleteUser.title}</h1>
        <If if={!this.deleted}>
          <p>{msgs().deleteUser.desc}</p>
          <div class="box">{this.app.userID}</div>
          <input
            placeholder={msgs().deleteUser.input}
            value={this.password}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              this.password = el.value;
              this.passwordError = false;
            }}
          ></input>
          <If if={this.passwordError}>
            <p class="password-error">{msgs().deleteUser.passwordError}</p>
          </If>
          <p class="forget-desc">{msgs().deleteUser.forgetDesc}</p>
          <button
            class="danger"
            disabled={!this.password}
            onClick={() => {
              void this.deleteUser();
            }}
          >
            {msgs().deleteUser.btn}
          </button>
        </If>
        <If if={this.deleted}>
          <p class="deleted">{msgs().deleteUser.deleted}</p>
        </If>
        <div class="back-btn">
          <stencil-route-link url="/settings">
            {msgs().label.back}
          </stencil-route-link>
        </div>
      </Host>
    );
  }
}
