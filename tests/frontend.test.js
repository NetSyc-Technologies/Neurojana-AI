import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/main.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\r?\n/gm, '')
  .replace(/import\.meta\.env/g, 'env');

function setup(fetchImpl, { reduced = false } = {}) {
  const elements = new Map();
  let focused;
  function element(id) {
    const attributes = new Map();
    const listeners = {};
    const result = {
      value: '', hidden: id === 'success-state', disabled: false, className: '',
      textContent: '', complete: false, validity: { valid: true },
      setAttribute: (key, value) => attributes.set(key, value),
      removeAttribute: (key) => attributes.delete(key),
      getAttribute: (key) => attributes.get(key),
      addEventListener: (name, fn) => { listeners[name] = fn; },
      dispatch: (name) => listeners[name]?.({ preventDefault() {} }),
      focus: () => { focused = id; },
    };
    result.classList = {
      contains: (name) => result.className.split(' ').includes(name),
      add: (name) => { result.className += ` ${name}`; },
      remove: (name) => { result.className = result.className.split(' ').filter(x => x !== name).join(' '); },
      toggle: (name, state) => state ? result.classList.add(name) : result.classList.remove(name),
    };
    return result;
  }
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, element(id));
    return elements.get(id);
  };
  const storage = new Map();
  let timeoutCallback;
  const requests = [];
  const context = {
    env: {},
    document: { getElementById: get, documentElement: get('html') },
    window: { matchMedia: () => ({ matches: reduced, addEventListener() {} }) },
    localStorage: { getItem: key => storage.get(key), setItem: (key,value) => storage.set(key,value) },
    AbortController, TypeError,
    setTimeout: fn => { timeoutCallback = fn; return 1; }, clearTimeout() {},
    fetch: async (...args) => { requests.push(args); return fetchImpl(...args); },
  };
  vm.runInNewContext(source, context);
  get('email').value = 'person@example.com';
  return { get, requests, submit: () => get('subscribe-form').dispatch('submit'), focused: () => focused, timeout: () => timeoutCallback() };
}
const success = () => ({ ok: true, status: 200, json: async () => ({message:'Subscribed.'}) });

test('invalid email stays local and focuses the field', async () => {
  const ui = setup(success);
  ui.get('email').validity.valid = false;
  await ui.submit();
  assert.equal(ui.requests.length, 0);
  assert.equal(ui.get('email').getAttribute('aria-invalid'), 'true');
  assert.equal(ui.focused(), 'email');
});

test('success submits a normalized address and exposes focused confirmation', async () => {
  const ui = setup(success);
  ui.get('email').value = '  PERSON@Example.COM  ';
  await ui.submit();
  assert.equal(JSON.parse(ui.requests[0][1].body).email, 'person@example.com');
  assert.equal(ui.get('subscribe-form').hidden, true);
  assert.equal(ui.get('success-state').hidden, false);
  assert.equal(ui.focused(), 'success-state');
});

test('server rejection is never bypassed and permits a deliberate retry', async () => {
  let attempts = 0;
  const ui = setup(() => ++attempts === 1 ? {ok:false,status:429,json:async()=>({message:'Limited'})} : success());
  await ui.submit();
  assert.equal(ui.requests.length, 1);
  assert.equal(ui.get('success-state').hidden, true);
  assert.equal(ui.get('email').disabled, false);
  assert.match(ui.get('form-message').textContent, /Too many attempts/);
  await ui.submit();
  assert.equal(ui.get('success-state').hidden, false);
});

test('static-host HTML must not be treated as subscription success', async () => {
  const ui = setup(() => ({ok:true,status:200,json:async()=>{throw new SyntaxError();}}));
  await ui.submit();
  assert.equal(ui.get('success-state').hidden, true);
  assert.equal(ui.get('subscribe-button').disabled, false);
  assert.match(ui.get('form-message').textContent, /try again/);
});

test('pending requests block duplicate submissions', async () => {
  let resolve;
  const ui = setup(() => new Promise(done => {resolve=done;}));
  const pending = ui.submit();
  await ui.submit();
  assert.equal(ui.requests.length, 1);
  assert.equal(ui.get('subscribe-form').getAttribute('aria-busy'), 'true');
  resolve(success());
  await pending;
  assert.equal(ui.get('subscribe-form').getAttribute('aria-busy'), undefined);
});

test('timeout recovers the controls with a useful message', async () => {
  const ui = setup((_url, {signal}) => new Promise((_resolve,reject) => {
    signal.addEventListener('abort', () => reject({name:'AbortError'}));
  }));
  const pending = ui.submit();
  ui.timeout();
  await pending;
  assert.equal(ui.get('email').disabled, false);
  assert.equal(ui.get('subscribe-button').disabled, false);
  assert.match(ui.get('form-message').textContent, /longer than expected/);
});

test('offline errors preserve the form for retry', async () => {
  const ui = setup(() => { throw new TypeError('Failed to fetch'); });
  await ui.submit();
  assert.equal(ui.get('success-state').hidden, true);
  assert.match(ui.get('form-message').textContent, /Check your connection/);
});

test('motion control pauses decoration and respects reduced-motion preference', () => {
  const ui = setup(success);
  ui.get('motion-toggle').dispatch('click');
  assert.equal(ui.get('html').classList.contains('motion-paused'), true);
  assert.equal(ui.get('motion-toggle').textContent, 'Resume motion');
  const reduced = setup(success, {reduced:true});
  assert.equal(reduced.get('motion-toggle').hidden, true);
  assert.equal(reduced.get('html').classList.contains('motion-paused'), true);
});
