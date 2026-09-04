(() => {
  const expectedHash = '952395b66c20e29ee3989e2924de6a5e31e2e2c0ec8daa1c5fa7cf79286b1e06';
  const sources = [
    'https://cdn.jsdelivr.net/npm/decap-cms@3.15.1/dist/decap-cms.js',
    '/admin/decap-cms.js'
  ];
  const controllers = sources.map(() => new AbortController());
  const status = document.querySelector('#nc-root p');

  const toHex = (bytes) =>
    [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

  const fetchVerified = async (url, controller) => {
    const response = await fetch(url, {
      cache: 'force-cache',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const bytes = await response.arrayBuffer();
    const digest = toHex(await crypto.subtle.digest('SHA-256', bytes));
    if (digest !== expectedHash) throw new Error('Integrity check failed');
    return new TextDecoder().decode(bytes);
  };

  Promise.any(sources.map((source, index) => fetchVerified(source, controllers[index])))
    .then((code) => {
      controllers.forEach((controller) => controller.abort());
      (0, eval)(code);
    })
    .catch(() => {
      if (status) status.textContent = '文章管理后台加载失败，请刷新页面或切换网络后重试。';
    });
})();
