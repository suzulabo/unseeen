import { Component, h, Host, State } from '@stencil/core';
import { getApp } from '../../../app/app';
import { wait } from '../../../app/utils';
import { msgs } from '../../../i18n/i18n';
import { If } from '../../ui/if';

@Component({
  tag: 'app-settings',
  styleUrl: 'app-settings.scss',
})
export class AppSettings {
  private app = getApp();

  @State()
  showDeleteID: boolean;

  @State()
  deleteIDInput: string;

  @State()
  passwordError: boolean;

  @State()
  deleteing: boolean;

  private async deleteID() {
    this.passwordError = false;

    if (!this.deleteIDInput) {
      return;
    }

    const password =
      this.deleteIDInput == this.app.userID ? null : this.deleteIDInput;
    if (password) {
      const r = await this.app.verifyPassword(this.deleteIDInput);
      if (!r) {
        this.passwordError = true;
        return;
      }
    }

    this.deleteing = true;
    try {
      await Promise.all([this.app.deleteID(password), wait()]);
    } finally {
      this.deleteing = false;
    }
  }

  render() {
    const renderDeleteID = () => {
      return (
        <div
          class="overlay"
          onClick={(event) => {
            if (event.target == event.currentTarget) {
              this.showDeleteID = false;
            }
          }}
        >
          <div class="delete-id-modal">
            <h3>{msgs().settings.deleteID.confirm.title}</h3>
            <button
              class="close-btn icon-only"
              onClick={() => {
                this.showDeleteID = false;
              }}
            >
              <ion-icon name="close"></ion-icon>
            </button>
            <If if={!this.app.ready}>
              <p class="done">{msgs().settings.deleteID.confirm.done}</p>
            </If>
            <If if={this.app.ready}>
              <p>{msgs().settings.deleteID.confirm.desc}</p>
              <div class="input-password">
                <span>{this.app.userID}</span>
                <input
                  placeholder={msgs().settings.deleteID.confirm.input}
                  onInput={(event) => {
                    const el = event.target as HTMLInputElement;
                    this.deleteIDInput = el.value;
                    this.passwordError = false;
                  }}
                  value={this.deleteIDInput}
                ></input>
                <p class={{ 'password-error': true, show: this.passwordError }}>
                  {msgs().settings.deleteID.confirm.passwordError}
                </p>
                <p>{msgs().settings.deleteID.confirm.forgetDesc}</p>
                <button
                  class="danger"
                  disabled={!this.deleteIDInput}
                  onClick={() => {
                    void this.deleteID();
                  }}
                >
                  {msgs().settings.deleteID.confirm.btn}
                </button>
              </div>
            </If>
          </div>
        </div>
      );
    };

    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().settings.title}
        ></stencil-route-title>
        <If if={this.showDeleteID}>{renderDeleteID()}</If>
        <If if={this.deleteing}>
          <a-loading></a-loading>
        </If>
        <If if={!this.showDeleteID}>
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
                <button
                  class="danger"
                  onClick={() => {
                    this.showDeleteID = true;
                    this.deleteIDInput = '';
                  }}
                >
                  {msgs().settings.deleteID.btn}
                </button>
              </div>
            </section>
          </If>
        </If>
      </Host>
    );
  }
}
