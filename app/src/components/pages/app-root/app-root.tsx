import { Component, h, Host, Listen, State } from '@stencil/core';
import { getApp } from '../../../app/app';
import { appEnv, buildInfo } from '../../../app/appenv';
import { formatDate } from '../../../app/utils';
import { msgs } from '../../../i18n/i18n';
import { If } from '../../ui/if';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  shadow: false,
})
export class AppRoot {
  private app = getApp();
  private errors = [] as { time: Date; msg: string }[];

  addError(msg: string) {
    this.errors.push({ time: new Date(), msg: msg });
    this.showErrors = true;
  }

  @Listen('error', { target: 'window' })
  handleError(event: ErrorEvent) {
    console.error('handleError', event);
    event.preventDefault();

    this.addError(event.error.stack);
  }

  @Listen('unhandledrejection', { target: 'window' })
  handleUnhandledRejection(event: PromiseRejectionEvent) {
    console.error('handleUnhandledRejection', event);
    event.preventDefault();

    const reason = event.reason;
    this.addError(reason?.message || reason?.toString());
  }

  @State()
  showErrors = false;

  @State()
  initializing = true;

  private async init() {
    this.initializing = true;
    await this.app.init();
    this.initializing = false;
  }

  componentWillLoad() {
    void this.init();
  }

  render() {
    if (this.initializing) {
      return <a-loading></a-loading>;
    }

    if (!this.app.ready && this.app.storedUserID) {
      return (
        <main>
          <app-deleted-user></app-deleted-user>
        </main>
      );
    }

    const renderErrors = () => {
      if (!this.showErrors) {
        return;
      }

      const errorsReport = this.errors
        .reverse()
        .map((v) => {
          return `${formatDate(v.time, true)}\n${v.msg}\n`;
        })
        .join('\n');

      let errorsModal: HTMLElement;
      return (
        <div
          class="overlay"
          onClick={(event) => {
            if (event.target == event.currentTarget) {
              //this.showErrors = false;
            }
          }}
        >
          <div
            class="errors-modal"
            ref={(el) => {
              errorsModal = el;
            }}
          >
            <p class="desc">{msgs().root.errors.desc}</p>
            <div class="show-btn">
              <a
                onClick={() => {
                  errorsModal.classList.add('show-report');
                }}
              >
                {msgs().root.errors.showBtn}
              </a>
            </div>
            <p class="report">
              {errorsReport}
              <span class="copy-btn">
                <ion-icon
                  name="copy-outline"
                  class="clickable"
                  onClick={() => {
                    void navigator.clipboard.writeText(errorsReport);
                  }}
                ></ion-icon>
              </span>
            </p>
            <div class="close-btn">
              <button
                onClick={() => {
                  this.showErrors = false;
                }}
              >
                {msgs().root.errors.closeBtn}
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <Host class="active">
        <header class={{ ready: !!this.app.userID }}>
          <div>
            <stencil-route-link url="/">Unseeen</stencil-route-link>
            <If if={!!this.app.userID}>
              <div class="userid">ID: {this.app.userID}</div>
            </If>
          </div>
          <div class="spacer"></div>
          <stencil-route-link url="/settings">
            <ion-icon name="settings-sharp"></ion-icon>
          </stencil-route-link>
          <stencil-route-link url="/help">
            <ion-icon name="help-circle-sharp"></ion-icon>
          </stencil-route-link>
        </header>
        <main>
          <stencil-router titleSuffix=" - Unseeen">
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/start" component="app-start" exact={true} />
              <stencil-route
                url="/encrypt"
                component="app-encrypt"
                exact={true}
              />
              <stencil-route
                url="/upload-history"
                component="app-upload-history"
                exact={true}
              />
              <stencil-route
                url="/decrypt"
                component="app-decrypt"
                exact={true}
              />
              <stencil-route
                url="/settings"
                component="app-settings"
                exact={true}
              />
              <stencil-route
                url="/change-password"
                component="app-change-password"
                exact={true}
              />
              <stencil-route
                url="/delete-user"
                component="app-delete-user"
                exact={true}
              />
              <stencil-route url="/" component="app-home" exact={true} />
            </stencil-route-switch>
          </stencil-router>
        </main>
        <footer>
          <div class="copy">&copy;unseeen.app</div>
          <div class="build-info">Version: {buildInfo.src}</div>
          <div class="build-info">
            Built at {new Date(buildInfo.time).toISOString()}
          </div>
        </footer>

        <script
          src={`https://www.google.com/recaptcha/api.js?render=${appEnv.reCAPTCHASiteKey}`}
        ></script>

        {renderErrors()}
      </Host>
    );
  }
}
