import { Component, forceUpdate, h, Host, State } from '@stencil/core';
import { PromiseValue } from 'type-fest';
import { App, getApp } from '../../../app/app';
import { atLeast, humanFileSize } from '../../../app/utils';
import { msgs } from '../../../i18n/i18n';
import { showLoading } from '../../ui/a-loading/a-loading-util';
import { If } from '../../ui/if';
import { UIreCAPTCHA } from '../../ui/recaptcha';

const MAX_SIZE = 100 * 1024 * 1024;
const MAX_TOTAL_SIZE = 200 * 1024 * 1024;
const MAX_FILES = 10;

@Component({
  tag: 'app-encrypt',
  styleUrl: 'app-encrypt.scss',
  shadow: false,
})
export class AppEncrypt {
  private app = getApp();

  @State()
  userID: string;

  @State()
  userNotFound: boolean;

  @State()
  user: PromiseValue<ReturnType<App['getUser']>>;

  @State()
  files: {
    file: File;
    progress: number;
    started?: boolean;
    encrypted?: { key: Uint8Array; data: Uint8Array };
    abort?: boolean;
  }[] = [];

  @State()
  uploadMsg: string;

  @State()
  uploadFiles: {
    file: File;
    uploaded: number;
    encrypted: { key: Uint8Array; data: Uint8Array };
  }[];

  @State()
  uploadCancel: boolean;

  @State()
  uploadError: boolean;

  @State()
  uploadID: string;

  private filesStatus = () => {
    const total = this.files.reduce((n, v) => {
      return n + v.file.size;
    }, 0);
    const isSizeOver =
      total > MAX_TOTAL_SIZE ||
      this.files.find((v) => {
        return v.file.size > MAX_SIZE;
      }) != null;
    const isCountOver = this.files.length > MAX_FILES;
    const canLoad = this.files.length > 0 && !isSizeOver && !isCountOver;
    const canUpload =
      canLoad &&
      !this.files.find((v) => {
        return !v.encrypted;
      });

    return {
      total: total,
      isSizeOver: isSizeOver,
      isCountOver: isCountOver,
      canLoad: canLoad,
      canUpload: canUpload,
    };
  };

  private async checkUserID() {
    this.userNotFound = false;

    if (this.userID?.length != 12) {
      return;
    }

    await showLoading(async () => {
      this.user = await atLeast(this.app.getUser(this.userID));
      if (!this.user) {
        this.userNotFound = true;
      }
    });
  }

  private addFiles(list: FileList) {
    for (let i = 0; i < list.length; i++) {
      const file = list.item(i);
      if (file.size == 0) {
        continue;
      }
      const duplicated = this.files.find((v) => {
        return file.name == v.file.name;
      });
      if (!duplicated) {
        const v = { file: file, progress: 0 };
        this.files.push(v);
      }
    }

    this.files.sort();
    forceUpdate(this);

    this.handleFilesChange();
  }

  private handleFilesChange() {
    const laodFile = async (v: AppEncrypt['files'][number]) => {
      v.started = true;
      const encrypted = await this.app.encryptFile(v.file, (stage, val) => {
        switch (stage) {
          case 'read':
            v.progress = ((val / v.file.size) * 100) / 2;
            break;
          case 'encrypt':
            v.progress = 50 + ((val / v.file.size) * 100) / 2;
            break;
        }
        forceUpdate(this);

        return v.abort;
      });

      if (!v.abort) {
        v.encrypted = encrypted;
        v.progress = 100;
        forceUpdate(this);
      }
    };

    const filesStatus = this.filesStatus();
    if (filesStatus.canLoad) {
      for (const f of this.files) {
        if (!f.started) {
          void laodFile(f);
        }
      }
    }
  }

  private async upload() {
    this.uploadMsg = null;
    this.uploadCancel = false;
    this.uploadError = false;
    this.uploadFiles = this.files.map((v) => {
      return { file: v.file, uploaded: 0, encrypted: v.encrypted };
    });

    try {
      this.uploadID = await this.app.uploadFiles(
        this.userID,
        this.uploadFiles,
        (stage) => {
          switch (stage) {
            case 'getUser':
              this.uploadMsg = msgs().encrypt.uploading.getUser;
              break;
            case 'callAllowUpload':
              this.uploadMsg = msgs().encrypt.uploading.callAllowUpload;
              break;
            case 'upload':
              this.uploadMsg = msgs().encrypt.uploading.upload;
              break;
            case 'indexFile':
              this.uploadMsg = msgs().encrypt.uploading.indexFile;
              break;
          }
          forceUpdate(this);
          return this.uploadCancel;
        }
      );
    } catch {
      this.uploadMsg = '';
      this.uploadError = true;
      return;
    }

    if (this.uploadID) {
      this.uploadMsg = msgs().encrypt.uploading.done;
    } else {
      this.uploadFiles = null;
    }
  }

  private renderInputID() {
    return (
      <main class="input-id">
        <p>{msgs().encrypt.inputID.desc}</p>
        <div class="input-box">
          <input
            maxLength={12}
            value={this.userID}
            onInput={(event) => {
              const el = event.target as HTMLInputElement;
              this.userID = el.value.toUpperCase();
              this.userNotFound = false;
            }}
          ></input>
          <button
            disabled={this.userID?.length != 12}
            onClick={() => {
              void this.checkUserID();
            }}
          >
            {msgs().encrypt.inputID.btn}
          </button>
        </div>
        <If if={this.userNotFound}>
          <p class="user-not-found">{msgs().encrypt.inputID.userNotFound}</p>
        </If>
      </main>
    );
  }

  private renderInputFiles() {
    const filesStatus = this.filesStatus();

    const renderFiles = () => {
      return this.files.map((v) => {
        return (
          <div
            class={{
              row: true,
              file: true,
              'size-error': v.file.size > MAX_SIZE,
              'size-zero': v.file.size == 0,
            }}
            style={{ '--progress': `${v.progress}%` }}
          >
            <span class={{ name: true, progress: v.progress < 100 }}>
              {v.file.name}
            </span>
            <span class="size">({humanFileSize(v.file.size)})</span>
            <span class="delete-btn">
              <ion-icon
                name="trash-outline"
                onClick={() => {
                  this.files = this.files.filter((vv) => {
                    return vv != v;
                  });
                  v.abort = true;
                  this.handleFilesChange();
                }}
              ></ion-icon>
            </span>
          </div>
        );
      });
    };

    const renderTotal = () => {
      return (
        <div class="row total">
          <span class="total-label">{msgs().encrypt.inputFiles.total}</span>
          <span class="total-size">{humanFileSize(filesStatus.total)}</span>
        </div>
      );
    };

    return (
      <main class="input-files">
        <p class="recipient-id">
          {msgs().encrypt.inputFiles.recipientID} {this.userID}
        </p>
        <a-file-input
          multiple={true}
          onSelectFile={(ev) => {
            this.addFiles(ev.detail);
          }}
        >
          {msgs().encrypt.inputFiles.fileinput}
        </a-file-input>
        <If if={this.files.length > 0}>
          <div class="files-box">
            {renderFiles()}
            {renderTotal()}
          </div>
        </If>
        <If if={filesStatus.isSizeOver}>
          <div class="size-error">{msgs().encrypt.inputFiles.sizeError}</div>
        </If>
        <If if={filesStatus.isCountOver}>
          <div class="count-error">{msgs().encrypt.inputFiles.countError}</div>
        </If>
        <If if={!filesStatus.canUpload}>
          <div class="limit">{msgs().encrypt.inputFiles.limit}</div>
        </If>
        <If if={filesStatus.canUpload}>
          <div class="upload">
            <button
              onClick={() => {
                void this.upload();
              }}
            >
              {msgs().encrypt.inputFiles.uploadBtn}
            </button>
          </div>
        </If>
        <UIreCAPTCHA></UIreCAPTCHA>
      </main>
    );
  }

  private renderUploadFiles() {
    const renderFiles = () => {
      return this.uploadFiles.map((v) => {
        const progress = Math.floor(
          (v.uploaded / v.encrypted.data.byteLength) * 100
        );

        return (
          <div
            class={{
              row: true,
              file: true,
            }}
            style={{ '--progress': `${progress}%` }}
          >
            <span class={{ name: true }}>{v.file.name}</span>
            <span class="progress">{progress}%</span>
          </div>
        );
      });
    };

    const renderBtnBox = () => {
      if (this.uploadError) {
        return (
          <div class="btn-box">
            <p>{msgs().encrypt.uploaded.error}</p>
            <a
              onClick={() => {
                this.uploadFiles = null;
              }}
            >
              {msgs().label.back}
            </a>
          </div>
        );
      }
      if (!this.uploadID) {
        return (
          <div class="btn-box">
            <a
              onClick={() => {
                this.uploadCancel = true;
              }}
            >
              {msgs().label.cancel}
            </a>
          </div>
        );
      }
      return (
        <div class="btn-box">
          <p>{msgs().encrypt.uploaded.desc}</p>
          <div class="upload-id box">ID: {this.uploadID}</div>
          <div class="btn">
            <button
              onClick={(event) => {
                void navigator.clipboard.writeText(this.uploadID);
                (event.target as HTMLElement).blur();
              }}
            >
              <ion-icon name="copy-outline"></ion-icon>
              {msgs().encrypt.uploaded.copyBtn}
            </button>
          </div>
          <stencil-route-link url="/">{msgs().label.back}</stencil-route-link>
        </div>
      );
    };

    return (
      <main class="upload-files">
        <p class={{ msg: true, done: !!this.uploadID }}>{this.uploadMsg}</p>
        <div class="files-box">{renderFiles()}</div>
        {renderBtnBox()}
      </main>
    );
  }

  render() {
    const renderMain = () => {
      if (this.uploadFiles) {
        return this.renderUploadFiles();
      }
      if (this.user) {
        return this.renderInputFiles();
      }
      return this.renderInputID();
    };

    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().encrypt.title}
        ></stencil-route-title>

        <h1>{msgs().encrypt.title}</h1>

        {renderMain()}
      </Host>
    );
  }
}
