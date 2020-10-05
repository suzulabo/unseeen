import { Component, h, Host, State } from '@stencil/core';
import { getApp, App } from '../../../app/app';
import { msgs } from '../../../i18n/i18n';
import { PromiseValue } from 'type-fest';
import { humanFileSize, formatDate } from '../../../app/utils';

@Component({
  tag: 'app-upload-history',
  styleUrl: 'app-upload-history.scss',
})
export class AppUploadHistory {
  private app = getApp();

  @State()
  logs: PromiseValue<ReturnType<App['listUpdateLogs']>>;

  componentWillLoad() {
    void this.app.listUpdateLogs().then((v) => {
      this.logs = v;
    });
  }

  render() {
    const renderList = () => {
      return this.logs?.map((v) => {
        return (
          <div class="log">
            <div class="time">{formatDate(v.time)}</div>
            <div class="head">
              <span class="dest">
                {msgs().uploadHistory.log.destID}
                <strong>{v.value.destID}</strong>
              </span>
              <span class="path">
                {msgs().uploadHistory.log.recvID}
                <strong>{v.value.path}</strong>
              </span>
              <ion-icon
                name="copy-outline"
                class="clickable"
                onClick={() => {
                  void navigator.clipboard.writeText(v.value.path);
                }}
              ></ion-icon>
            </div>
            <div class="files box">
              {v.value.files.map((f) => {
                return [
                  <span class="name">{f.name}</span>,
                  <span class="size">({humanFileSize(f.size)})</span>,
                ];
              })}
            </div>
          </div>
        );
      });
    };

    return (
      <Host>
        <stencil-route-title
          pageTitle={msgs().uploadHistory.title}
        ></stencil-route-title>
        <h1>{msgs().uploadHistory.title}</h1>
        <div class="list">{renderList()}</div>
        <div class="back-btn">
          <stencil-route-link url="/">{msgs().label.back}</stencil-route-link>
        </div>
      </Host>
    );
  }
}
