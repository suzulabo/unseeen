export const msgs = {
  label: {
    back: '戻る',
    next: '次へ',
    password: 'パスワード',
    hidePassword: 'パスワードを隠す',
    cancel: 'キャンセル',
    home: 'Home',
  },
  root: {
    errors: {
      desc: 'エラーが発生しました。\nしばらくしてから再度お試しください。',
      showBtn: 'エラー内容を表示',
      closeBtn: '閉じる',
    },
  },
  start: {
    welcome: 'Unseenへようこそ',
    inputPassword: {
      desc:
        'Unseeenでファイルを受け取る準備を行います。\nパスワードを入力してください。\nこのパスワードはファイルの受け取り時に必要になります。',
    },
    confirm: {
      desc:
        '以下の内容でUnseeenに登録します。\n(IDはランダムに決定されます)\nよろしければ登録ボタンを押してください。',
    },
    registerBtn: '登録',
    error:
      '登録中にエラーが発生しました。\nしばらくしてからお試しいただき、解決しない場合はお問い合わせください。',
    completed:
      '登録が完了しました！\nあなたのIDを伝えてファイルを送ってもらいましょう。',
  },
  home: {
    start: {
      title: 'Unseeenを始める',
      desc:
        'IDを作成してファイルを送ってもらいましょう。\nメール認証やSNSのログインなど、個人情報は一切不要です。',
      naviBtn: 'ID作成へ',
    },
    recipient: {
      title: 'ファイルを送ってもらう',
      desc: 'あなたのIDを伝えてファイルを送ってもらいましょう',
      copyBtn: 'IDをコピー',
    },
    sendFile: {
      title: 'ファイルを送る',
      desc:
        'IDをもらった相手にファイルを送りましょう。\nファイルはアップロード前に暗号化されるため、安全に送付できます。',
      naviBtn: '送信フォームへ',
      historyBtn: '送信履歴をみる',
    },
    recvFile: {
      title: 'ファイルを受け取る',
      desc: '送ってもらったファイルを受け取りましょう。',
      naviBtn: '受取フォームへ',
    },
  },
  encrypt: {
    title: 'ファイルを送る',
    inputID: {
      desc: '送り先のIDを入力してください',
      btn: '確認',
      userNotFound: 'このIDは登録されていません。IDをご確認ください。',
    },
    inputFiles: {
      recipientID: '送信先ID:',
      fileinput:
        'クリックして暗号化するファイルを選択してください\nドラッグ＆ドロップでも追加できます',
      limit:
        '同時に10ファイルまで選択できます。\nファイルサイズは1ファイル100MB、合計200MBまで可能です。',
      total: '合計',
      sizeError: 'アップロードできるファイルサイズを超えています',
      countError: 'アップロードできるファイル数を超えています',
      uploadBtn: 'アップロード',
    },
    uploading: {
      getUser: 'ユーザー情報を取得しています...',
      callAllowUpload: 'アップロード権限を取得しています...',
      upload: 'ファイルをアップロードしています...',
      indexFile: 'アップロードを登録しています...',
      done: '完了しました',
    },
    uploaded: {
      desc: 'アップロードが完了しました。\n受取IDは以下になります。',
      copyBtn: 'IDをコピー',
      error:
        'アップロード中にエラーが発生しました。\nしばらくしてから再度お試しください。\n解決しない場合はお手数ですがお問い合わせよりご連絡ください。',
    },
  },
  uploadHistory: {
    title: 'アップロード履歴',
    log: {
      destID: '送り先ID: ',
      recvID: '受取ID: ',
    },
  },
  decrypt: {
    title: 'ファイルを受け取る',
    inputPassword: {
      desc: 'パスワードを入力してください',
      btn: '次へ',
      invalid: 'パスワードが違います',
    },
    inputID: {
      desc: '受取IDを入力してください',
      btn: '確認',
      notFound: 'このIDは登録されていません。IDをご確認ください。',
    },
  },
  settings: {
    title: '設定',
    start: {
      title: 'IDの作成',
      desc:
        'IDを作成してファイルを送ってもらいましょう。\nメール認証やSNSのログインなど、個人情報は一切不要です。',
      naviBtn: 'ID作成へ',
    },
    changePassword: {
      title: 'パスワードの変更',
      btn: '変更する',
    },
    deleteID: {
      title: 'IDの削除',
      desc:
        'IDを削除します。削除後は過去に送られたファイルの暗号化の解除ができなくなるため、' +
        'しばらく利用しない場合はIDを削除したほうが安全です。',
      btn: '削除する',
    },
  },
  changePassword: {
    title: 'パスワードの変更',
    curPassword: '現在のパスワード',
    newPassword: '新しいパスワード',
    passwordError: 'パスワードが違います',
    btn: '変更する',
    updated: '変更しました',
  },
  deleteUser: {
    title: 'IDの削除',
    desc: '以下のIDを削除します。\n(この操作は元に戻せません)',
    input: 'パスワードを入力してください',
    forgetDesc:
      'パスワードを忘れた場合は代わりにIDを入力してください。\n' +
      'ブラウザのデータのみ削除します。\n' +
      'このIDへのファイル送信が行える状態は続きますが、暗号化の解除に必要なデータは削除されているためファイルの受け取りはできません。\n' +
      '未使用の状態が90日間続けば登録は自動的に削除されます。',
    passwordError: 'パスワードが違います',
    deleted: '削除しました',
    btn: '削除する',
  },
  deletedUser: {
    desc:
      'このブラウザに保存されているIDの登録は解除されました。\n' +
      '(90日間ご利用がないと、登録は自動的に解除されます)\n' +
      '新しいIDを作成してご利用ください',
    storedID: '保存されていたID: ',
  },
};
