/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface ADownloadLink {
        "blob": Blob;
        "filename": string;
    }
    interface AFileInput {
        "multiple": boolean;
    }
    interface ALoading {
    }
    interface AppChangePassword {
    }
    interface AppDecrypt {
    }
    interface AppDeleteUser {
    }
    interface AppDeletedUser {
    }
    interface AppEncrypt {
    }
    interface AppHome {
    }
    interface AppRoot {
    }
    interface AppSettings {
    }
    interface AppStart {
    }
    interface AppTerms {
    }
    interface AppUploadHistory {
    }
}
declare global {
    interface HTMLADownloadLinkElement extends Components.ADownloadLink, HTMLStencilElement {
    }
    var HTMLADownloadLinkElement: {
        prototype: HTMLADownloadLinkElement;
        new (): HTMLADownloadLinkElement;
    };
    interface HTMLAFileInputElement extends Components.AFileInput, HTMLStencilElement {
    }
    var HTMLAFileInputElement: {
        prototype: HTMLAFileInputElement;
        new (): HTMLAFileInputElement;
    };
    interface HTMLALoadingElement extends Components.ALoading, HTMLStencilElement {
    }
    var HTMLALoadingElement: {
        prototype: HTMLALoadingElement;
        new (): HTMLALoadingElement;
    };
    interface HTMLAppChangePasswordElement extends Components.AppChangePassword, HTMLStencilElement {
    }
    var HTMLAppChangePasswordElement: {
        prototype: HTMLAppChangePasswordElement;
        new (): HTMLAppChangePasswordElement;
    };
    interface HTMLAppDecryptElement extends Components.AppDecrypt, HTMLStencilElement {
    }
    var HTMLAppDecryptElement: {
        prototype: HTMLAppDecryptElement;
        new (): HTMLAppDecryptElement;
    };
    interface HTMLAppDeleteUserElement extends Components.AppDeleteUser, HTMLStencilElement {
    }
    var HTMLAppDeleteUserElement: {
        prototype: HTMLAppDeleteUserElement;
        new (): HTMLAppDeleteUserElement;
    };
    interface HTMLAppDeletedUserElement extends Components.AppDeletedUser, HTMLStencilElement {
    }
    var HTMLAppDeletedUserElement: {
        prototype: HTMLAppDeletedUserElement;
        new (): HTMLAppDeletedUserElement;
    };
    interface HTMLAppEncryptElement extends Components.AppEncrypt, HTMLStencilElement {
    }
    var HTMLAppEncryptElement: {
        prototype: HTMLAppEncryptElement;
        new (): HTMLAppEncryptElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLAppSettingsElement extends Components.AppSettings, HTMLStencilElement {
    }
    var HTMLAppSettingsElement: {
        prototype: HTMLAppSettingsElement;
        new (): HTMLAppSettingsElement;
    };
    interface HTMLAppStartElement extends Components.AppStart, HTMLStencilElement {
    }
    var HTMLAppStartElement: {
        prototype: HTMLAppStartElement;
        new (): HTMLAppStartElement;
    };
    interface HTMLAppTermsElement extends Components.AppTerms, HTMLStencilElement {
    }
    var HTMLAppTermsElement: {
        prototype: HTMLAppTermsElement;
        new (): HTMLAppTermsElement;
    };
    interface HTMLAppUploadHistoryElement extends Components.AppUploadHistory, HTMLStencilElement {
    }
    var HTMLAppUploadHistoryElement: {
        prototype: HTMLAppUploadHistoryElement;
        new (): HTMLAppUploadHistoryElement;
    };
    interface HTMLElementTagNameMap {
        "a-download-link": HTMLADownloadLinkElement;
        "a-file-input": HTMLAFileInputElement;
        "a-loading": HTMLALoadingElement;
        "app-change-password": HTMLAppChangePasswordElement;
        "app-decrypt": HTMLAppDecryptElement;
        "app-delete-user": HTMLAppDeleteUserElement;
        "app-deleted-user": HTMLAppDeletedUserElement;
        "app-encrypt": HTMLAppEncryptElement;
        "app-home": HTMLAppHomeElement;
        "app-root": HTMLAppRootElement;
        "app-settings": HTMLAppSettingsElement;
        "app-start": HTMLAppStartElement;
        "app-terms": HTMLAppTermsElement;
        "app-upload-history": HTMLAppUploadHistoryElement;
    }
}
declare namespace LocalJSX {
    interface ADownloadLink {
        "blob"?: Blob;
        "filename"?: string;
    }
    interface AFileInput {
        "multiple"?: boolean;
        "onSelectFile"?: (event: CustomEvent<FileList>) => void;
    }
    interface ALoading {
    }
    interface AppChangePassword {
    }
    interface AppDecrypt {
    }
    interface AppDeleteUser {
    }
    interface AppDeletedUser {
    }
    interface AppEncrypt {
    }
    interface AppHome {
    }
    interface AppRoot {
    }
    interface AppSettings {
    }
    interface AppStart {
    }
    interface AppTerms {
    }
    interface AppUploadHistory {
    }
    interface IntrinsicElements {
        "a-download-link": ADownloadLink;
        "a-file-input": AFileInput;
        "a-loading": ALoading;
        "app-change-password": AppChangePassword;
        "app-decrypt": AppDecrypt;
        "app-delete-user": AppDeleteUser;
        "app-deleted-user": AppDeletedUser;
        "app-encrypt": AppEncrypt;
        "app-home": AppHome;
        "app-root": AppRoot;
        "app-settings": AppSettings;
        "app-start": AppStart;
        "app-terms": AppTerms;
        "app-upload-history": AppUploadHistory;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "a-download-link": LocalJSX.ADownloadLink & JSXBase.HTMLAttributes<HTMLADownloadLinkElement>;
            "a-file-input": LocalJSX.AFileInput & JSXBase.HTMLAttributes<HTMLAFileInputElement>;
            "a-loading": LocalJSX.ALoading & JSXBase.HTMLAttributes<HTMLALoadingElement>;
            "app-change-password": LocalJSX.AppChangePassword & JSXBase.HTMLAttributes<HTMLAppChangePasswordElement>;
            "app-decrypt": LocalJSX.AppDecrypt & JSXBase.HTMLAttributes<HTMLAppDecryptElement>;
            "app-delete-user": LocalJSX.AppDeleteUser & JSXBase.HTMLAttributes<HTMLAppDeleteUserElement>;
            "app-deleted-user": LocalJSX.AppDeletedUser & JSXBase.HTMLAttributes<HTMLAppDeletedUserElement>;
            "app-encrypt": LocalJSX.AppEncrypt & JSXBase.HTMLAttributes<HTMLAppEncryptElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "app-settings": LocalJSX.AppSettings & JSXBase.HTMLAttributes<HTMLAppSettingsElement>;
            "app-start": LocalJSX.AppStart & JSXBase.HTMLAttributes<HTMLAppStartElement>;
            "app-terms": LocalJSX.AppTerms & JSXBase.HTMLAttributes<HTMLAppTermsElement>;
            "app-upload-history": LocalJSX.AppUploadHistory & JSXBase.HTMLAttributes<HTMLAppUploadHistoryElement>;
        }
    }
}
