import { Component, h, Host, State } from '@stencil/core';
import { getApp } from '../../../app/app';
import { genID } from '../../../app/keys';
import { msgs } from '../../../i18n/i18n';
import { If } from '../../ui/if';
import { UIreCAPTCHA } from '../../ui/recaptcha';

@Component({
  tag: 'app-start',
  styleUrl: 'app-start.scss',
  shadow: false,
})
export class AppStart {
  app = getApp();

  @State()
  step = 1;

  @State()
  password: string;

  @State()
  hidePassword: boolean;

  @State()
  userID: ReturnType<typeof genID>;

  @State()
  saving = false;

  componentWillLoad() {
    this.userID = genID();
  }

  private async register() {
    this.saving = true;
    try {
      await this.app.register(this.userID.id, this.userID.pair, this.password);
    } finally {
      this.saving = false;
    }
  }

  render() {
    const renderBackNext = () => {
      const showBack = this.step > 1;
      const showNext = this.step == 1;
      const disableNext = !this.password?.trim();

      return (
        <div class="backnext">
          <If if={showBack}>
            <a
              class="back"
              onClick={() => {
                this.step--;
              }}
            >
              {msgs().label.back}
            </a>
          </If>
          <If if={showNext}>
            <a
              class={{ next: true, disabled: disableNext }}
              onClick={() => {
                if (!disableNext) {
                  this.step++;
                }
              }}
            >
              {msgs().label.next}
            </a>
          </If>
        </div>
      );
    };

    const renderInputPassword = () => {
      const inputType = this.hidePassword ? 'password' : 'text';

      return (
        <div class="input-password">
          <p>{msgs().start.inputPassword.desc}</p>
          <label class="password">
            {msgs().label.password}
            <input
              type={inputType}
              value={this.password}
              onInput={(event) => {
                this.password = (event.target as HTMLInputElement).value;
              }}
            ></input>
          </label>
          <label class="hide-password">
            <input
              type="checkbox"
              checked={this.hidePassword}
              onClick={(event) => {
                this.hidePassword = (event.target as HTMLInputElement).checked;
              }}
            ></input>

            {msgs().label.hidePassword}
          </label>
        </div>
      );
    };

    const renderConfirm = () => {
      const renderPassword = () => {
        if (this.hidePassword) {
          return '●'.repeat(this.password?.length);
        }
        return this.password;
      };

      let reloadIcon: HTMLElement;

      return (
        <div class="confirm">
          <p>{msgs().start.confirm.desc}</p>
          <div class="values box">
            <span class="head">ID:</span>
            <span class="value id">
              {this.userID?.id}
              <ion-icon
                name="reload"
                ref={(elm: HTMLElement) => {
                  reloadIcon = elm;
                }}
                onAnimationEnd={() => {
                  this.userID = genID();
                  reloadIcon.classList.remove('spin');
                }}
                onClick={() => {
                  reloadIcon.classList.add('spin');
                }}
              ></ion-icon>
            </span>
            <span class="head">{msgs().label.password}:</span>
            <span class="value">{renderPassword()}</span>
          </div>
          <div class="btn">
            <button
              onClick={() => {
                void this.register();
              }}
            >
              {msgs().start.registerBtn}
            </button>
          </div>
        </div>
      );
    };

    if (this.app.ready) {
      return (
        <Host>
          <stencil-route-title pageTitle="Compete!"></stencil-route-title>
          <div class="completed">
            <p>{msgs().start.completed}</p>
            <div class="box">ID: {this.app.userID}</div>
            <stencil-route-link url="/">Home</stencil-route-link>
          </div>
        </Host>
      );
    }

    return (
      <Host>
        <stencil-route-title pageTitle="Start"></stencil-route-title>
        <h1>{msgs().start.welcome}</h1>
        <If if={this.step == 1}>{renderInputPassword()}</If>
        <If if={this.step == 2}>{renderConfirm()}</If>
        {renderBackNext()}
        <UIreCAPTCHA></UIreCAPTCHA>
        <If if={this.saving}>
          <a-loading></a-loading>
        </If>
      </Host>
    );
  }
}
