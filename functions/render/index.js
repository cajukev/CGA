var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});

// node_modules/@sveltejs/kit/dist/install-fetch.js
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_zlib = __toModule(require("zlib"));
var import_stream = __toModule(require("stream"));
var import_util = __toModule(require("util"));
var import_crypto = __toModule(require("crypto"));
var import_url = __toModule(require("url"));
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
var { Readable } = import_stream.default;
var wm = new WeakMap();
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
var Blob = class {
  constructor(blobParts = [], options2 = {}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob) {
        buffer = element;
      } else {
        buffer = Buffer.from(typeof element === "string" ? element : String(element));
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });
    const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
    wm.set(this, {
      type: /[^\u0020-\u007E]/.test(type) ? "" : type,
      size,
      parts
    });
  }
  get size() {
    return wm.get(this).size;
  }
  get type() {
    return wm.get(this).type;
  }
  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    return Readable.from(read(wm.get(this).parts));
  }
  slice(start = 0, end = this.size, type = "") {
    const { size } = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) {
          break;
        }
      }
    }
    const blob = new Blob([], { type: String(type).toLowerCase() });
    Object.assign(wm.get(blob), { size: span, parts: blobParts });
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
};
Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var fetchBlob = Blob;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && object[NAME] === "AbortSignal";
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (import_util.types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof import_stream.default)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = import_stream.default.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof import_stream.default) {
      body.on("error", (err) => {
        const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
        this[INTERNALS$2].error = error3;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new fetchBlob([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
    p1 = new import_stream.PassThrough({ highWaterMark });
    p2 = new import_stream.PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof import_stream.default) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request;
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2].boundary);
  }
  return null;
};
var writeToStream = (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    body.stream().pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
var validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw err;
  }
};
var validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const err = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
    throw err;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers) {
      const raw = init2.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback) {
    for (const name of this.keys()) {
      callback(this.get(name), name);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status || 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response(clone(this, this.highWaterMark), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response.prototype, {
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
};
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request = class extends Body {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal !== null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return (0, import_url.format)(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS];
  const headers = new Headers(request[INTERNALS].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
var AbortError = class extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = src(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}

// node_modules/@sveltejs/kit/dist/adapter-utils.js
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/ssr.js
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${branch.map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page.path)},
						query: new URLSearchParams(${s$1(page.query.toString())}),
						params: ${s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base, path) {
  const base_match = absolute.exec(base);
  const path_match = absolute.exec(path);
  const baseparts = path_match ? [] : base.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: {
              "content-type": asset.type
            }
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith(options2.paths.base || "/")) {
          const relative = resolved.replace(options2.paths.base, "");
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded.context,
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    if (state.fetched) {
      return {
        status: 500,
        headers: {},
        body: `Bad request in load function: failed to fetch ${state.fetched}`
      };
    }
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler2) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler2({ ...request, params });
    const preface = `Invalid response from route ${request.path}`;
    if (response) {
      if (typeof response !== "object") {
        return error(`${preface}: expected an object, got ${typeof response}`);
      }
      let { status = 200, body, headers = {} } = response;
      headers = lowercase_keys(headers);
      const type = headers["content-type"];
      const is_type_textual = isContentTypeTextual(type);
      if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
        return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
      }
      let normalized_body;
      if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
        headers = { ...headers, "content-type": "application/json; charset=utf-8" };
        normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
      } else {
        normalized_body = body;
      }
      return { status, body: normalized_body, headers };
    }
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  if (typeof raw === "string") {
    const [type, ...directives] = headers["content-type"].split(/;\s*/);
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !incoming.path.split("/").pop().includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: null,
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$3 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\texport let props_3 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}>\\n\\t\\t\\t\\t\\t{#if components[3]}\\n\\t\\t\\t\\t\\t\\t<svelte:component this={components[3]} {...(props_3 || {})}/>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</svelte:component>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AA2DC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  let { props_3 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  if ($$props.props_3 === void 0 && $$bindings.props_3 && props_3 !== void 0)
    $$bindings.props_3(props_3);
  $$result.css.add(css$3);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {
        default: () => `${components[3] ? `${validate_component(components[3] || missing_component, "svelte:component").$$render($$result, Object.assign(props_3 || {}), {}, {})}` : ``}`
      })}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<link rel="stylesheet" href="app.css">\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "/." } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-e72a8e51.js",
      css: ["/./_app/assets/start-a8cd1609.css"],
      js: ["/./_app/start-e72a8e51.js", "/./_app/chunks/vendor-ca631d87.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      if (error22.frame) {
        console.error(error22.frame);
      }
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var d = decodeURIComponent;
var empty = () => ({});
var manifest = {
  assets: [{ "file": "app.css", "size": 6966, "type": "text/css" }, { "file": "arrow.svg", "size": 185, "type": "image/svg+xml" }, { "file": "bread1.jpg", "size": 57729, "type": "image/jpeg" }, { "file": "Cart.svg", "size": 807, "type": "image/svg+xml" }, { "file": "Certified.svg", "size": 1801, "type": "image/svg+xml" }, { "file": "delete_black_24dp.svg", "size": 203, "type": "image/svg+xml" }, { "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "fruits.jpg", "size": 215927, "type": "image/jpeg" }, { "file": "Logo.svg", "size": 1696, "type": "image/svg+xml" }, { "file": "strawberries.jpg", "size": 102563, "type": "image/jpeg" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/backstore\/products\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/backstore/__layout.svelte", "src/routes/backstore/products/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/backstore\/orders\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/backstore/__layout.svelte", "src/routes/backstore/orders/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/backstore\/users\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/backstore/__layout.svelte", "src/routes/backstore/users/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/products\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/products/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/products\/([^/]+?)\/?$/,
      params: (m) => ({ product: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/products/[product].svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/aisles\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/aisles/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/aisles\/([^/]+?)\/?$/,
      params: (m) => ({ aisle: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/aisles/[aisle].svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/signup\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/signup.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/login\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/login.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/cart\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/cart.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout$1;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$5;
  }),
  "src/routes/backstore/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/backstore/products/index.svelte": () => Promise.resolve().then(function() {
    return index$4;
  }),
  "src/routes/backstore/orders/index.svelte": () => Promise.resolve().then(function() {
    return index$3;
  }),
  "src/routes/backstore/users/index.svelte": () => Promise.resolve().then(function() {
    return index$2;
  }),
  "src/routes/products/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/products/[product].svelte": () => Promise.resolve().then(function() {
    return _product_;
  }),
  "src/routes/aisles/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/aisles/[aisle].svelte": () => Promise.resolve().then(function() {
    return _aisle_;
  }),
  "src/routes/signup.svelte": () => Promise.resolve().then(function() {
    return signup;
  }),
  "src/routes/login.svelte": () => Promise.resolve().then(function() {
    return login;
  }),
  "src/routes/cart.svelte": () => Promise.resolve().then(function() {
    return cart;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-d6995623.js", "css": [], "js": ["/./_app/pages/__layout.svelte-d6995623.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-bca0457e.js", "css": [], "js": ["/./_app/error.svelte-bca0457e.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-4f842c48.js", "css": [], "js": ["/./_app/pages/index.svelte-4f842c48.js", "/./_app/chunks/vendor-ca631d87.js", "/./_app/chunks/productcard-8c9a482b.js"], "styles": [] }, "src/routes/backstore/__layout.svelte": { "entry": "/./_app/pages/backstore/__layout.svelte-a7daa2a0.js", "css": ["/./_app/assets/pages/backstore/__layout.svelte-c99638ce.css"], "js": ["/./_app/pages/backstore/__layout.svelte-a7daa2a0.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/backstore/products/index.svelte": { "entry": "/./_app/pages/backstore/products/index.svelte-4d3b3742.js", "css": [], "js": ["/./_app/pages/backstore/products/index.svelte-4d3b3742.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/backstore/orders/index.svelte": { "entry": "/./_app/pages/backstore/orders/index.svelte-d9ffd40d.js", "css": [], "js": ["/./_app/pages/backstore/orders/index.svelte-d9ffd40d.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/backstore/users/index.svelte": { "entry": "/./_app/pages/backstore/users/index.svelte-95120d9a.js", "css": [], "js": ["/./_app/pages/backstore/users/index.svelte-95120d9a.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/products/index.svelte": { "entry": "/./_app/pages/products/index.svelte-38148282.js", "css": [], "js": ["/./_app/pages/products/index.svelte-38148282.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/products/[product].svelte": { "entry": "/./_app/pages/products/[product].svelte-26eade75.js", "css": [], "js": ["/./_app/pages/products/[product].svelte-26eade75.js", "/./_app/chunks/vendor-ca631d87.js", "/./_app/chunks/products-c696ac9e.js"], "styles": [] }, "src/routes/aisles/index.svelte": { "entry": "/./_app/pages/aisles/index.svelte-6eeeb5fe.js", "css": [], "js": ["/./_app/pages/aisles/index.svelte-6eeeb5fe.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/aisles/[aisle].svelte": { "entry": "/./_app/pages/aisles/[aisle].svelte-9423c146.js", "css": [], "js": ["/./_app/pages/aisles/[aisle].svelte-9423c146.js", "/./_app/chunks/vendor-ca631d87.js", "/./_app/chunks/products-c696ac9e.js", "/./_app/chunks/productcard-8c9a482b.js"], "styles": [] }, "src/routes/signup.svelte": { "entry": "/./_app/pages/signup.svelte-a3132cd0.js", "css": ["/./_app/assets/pages/signup.svelte-ba0cd2a6.css"], "js": ["/./_app/pages/signup.svelte-a3132cd0.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/login.svelte": { "entry": "/./_app/pages/login.svelte-62a3a089.js", "css": ["/./_app/assets/pages/signup.svelte-ba0cd2a6.css"], "js": ["/./_app/pages/login.svelte-62a3a089.js", "/./_app/chunks/vendor-ca631d87.js"], "styles": [] }, "src/routes/cart.svelte": { "entry": "/./_app/pages/cart.svelte-f24247af.js", "css": [], "js": ["/./_app/pages/cart.svelte-f24247af.js", "/./_app/chunks/vendor-ca631d87.js", "/./_app/chunks/products-c696ac9e.js"], "styles": [] } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"header-wrapper"}"><div class="${"header"}"><a href="${"/"}"><svg class="${"logo"}" viewBox="${"0 0 87 59"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M43.2363 57.815C54.9844 57.815 65.643 54.6413 73.3792 49.4839C81.1118 44.3288 85.9726 37.1522 85.9726 29.1575C85.9726 21.1628 81.1118 13.9862 73.3792 8.83112C65.643 3.67369 54.9844 0.5 43.2363 0.5C31.4881 0.5 20.8295 3.67369 13.0934 8.83112C5.36071 13.9862 0.5 21.1628 0.5 29.1575C0.5 37.1522 5.36071 44.3288 13.0934 49.4839C20.8295 54.6413 31.4881 57.815 43.2363 57.815Z"}" fill="${"#912338"}" stroke="${"white"}"></path><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M63.1448 16.8022H69.1107C71.2613 16.8022 75.5623 18.311 74.5564 22.2338L67.862 41.5464H60.6127L63.2488 33.9019H59.3987L56.381 41.5464H49.4438L57.7337 19.7192C58.7743 17.3051 62.1735 16.8022 63.1448 16.8022ZM65.5034 27.5984H61.8267L63.2488 23.7426C64.1853 21.8315 67.4805 22.6027 66.9602 23.7426L65.5034 27.5984Z"}" fill="${"white"}"></path><path d="${"M52.9817 23.2062L55.4445 16.7686L41.2926 16.8357C39.0727 16.8357 38.2055 17.1375 37.4077 18.9815L30.8868 35.8465C29.6728 39.6688 31.5458 41.58 33.8004 41.58H46.2527L51.5596 27.8332H44.1368L42.125 32.896H44.6224C44.9346 32.896 45.0387 33.1307 44.9693 33.2984L44.1021 35.3436C43.9287 35.6454 43.8246 35.746 43.4778 35.746H40.0092C39.5929 35.746 38.8299 35.2766 39.1767 34.1701L42.9922 24.2456C43.1656 23.7426 43.9287 23.2732 44.7958 23.2732L52.9817 23.2062Z"}" fill="${"white"}"></path><path d="${"M32.5867 23.1726L35.0494 16.7351L20.8975 16.8022C18.6776 16.8022 17.8105 17.1039 17.0127 18.948L10.4917 35.813C9.27773 39.6353 11.1508 41.5464 13.4054 41.5464H25.8576L28.1784 35.2095H19.1976C18.7467 35.2095 18.2264 34.8407 18.4132 34.3377L22.5971 24.212C22.7706 23.7091 23.5337 23.2397 24.4008 23.2397L32.5867 23.1726Z"}" fill="${"white"}"></path></svg></a>
		<div class="${"nav"}"><a href="${"/signup"}"><p>Sign Up</p></a>
			<a href="${"/login"}"><p>Login</p></a>
			<a href="${"/aisles"}"><p>Aisles</p></a>
			<a href="${"/cart"}"><svg class="${"cart-icon"}" viewBox="${"0 0 39 28"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M20.3624 15.4C21.412 15.4 22.3357 14.826 22.8115 13.958L27.8217 4.872C28.3395 3.948 27.6677 2.8 26.6041 2.8H5.89181L4.5763 0H0V2.8H2.79896L7.83709 13.426L5.94779 16.842C4.92617 18.718 6.26967 21 8.39688 21H25.1906V18.2H8.39688L9.93631 15.4H20.3624ZM7.22132 5.6H24.225L20.3624 12.6H10.5381L7.22132 5.6ZM8.39688 22.4C6.85745 22.4 5.61192 23.66 5.61192 25.2C5.61192 26.74 6.85745 28 8.39688 28C9.93631 28 11.1958 26.74 11.1958 25.2C11.1958 23.66 9.93631 22.4 8.39688 22.4ZM22.3917 22.4C20.8523 22.4 19.6067 23.66 19.6067 25.2C19.6067 26.74 20.8523 28 22.3917 28C23.9311 28 25.1906 26.74 25.1906 25.2C25.1906 23.66 23.9311 22.4 22.3917 22.4Z"}" fill="${"white"}"></path><circle cx="${"30"}" cy="${"16"}" r="${"8.5"}" fill="${"#912338"}" stroke="${"white"}"></circle><text x="${"27"}" y="${"21"}" fill="${"white"}" style="${"font-size: 0.7rem;"}">1</text></svg></a></div></div>
</div>`;
});
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"header"}"><a href="${"/backstore/products/"}">Footer</a></div>`;
});
var _layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${slots.default ? slots.default({}) : ``}

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var __layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout$1
});
function load$2({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load: load$2
});
var Productcard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { product } = $$props;
  if ($$props.product === void 0 && $$bindings.product && product !== void 0)
    $$bindings.product(product);
  return `<div class="${"p-card"}"><img${add_attribute("src", "/" + product.image, 0)}${add_attribute("alt", product.name, 0)} class="${"bg-image"}">
  <div class="${"image-gradient"}"></div>
  <div class="${"text"}"><h2 class="${"name"}">${escape2(product.name)}</h2>
    ${product.rebate != 0 ? `<p class="${"rebate-price"}">${escape2("$" + (product.price - product.rebate))}</p>` : `<div class="${"empty"}"></div>`}
    <a${add_attribute("href", "/products/" + product.name.split(" ").join("-"), 0)} class="${"learn-more"}">Learn More</a>
    <h2 class="${"price"}">${escape2("$" + product.price)}</h2></div>
</div>`;
});
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let products = [
    {
      name: "White Bread",
      price: 7.99,
      rebate: 5,
      image: "bread1.jpg"
    },
    {
      name: "White Bread",
      price: 7.99,
      rebate: 0,
      image: "bread1.jpg"
    },
    {
      name: "White Bread",
      price: 7.99,
      rebate: 5,
      image: "bread1.jpg"
    }
  ];
  let aisles = [
    { name: "fruits", image: "fruits.jpg" },
    { name: "fruits", image: "fruits.jpg" },
    { name: "fruits", image: "fruits.jpg" },
    { name: "fruits", image: "fruits.jpg" },
    { name: "fruits", image: "fruits.jpg" },
    { name: "fruits", image: "fruits.jpg" }
  ];
  return `<div class="${"home-wrapper"}"><div class="${"banner"}"><h1>Today\u2019s Featured Products</h1>
		<div class="${"products"}">${each(products, (product) => `${validate_component(Productcard, "ProductCard").$$render($$result, { product }, {}, {})}`)}</div></div>
	<div class="${"aisles-wrapper"}"><h1>Aisles</h1>
		<div class="${"aisles"}">${each(aisles, (aisle) => `<a${add_attribute("href", "/" + aisle.name, 0)}><img${add_attribute("src", aisle.image, 0)}${add_attribute("alt", aisle.name, 0)}>
					<h2>${escape2(aisle.name)}</h2>
				</a>`)}</div></div>
</div>`;
});
var index$5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var css$2 = {
  code: ".backstore-nav-wrapper.svelte-j2w6o.svelte-j2w6o.svelte-j2w6o{text-align:center}.backstore-nav-wrapper.svelte-j2w6o>.nav.svelte-j2w6o>a.svelte-j2w6o{color:var(--dark-text)}.backstore-nav-wrapper.svelte-j2w6o>.nav.svelte-j2w6o>a.svelte-j2w6o:not(.orders){margin-right:1rem}.grey-bg.svelte-j2w6o.svelte-j2w6o.svelte-j2w6o{background-color:#efefef}",
  map: '{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<h1>Super Secret Backstore</h1>\\r\\n<div class=\\"backstore-nav-wrapper\\">\\r\\n  <div class=\\"nav\\">\\r\\n    <a href=\\"/backstore/products/\\">Product List</a>\\r\\n    <a href=\\"/backstore/users/\\">User List</a>\\r\\n    <a class=\\"orders\\" href=\\"/backstore/orders/\\">Order List</a>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<div class=\\"grey-bg\\"><slot /></div>\\r\\n\\r\\n<style>\\r\\n  .backstore-nav-wrapper{\\r\\n    text-align: center;\\r\\n  }\\r\\n  .backstore-nav-wrapper > .nav > a{\\r\\n    color: var(--dark-text);\\r\\n    \\r\\n  }\\r\\n  .backstore-nav-wrapper > .nav > a:not(.orders){\\r\\n    margin-right: 1rem;\\r\\n  }\\r\\n\\t.grey-bg {\\r\\n\\t\\tbackground-color: #efefef;\\r\\n\\t}\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAYE,6DAAsB,CAAC,AACrB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,mCAAsB,CAAG,iBAAI,CAAG,cAAC,CAAC,AAChC,KAAK,CAAE,IAAI,WAAW,CAAC,AAEzB,CAAC,AACD,mCAAsB,CAAG,iBAAI,CAAG,cAAC,KAAK,OAAO,CAAC,CAAC,AAC7C,YAAY,CAAE,IAAI,AACpB,CAAC,AACF,QAAQ,uCAAC,CAAC,AACT,gBAAgB,CAAE,OAAO,AAC1B,CAAC"}'
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<h1>Super Secret Backstore</h1>
<div class="${"backstore-nav-wrapper svelte-j2w6o"}"><div class="${"nav svelte-j2w6o"}"><a href="${"/backstore/products/"}" class="${"svelte-j2w6o"}">Product List</a>
    <a href="${"/backstore/users/"}" class="${"svelte-j2w6o"}">User List</a>
    <a class="${"orders svelte-j2w6o"}" href="${"/backstore/orders/"}">Order List</a></div></div>

<div class="${"grey-bg svelte-j2w6o"}">${slots.default ? slots.default({}) : ``}</div>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var Products$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Product List</h1>`;
});
var index$4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Products$1
});
var Orders = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Order List</h1>`;
});
var index$3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Orders
});
var Users = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>User List</h1>`;
});
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Users
});
var Products = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Products
});
var productList = [
  {
    name: "Strawberries",
    aisle: "Fruits",
    price: 4.99,
    rebate: 0,
    origin: "Quebec",
    description: "Yummy yummy in my tummy",
    image: "fruits.jpg",
    amount: 1
  },
  {
    name: "White Bread",
    aisle: "Fruits",
    price: 4.99,
    rebate: 0,
    origin: "Quebec",
    description: "Yummy yummy in my tummy",
    image: "bread1.jpg",
    amount: 1
  },
  {
    name: "Strawberries",
    aisle: "Fruits",
    price: 4.99,
    rebate: 0,
    origin: "Quebec",
    description: "Yummy yummy in my tummy",
    image: "fruits.jpg",
    amount: 1
  }
];
var productList$1 = {
  productList
};
async function load$1({ page, fetch: fetch2, session, context }) {
  const product = page.path.split("/")[2];
  return { props: { product } };
}
var U5Bproductu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { product } = $$props;
  let currentProduct;
  console.log(product);
  productList$1.productList.forEach((item) => {
    if (product === item.name.split(" ").join("-")) {
      currentProduct = item;
    }
  });
  if ($$props.product === void 0 && $$bindings.product && product !== void 0)
    $$bindings.product(product);
  return `<div class="${"product-wrapper"}"><a${add_attribute("href", "/aisles/" + currentProduct.aisle, 0)}>${escape2(currentProduct.aisle)} Aisle</a>
	<h1 class="${"product-name"}">${escape2(currentProduct.name)}</h1>
	<div class="${"product"}"><img${add_attribute("src", "/" + currentProduct.image, 0)}${add_attribute("alt", currentProduct.name, 0)}>
		<div class="${"information"}"><div class="${"prices"}">${currentProduct.rebate != 0 ? `<p class="${"rebate-price"}">${escape2("$" + (currentProduct.price - currentProduct.rebate))}</p>` : `<div class="${"empty"}"></div>`}
				<p class="${"current-price"}">${escape2("$" + currentProduct.price)}</p></div>
			<button class="${"add-to-cart"}">Add To Cart</button>
			<div class="${"origin"}"><i>Made in ${escape2(currentProduct.origin)}</i>
				${currentProduct.origin == "Quebec" ? `<svg viewBox="${"0 0 16 15"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M15.7143 7.49286L13.9714 5.5L14.2143 2.86429L11.6357 2.27857L10.2857 0L7.85714 1.04286L5.42857 0L4.07857 2.27857L1.5 2.85714L1.74286 5.5L0 7.49286L1.74286 9.48571L1.5 12.1286L4.07857 12.7143L5.42857 15L7.85714 13.95L10.2857 14.9929L11.6357 12.7143L14.2143 12.1286L13.9714 9.49286L15.7143 7.49286ZM12.8929 8.55L12.4929 9.01429L12.55 9.62143L12.6786 11.0143L11.3214 11.3214L10.7214 11.4571L10.4071 11.9857L9.7 13.1857L8.42857 12.6357L7.85714 12.3929L7.29286 12.6357L6.02143 13.1857L5.31429 11.9929L5 11.4643L4.4 11.3286L3.04286 11.0214L3.17143 9.62143L3.22857 9.01429L2.82857 8.55L1.90714 7.5L2.82857 6.44286L3.22857 5.97857L3.16429 5.36429L3.03571 3.97857L4.39286 3.67143L4.99286 3.53571L5.30714 3.00714L6.01429 1.80714L7.28572 2.35714L7.85714 2.6L8.42143 2.35714L9.69286 1.80714L10.4 3.00714L10.7143 3.53571L11.3143 3.67143L12.6714 3.97857L12.5429 5.37143L12.4857 5.97857L12.8857 6.44286L13.8071 7.49286L12.8929 8.55Z"}" fill="${"#912338"}"></path><path d="${"M12.8929 8.55L12.4929 9.01429L12.55 9.62143L12.6786 11.0143L11.3214 11.3214L10.7214 11.4571L10.4071 11.9857L9.7 13.1857L8.42857 12.6357L7.85714 12.3929L7.29286 12.6357L6.02143 13.1857L5.31429 11.9929L5 11.4643L4.4 11.3286L3.04286 11.0214L3.17143 9.62143L3.22857 9.01429L2.82857 8.55L1.90714 7.5L2.82857 6.44286L3.22857 5.97857L3.16429 5.36429L3.03571 3.97857L4.39286 3.67143L4.99286 3.53571L5.30714 3.00714L6.01429 1.80714L7.28572 2.35714L7.85714 2.6L8.42143 2.35714L9.69286 1.80714L10.4 3.00714L10.7143 3.53571L11.3143 3.67143L12.6714 3.97857L12.5429 5.37143L12.4857 5.97857L12.8857 6.44286L13.8071 7.49286L12.8929 8.55Z"}" fill="${"#912338"}"></path><path d="${"M6.49261 8.75L4.83546 7.08572L3.77832 8.15L6.49261 10.8714L11.7355 5.61429L10.6783 4.55L6.49261 8.75Z"}" fill="${"white"}"></path></svg>` : ``}</div>
			<div class="${"description"}"><p>Detailed Description</p>
				<svg viewBox="${"0 0 11 6"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M5.51288 5.04852L9.41569 0L11 0L6.13115 6H4.88173L0 0L1.59719 0L5.51288 5.04852Z"}" fill="${"#561925"}"></path></svg></div></div></div>
</div>`;
});
var _product_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bproductu5D,
  load: load$1
});
var Aisles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Hello, welcome to aisles</h1>
<a href="${"/aisles/fruits"}">fruits</a>
<a href="${"/aisles/vegetables"}">veggies</a>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Aisles
});
async function load({ page, fetch: fetch2, session, context }) {
  const aisle = page.path.split("/")[2];
  return { props: { aisle } };
}
var U5Baisleu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { aisle } = $$props;
  let aisleProducts = [];
  productList$1.productList.forEach((product) => {
    if (aisle.slice(1) === product.aisle.slice(1)) {
      aisleProducts.push(product);
    }
  });
  if ($$props.aisle === void 0 && $$bindings.aisle && aisle !== void 0)
    $$bindings.aisle(aisle);
  return `<div class="${"aisle-wrapper"}"><div class="${"aisle"}"><h1>${escape2(aisle.charAt(0).toUpperCase() + aisle.slice(1))} Aisle</h1>
		<div class="${"products"}">${each(aisleProducts, (product) => `${validate_component(Productcard, "Productcard").$$render($$result, { product }, {}, {})}`)}</div></div>
</div>`;
});
var _aisle_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Baisleu5D,
  load
});
var css$1 = {
  code: ".form-wrapper.svelte-1m3f9h4.svelte-1m3f9h4{display:flex;flex-direction:column;align-items:center;width:100%}form.svelte-1m3f9h4.svelte-1m3f9h4{display:flex;flex-direction:column;width:100%;margin-top:1.5rem;max-width:30rem;border:0.1rem solid var(--main-color);background-color:white;filter:drop-shadow(0px 0.25rem 0.5rem rgba(0, 0, 0, 0.25));padding:1rem;color:var(--dark-text)}form.svelte-1m3f9h4>input[type='text'].svelte-1m3f9h4,form.svelte-1m3f9h4>input[type='password'].svelte-1m3f9h4{border:0.1rem solid var(--main-color);padding:0.2rem}form.svelte-1m3f9h4>input.svelte-1m3f9h4,form.svelte-1m3f9h4>label.svelte-1m3f9h4{margin-bottom:0.5rem}form.svelte-1m3f9h4>button.svelte-1m3f9h4{width:5rem}",
  map: `{"version":3,"file":"signup.svelte","sources":["signup.svelte"],"sourcesContent":["<h1>User Sign Up</h1>\\r\\n<div class=\\"form-wrapper\\">\\r\\n\\t<form action=\\"\\">\\r\\n\\t\\t<label for=\\"fname\\">First Name:</label>\\r\\n\\t\\t<input type=\\"text\\" name=\\"fname\\" id=\\"fname\\" />\\r\\n\\t\\t<label for=\\"email\\">Email*:</label>\\r\\n\\t\\t<input type=\\"text\\" name=\\"email\\" id=\\"email\\" required />\\r\\n\\t\\t<label for=\\"password\\">Password*:</label>\\r\\n\\t\\t<input type=\\"password\\" name=\\"password\\" id=\\"password\\" required />\\r\\n\\t\\t<label for=\\"password2\\">Confirm Password*:</label>\\r\\n\\t\\t<input type=\\"password\\" name=\\"password2\\" id=\\"password2 required\\" />\\r\\n\\t\\t<button >Submit</button>\\r\\n\\t</form>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .form-wrapper{\\r\\n    display: flex;\\r\\n\\t\\tflex-direction: column;\\r\\n    align-items: center;\\r\\n\\t\\twidth: 100%;\\r\\n  }\\r\\n\\tform {\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\tflex-direction: column;\\r\\n\\t\\twidth: 100%;\\r\\n    margin-top: 1.5rem;\\r\\n    max-width: 30rem;\\r\\n    border: 0.1rem solid var(--main-color);\\r\\n    background-color: white;  \\r\\n    filter: drop-shadow(0px 0.25rem 0.5rem rgba(0, 0, 0, 0.25));\\r\\n    padding: 1rem;\\r\\n    color: var(--dark-text);\\r\\n\\t}\\r\\n  form > input[type='text'],form > input[type='password'] {\\r\\n    border: 0.1rem solid var(--main-color);\\r\\n    padding: 0.2rem;\\r\\n  }\\r\\n  form > input, form > label{\\r\\n    margin-bottom: 0.5rem;\\r\\n  }\\r\\n  form > button{\\r\\n    width: 5rem;\\r\\n  }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAgBE,2CAAa,CAAC,AACZ,OAAO,CAAE,IAAI,CACf,cAAc,CAAE,MAAM,CACpB,WAAW,CAAE,MAAM,CACrB,KAAK,CAAE,IAAI,AACX,CAAC,AACF,IAAI,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,CACT,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,CACtC,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,YAAY,GAAG,CAAC,OAAO,CAAC,MAAM,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAC3D,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,WAAW,CAAC,AAC1B,CAAC,AACA,mBAAI,CAAG,KAAK,CAAC,IAAI,CAAC,MAAM,gBAAC,CAAC,mBAAI,CAAG,KAAK,CAAC,IAAI,CAAC,UAAU,CAAC,eAAC,CAAC,AACvD,MAAM,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,CACtC,OAAO,CAAE,MAAM,AACjB,CAAC,AACD,mBAAI,CAAG,oBAAK,CAAE,mBAAI,CAAG,oBAAK,CAAC,AACzB,aAAa,CAAE,MAAM,AACvB,CAAC,AACD,mBAAI,CAAG,qBAAM,CAAC,AACZ,KAAK,CAAE,IAAI,AACb,CAAC"}`
};
var Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<h1>User Sign Up</h1>
<div class="${"form-wrapper svelte-1m3f9h4"}"><form action="${""}" class="${"svelte-1m3f9h4"}"><label for="${"fname"}" class="${"svelte-1m3f9h4"}">First Name:</label>
		<input type="${"text"}" name="${"fname"}" id="${"fname"}" class="${"svelte-1m3f9h4"}">
		<label for="${"email"}" class="${"svelte-1m3f9h4"}">Email*:</label>
		<input type="${"text"}" name="${"email"}" id="${"email"}" required class="${"svelte-1m3f9h4"}">
		<label for="${"password"}" class="${"svelte-1m3f9h4"}">Password*:</label>
		<input type="${"password"}" name="${"password"}" id="${"password"}" required class="${"svelte-1m3f9h4"}">
		<label for="${"password2"}" class="${"svelte-1m3f9h4"}">Confirm Password*:</label>
		<input type="${"password"}" name="${"password2"}" id="${"password2 required"}" class="${"svelte-1m3f9h4"}">
		<button class="${"svelte-1m3f9h4"}">Submit</button></form>
</div>`;
});
var signup = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signup
});
var css = {
  code: ".form-wrapper.svelte-1m3f9h4.svelte-1m3f9h4{display:flex;flex-direction:column;align-items:center;width:100%}form.svelte-1m3f9h4.svelte-1m3f9h4{display:flex;flex-direction:column;width:100%;margin-top:1.5rem;max-width:30rem;border:0.1rem solid var(--main-color);background-color:white;filter:drop-shadow(0px 0.25rem 0.5rem rgba(0, 0, 0, 0.25));padding:1rem;color:var(--dark-text)}form.svelte-1m3f9h4>input[type='text'].svelte-1m3f9h4,form.svelte-1m3f9h4>input[type='password'].svelte-1m3f9h4{border:0.1rem solid var(--main-color);padding:0.2rem}form.svelte-1m3f9h4>input.svelte-1m3f9h4,form.svelte-1m3f9h4>label.svelte-1m3f9h4{margin-bottom:0.5rem}form.svelte-1m3f9h4>button.svelte-1m3f9h4{width:5rem}",
  map: `{"version":3,"file":"login.svelte","sources":["login.svelte"],"sourcesContent":["<h1>User Login</h1>\\r\\n<div class=\\"form-wrapper\\">\\r\\n\\t<form action=\\"\\">\\r\\n\\t\\t<label for=\\"email\\">Email*:</label>\\r\\n\\t\\t<input type=\\"text\\" name=\\"email\\" id=\\"email\\" required />\\r\\n\\t\\t<label for=\\"password\\">Password*:</label>\\r\\n\\t\\t<input type=\\"password\\" name=\\"password\\" id=\\"password\\" required />\\r\\n\\t\\t<button >Submit</button>\\r\\n\\t</form>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  .form-wrapper{\\r\\n    display: flex;\\r\\n\\t\\tflex-direction: column;\\r\\n    align-items: center;\\r\\n\\t\\twidth: 100%;\\r\\n  }\\r\\n\\tform {\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\tflex-direction: column;\\r\\n\\t\\twidth: 100%;\\r\\n    margin-top: 1.5rem;\\r\\n    max-width: 30rem;\\r\\n    border: 0.1rem solid var(--main-color);\\r\\n    background-color: white;  \\r\\n    filter: drop-shadow(0px 0.25rem 0.5rem rgba(0, 0, 0, 0.25));\\r\\n    padding: 1rem;\\r\\n    color: var(--dark-text);\\r\\n\\t}\\r\\n  form > input[type='text'],form > input[type='password'] {\\r\\n    border: 0.1rem solid var(--main-color);\\r\\n    padding: 0.2rem;\\r\\n  }\\r\\n  form > input, form > label{\\r\\n    margin-bottom: 0.5rem;\\r\\n  }\\r\\n  form > button{\\r\\n    width: 5rem;\\r\\n  }\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAYE,2CAAa,CAAC,AACZ,OAAO,CAAE,IAAI,CACf,cAAc,CAAE,MAAM,CACpB,WAAW,CAAE,MAAM,CACrB,KAAK,CAAE,IAAI,AACX,CAAC,AACF,IAAI,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,CACT,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,CACtC,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,YAAY,GAAG,CAAC,OAAO,CAAC,MAAM,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAC3D,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,WAAW,CAAC,AAC1B,CAAC,AACA,mBAAI,CAAG,KAAK,CAAC,IAAI,CAAC,MAAM,gBAAC,CAAC,mBAAI,CAAG,KAAK,CAAC,IAAI,CAAC,UAAU,CAAC,eAAC,CAAC,AACvD,MAAM,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,CACtC,OAAO,CAAE,MAAM,AACjB,CAAC,AACD,mBAAI,CAAG,oBAAK,CAAE,mBAAI,CAAG,oBAAK,CAAC,AACzB,aAAa,CAAE,MAAM,AACvB,CAAC,AACD,mBAAI,CAAG,qBAAM,CAAC,AACZ,KAAK,CAAE,IAAI,AACb,CAAC"}`
};
var Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<h1>User Login</h1>
<div class="${"form-wrapper svelte-1m3f9h4"}"><form action="${""}" class="${"svelte-1m3f9h4"}"><label for="${"email"}" class="${"svelte-1m3f9h4"}">Email*:</label>
		<input type="${"text"}" name="${"email"}" id="${"email"}" required class="${"svelte-1m3f9h4"}">
		<label for="${"password"}" class="${"svelte-1m3f9h4"}">Password*:</label>
		<input type="${"password"}" name="${"password"}" id="${"password"}" required class="${"svelte-1m3f9h4"}">
		<button class="${"svelte-1m3f9h4"}">Submit</button></form>
</div>`;
});
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Login
});
var Cart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sum = 0;
  {
    {
      sum = 0;
      Object.values(productList$1.productList).map((item) => {
        sum = sum + item.price;
      });
    }
  }
  return `<div class="${"cart-wrapper"}"><h1>Shopping Cart (${escape2(productList$1.productList.length)})</h1>
	<div class="${"cart"}"><div class="${"items"}">${each(productList$1.productList, (product) => `<div class="${"item"}"><img${add_attribute("src", "/" + product.image, 0)}${add_attribute("alt", product.name, 0)}>
					<div class="${"text"}"><p class="${"name"}">${escape2(product.name + " (" + product.amount + ")")}</p>
						${product.rebate != 0 ? `<p class="${"price"}">${escape2("$" + (product.price - product.rebate))}</p>` : `<p class="${"price"}">${escape2("$" + product.price)}</p>`}
						<div class="${"buttons"}"><span>+</span>
							<span>-</span>
							<svg viewBox="${"0 0 24 24"}" fill="${"var(--dark-text)"}"><path d="${"M0 0h24v24H0V0z"}" fill="${"none"}"></path><path d="${"M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"}"></path></svg>
						</div></div>
				</div>`)}</div>
		<div class="${"summary"}"><p><i>${escape2(productList$1.productList.length)} Items - $${escape2(sum.toFixed(2))}</i></p>
			<p><i>GST - $${escape2((sum * 0.05).toFixed(2))}</i></p>
			<p><i>QST - $${escape2((sum * 0.09975).toFixed(2))}</i></p>
			<p class="${"total"}">Total: $${escape2((sum * 1.14975).toFixed(2))}</p></div>
		<div class="${"buttons"}"><button class="${"checkout"}">Checkout</button>
			<button class="${"continue"}">Continue Shopping</button></div></div>
</div>`;
});
var cart = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Cart
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const type = headers["content-type"];
  const rawBody = type && isContentTypeTextual(type) ? isBase64Encoded ? Buffer.from(body, "base64").toString() : body : new TextEncoder("base64").encode(body);
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
