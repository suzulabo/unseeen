import { Component, forceUpdate, h, Host, State } from '@stencil/core';
import { getApp } from '../../../app/app';
import { atLeast, humanFileSize } from '../../../app/utils';
import { msgs } from '../../../i18n/i18n';
import { showLoading } from '../../ui/a-loading/a-loading-util';
import { If } from '../../ui/if';
import { UIreCAPTCHA } from '../../ui/recaptcha';

@Component({
  tag: 'app-decrypt',
  styleUrl: 'app-decrypt.scss',
  shadow: false,
})
export class AppDecrypt {
  private app = getApp();

  @State()
  password: string;
  @State()
  passwordError: boolean;
  @State()
  passwordVerified: boolean;

  @State()
  recvID: string;
  @State()
  recvIDNotFound: boolean;

  @State()
  files: {
    key: string;
    name: string;
    size: number;
    uploadName: string;
    state?: { progress: number; blob: Blob };
  }[];

  private async checkPassword() {
    if (!this.password) {
      return;
    }
    this.passwordVerified = await this.app.verifyPassword(this.password);
    this.passwordError = !this.passwordVerified;
    forceUpdate(this);
  }

  private async checkRecvID() {
    if (!this.recvID) {
      return;
    }

    await showLoading(async () => {
      const uploadIndex = await atLeast(
        this.app.getUploadIndex(this.recvID, this.password)
      );

      if (!uploadIndex) {
        this.recvIDNotFound = true;
        return;
      }

      this.files = uploadIndex.files;
    });
  }

  private async downloadFile(file: AppDecrypt['files'][number]) {
    if (file.state) {
      return;
    }
    file.state = { progress: 0, blob: null };
    forceUpdate(this);
    const encrypted = await this.app.downloadFile(
      this.password,
      this.recvID,
      file.uploadName,
      false,
      (loaded, total) => {
        file.state.progress = (loaded / total / 2) * 100;
        forceUpdate(this);
      }
    );
    file.state.progress = 50;
    forceUpdate(this);

    const dataSize = encrypted.byteLength;
    const decrypted = await this.app.decryptFile(file.key, encrypted, (val) => {
      file.state.progress = 50 + (val / dataSize / 2) * 100;
      forceUpdate(this);
    });
    file.state.progress = 100;
    file.state.blob = new Blob([decrypted]);
    forceUpdate(this);
  }

  private renderInputPassword() {
    return (
      <main class="input-password">
        <p>{msgs().decrypt.inputPassword.desc}</p>
        <div class="input-box">
          <input
            type="password"
            value={this.password}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              this.password = el.value;
              this.passwordError = false;
            }}
          ></input>
          <button
            disabled={!this.password}
            onClick={() => {
              void this.checkPassword();
            }}
          >
            {msgs().decrypt.inputPassword.btn}
          </button>
        </div>
        <If if={this.passwordError}>
          <p class="error">{msgs().decrypt.inputPassword.invalid}</p>
        </If>
      </main>
    );
  }

  private renderInputID() {
    return (
      <main class="input-id">
        <p>{msgs().decrypt.inputID.desc}</p>
        <div class="input-box">
          <input
            id="recv-id-input"
            value={this.recvID}
            maxLength={12}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              this.recvID = el.value.toUpperCase();
              this.recvIDNotFound = false;
            }}
          ></input>
          <button
            disabled={this.recvID?.length != 12}
            onClick={() => {
              void this.checkRecvID();
            }}
          >
            {msgs().decrypt.inputID.btn}
          </button>
        </div>
        <If if={this.recvIDNotFound}>
          <p class="error">{msgs().decrypt.inputID.notFound}</p>
        </If>
      </main>
    );
  }

  private renderDownload() {
    const renderFiles = () => {
      return this.files.map((v) => {
        const renderBtn = () => {
          if (!v.state) {
            return (
              <span class="btn">
                <ion-icon
                  name="cloud-download"
                  onClick={() => {
                    void this.downloadFile(v);
                  }}
                ></ion-icon>
              </span>
            );
          }
          if (!v.state.blob) {
            return (
              <span class="btn">
                <ion-icon name="cloud-download" class="save loading"></ion-icon>
              </span>
            );
          }

          return (
            <span class="btn">
              <a-download-link blob={v.state.blob} filename={v.name}>
                <ion-icon name="arrow-redo" class="save download"></ion-icon>
              </a-download-link>
            </span>
          );
        };

        const progress = v.state ? v.state.progress : 0;
        const loading = v.state && !v.state.blob;

        let rowElement: HTMLElement;
        return (
          <div
            class={{ row: true, file: true, loading: loading }}
            style={{ '--progress': `${progress}%` }}
            ref={(el) => {
              rowElement = el;
            }}
            onClick={() => {
              if (rowElement) {
                const icon = rowElement.querySelector('ion-icon');
                if (icon) {
                  icon.click();
                }
              }
            }}
          >
            {renderBtn()}
            <span class={{ name: true, progress: progress < 100 }}>
              {v.name}
            </span>
            <span class="size">({humanFileSize(v.size)})</span>
          </div>
        );
      });
    };

    return (
      <main class="files">
        <div class="files-box">{renderFiles()}</div>
      </main>
    );
  }

  render() {
    const renderMain = () => {
      if (this.files) {
        return this.renderDownload();
      }

      if (this.passwordVerified) {
        return this.renderInputID();
      }

      return this.renderInputPassword();
    };

    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().decrypt.title}
        ></stencil-route-title>

        <h1>{msgs().decrypt.title}</h1>
        {renderMain()}
        <UIreCAPTCHA></UIreCAPTCHA>
      </Host>
    );
  }
}
