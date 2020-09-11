/*
https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
*/
export const humanFileSize = (size: number) => {
  if (size < 0) {
    return '';
  }
  if (size == 0) {
    return '0 B';
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    Number((size / Math.pow(1024, i)).toFixed(2)) +
    ' ' +
    ['B', 'KB', 'MB', 'GB', 'TB'][i]
  );
};

export const concatArray = (...arrays: Uint8Array[]) => {
  const len = arrays.reduce((acc, array) => {
    return acc + array.byteLength;
  }, 0);
  const result = new Uint8Array(len);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.byteLength;
  }
  return result;
};

export const readFile = (f: Blob, progress?: (loaded: number) => boolean) => {
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      resolve(new Uint8Array(ev.target.result as ArrayBuffer));
    };
    reader.onerror = (ev) => {
      reject(ev.target.error);
    };
    reader.onprogress = (ev) => {
      if (progress) {
        if (progress(ev.loaded)) {
          reader.abort();
          resolve(null);
        }
      }
    };

    reader.readAsArrayBuffer(f);
  });
};

export const strToBin = (s: string) => {
  return new TextEncoder().encode(s);
};

export const binToStr = (v: Uint8Array) => {
  return new TextDecoder().decode(v);
};

export const wait = (msec = 1000) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
};

export const atLeast = async <T>(p: Promise<T>, msec = 1000) => {
  const r = await Promise.all([p, wait(msec)]);
  return r[0];
};

export const formatDate = (d: Date, second?: boolean) => {
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    second: second ? 'numeric' : null,
  });
};
