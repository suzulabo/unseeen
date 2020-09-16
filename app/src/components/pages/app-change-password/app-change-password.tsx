import { Component, h, Host, State } from '@stencil/core';
import { showLoading } from 'src/components/ui/a-loading/a-loading-util';
import { If } from 'src/components/ui/if';
import { getApp } from '../../../app/app';
import { msgs } from '../../../i18n/i18n';

@Component({
  tag: 'app-change-password',
  styleUrl: 'app-change-password.scss',
})
export class AppChangePassword {
  private app = getApp();

  @State()
  curPassword: string;

  @State()
  newPassword: string;

  @State()
  hidePassword = false;

  @State()
  passwordError = false;

  @State()
  updated = false;

  private async updatePassword() {
    if (!this.curPassword) {
      return;
    }

    await showLoading(async () => {
      this.passwordError = !(await this.app.verifyPassword(this.curPassword));
      if (this.passwordError) {
        return;
      }

      await this.app.updatePassword(this.curPassword, this.newPassword);
      this.updated = true;
    });
  }

  render() {
    const inputType = this.hidePassword ? 'password' : 'text';
    const btnEnabled =
      !!this.curPassword &&
      !!this.newPassword &&
      this.curPassword != this.newPassword;

    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().changePassword.title}
        ></stencil-route-title>
        <h1>{msgs().changePassword.title}</h1>
        <If if={!this.updated}>
          <p>{msgs().changePassword.curPassword}</p>
          <input
            type={inputType}
            class="password"
            value={this.curPassword}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              this.curPassword = el.value;
              this.passwordError = false;
            }}
          ></input>
          <If if={this.passwordError}>
            <p class="error">{msgs().changePassword.passwordError}</p>
          </If>
          <p>{msgs().changePassword.newPassword}</p>
          <input
            type={inputType}
            class="password"
            value={this.newPassword}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              this.newPassword = el.value;
              this.passwordError = false;
            }}
          ></input>
          <label class="hide-password">
            <input
              type="checkbox"
              checked={this.hidePassword}
              onClick={(event) => {
                this.hidePassword = (event.target as HTMLInputElement).checked;
                this.passwordError = false;
              }}
            ></input>
            {msgs().label.hidePassword}
          </label>
          <button
            disabled={!btnEnabled}
            onClick={() => {
              void this.updatePassword();
            }}
          >
            {msgs().changePassword.btn}
          </button>
        </If>
        <If if={this.updated}>
          <p class="updated">{msgs().changePassword.updated}</p>
        </If>
        <stencil-route-link url="/settings">
          {msgs().label.back}
        </stencil-route-link>
      </Host>
    );
  }
}
