let loadingElement: HTMLElement;

export const showLoading = async (f: () => Promise<void>) => {
  if (!loadingElement) {
    const el = document.createElement('a-loading');
    document.body.appendChild(el);
    loadingElement = el;
  }

  loadingElement.style.display = null;
  try {
    await f();
  } finally {
    loadingElement.style.display = 'none';
  }
};
