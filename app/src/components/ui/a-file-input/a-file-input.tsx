import {
  Component,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  Listen,
} from '@stencil/core';

@Component({
  tag: 'a-file-input',
  styleUrl: 'a-file-input.scss',
  shadow: false,
})
export class FileInput {
  @Prop()
  multiple: boolean;

  @Event()
  selectFile: EventEmitter<FileList>;

  private fileInput: HTMLInputElement;

  @Listen('dragover', { target: 'document', passive: false })
  handleDocumentDragOver(ev: DragEvent) {
    ev.preventDefault();
  }

  @Listen('drop', { target: 'document', passive: false })
  handleDocumentDrop(ev: DragEvent) {
    ev.preventDefault();
  }

  render() {
    return (
      <Host
        onClick={() => {
          this.fileInput?.click();
        }}
        onDragOver={(ev: DragEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
          ev.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(ev: DragEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
          if (ev.dataTransfer.files?.length > 0) {
            this.selectFile.emit(ev.dataTransfer.files);
          }
        }}
      >
        <ion-icon
          icon={this.multiple ? 'documents-outline' : 'document-outline'}
        ></ion-icon>
        <slot></slot>
        <input
          ref={(el) => {
            this.fileInput = el;
          }}
          type="file"
          multiple={this.multiple}
          onChange={(ev) => {
            const el = ev.target as HTMLInputElement;
            this.selectFile.emit(el.files);
            el.value = '';
          }}
        ></input>
      </Host>
    );
  }
}
