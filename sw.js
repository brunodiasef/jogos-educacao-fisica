// Service Worker dos Jogos de Educação Física.
// Estratégia: tenta a rede primeiro (o aluno sempre recebe a versão mais nova)
// e, sem internet, usa a cópia guardada no aparelho.
// Ao publicar uma versão nova, basta mudar o número abaixo para limpar o cache antigo.
const CACHE = 'jogos-ef-v2';

const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './logo-prof-bruno.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;

  evento.respondWith(
    fetch(pedido)
      .then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put(pedido, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(pedido).then((guardado) => guardado || caches.match('./index.html')))
  );
});
