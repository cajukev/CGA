var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/@sveltejs/kit/dist/install-fetch.js
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
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
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
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, Readable, wm, Blob, fetchBlob, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
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
    fetchBlob = Blob;
    FetchBaseError = class extends Error {
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
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
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
    clone = (instance, highWaterMark) => {
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
    extractContentType = (body, request) => {
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
    getTotalBytes = (request) => {
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
    writeToStream = (dest, { body }) => {
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
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
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
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
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
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
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
    getNodeRequestOptions = (request) => {
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
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/fn-annotate/index.js
var require_fn_annotate = __commonJS({
  "node_modules/fn-annotate/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = annotate;
    function annotate(fn) {
      if (typeof fn !== "function") {
        throw new Error("Could not parse function signature for injection dependencies: Object is not a function");
      }
      if (!fn.length)
        return [];
      var injects = /^()\(?([^)=]*)\)? *=>/.exec(fn + "") || /^[^(]+([^ \(]*) *\(([^\)]*)\)/.exec(fn + "");
      if (!injects) {
        throw new Error("Could not parse function signature for injection dependencies: " + fn + "");
      }
      var argumentString = injects[2].replace(/\/\*[\S\s]*?\*\//g, " ").replace(/\/\/.*/g, " ");
      function groupSubArguments(_, type, keys) {
        return type + keys.split(",").map(function(arg) {
          return arg && arg.trim();
        }).filter(Boolean).join("@");
      }
      argumentString = argumentString.replace(/(\{)([^}]*)\}/g, groupSubArguments);
      argumentString = argumentString.replace(/(\[)([^}]*)\]/g, groupSubArguments);
      return argumentString.split(",").map(function(arg) {
        return arg && arg.trim();
      }).map(function(arg) {
        if (arg[0] === "{") {
          return arg.substring(1).split("@");
        }
        if (arg[0] === "[") {
          return { items: arg.substring(1).split("@") };
        }
        return arg;
      }).filter(Boolean);
    }
  }
});

// node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "node_modules/util-deprecate/node.js"(exports, module2) {
    init_shims();
    module2.exports = require("util").deprecate;
  }
});

// node_modules/faunadb/package.json
var require_package = __commonJS({
  "node_modules/faunadb/package.json"(exports, module2) {
    module2.exports = {
      name: "faunadb",
      version: "4.3.0",
      apiVersion: "4",
      description: "FaunaDB Javascript driver for Node.JS and Browsers",
      homepage: "https://fauna.com",
      repository: "fauna/faunadb-js",
      license: "MPL-2.0",
      keywords: [
        "database",
        "fauna",
        "official",
        "driver"
      ],
      bugs: {
        url: "https://github.com/fauna/faunadb-js/issues"
      },
      files: [
        "index.d.ts",
        "src/",
        "dist/",
        "tools/printReleaseNotes.js"
      ],
      main: "index.js",
      scripts: {
        doc: "jsdoc -c ./jsdoc.json",
        browserify: "browserify index.js --standalone faunadb -o dist/faunadb.js",
        "browserify-min": "browserify index.js --standalone faunadb | terser -c -m --keep-fnames --keep-classnames -o dist/faunadb-min.js",
        prettify: 'prettier --write "{src,test}/**/*.{js,ts}"',
        test: "jest --env=node --verbose=false --forceExit ./test",
        "semantic-release": "semantic-release",
        wp: "webpack",
        postinstall: "node ./tools/printReleaseNotes",
        postupdate: "node ./tools/printReleaseNotes",
        "load-test": "node ./tools/loadTest"
      },
      types: "index.d.ts",
      dependencies: {
        "abort-controller": "^3.0.0",
        "base64-js": "^1.2.0",
        boxen: "^5.0.1",
        "btoa-lite": "^1.0.0",
        chalk: "^4.1.1",
        "cross-fetch": "^3.0.6",
        dotenv: "^8.2.0",
        "fn-annotate": "^1.1.3",
        "object-assign": "^4.1.0",
        "util-deprecate": "^1.0.2"
      },
      devDependencies: {
        browserify: "^16.2.2",
        eslint: "^5.3.0",
        "eslint-config-prettier": "^6.5.0",
        "eslint-plugin-prettier": "^3.1.1",
        husky: ">=1",
        "ink-docstrap": "^1.2.1",
        jest: "^24.9.0",
        jsdoc: "^3.6.3",
        "lint-staged": ">=8",
        prettier: "1.18.2",
        "semantic-release": "^17.1.2",
        terser: "^4.3.9",
        webpack: "^5.23.0",
        "webpack-cli": "^4.5.0",
        yargs: "^16.2.0"
      },
      husky: {
        hooks: {
          "pre-commit": "lint-staged"
        }
      },
      "lint-staged": {
        "*.{js,css,json,md}": [
          "prettier --write",
          "git add"
        ],
        "*.js": [
          "eslint --fix",
          "git add"
        ]
      },
      release: {
        branches: [
          "master"
        ]
      },
      browser: {
        http2: false,
        http: false,
        https: false,
        os: false,
        util: false,
        boxen: false,
        chalk: false
      }
    };
  }
});

// node_modules/color-name/index.js
var require_color_name = __commonJS({
  "node_modules/color-name/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
  "node_modules/color-convert/conversions.js"(exports, module2) {
    init_shims();
    var cssKeywords = require_color_name();
    var reverseKeywords = {};
    for (const key of Object.keys(cssKeywords)) {
      reverseKeywords[cssKeywords[key]] = key;
    }
    var convert = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] }
    };
    module2.exports = convert;
    for (const model of Object.keys(convert)) {
      if (!("channels" in convert[model])) {
        throw new Error("missing channels property: " + model);
      }
      if (!("labels" in convert[model])) {
        throw new Error("missing channel labels property: " + model);
      }
      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error("channel and label counts mismatch: " + model);
      }
      const { channels, labels } = convert[model];
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], "channels", { value: channels });
      Object.defineProperty(convert[model], "labels", { value: labels });
    }
    convert.rgb.hsl = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      const delta = max - min;
      let h;
      let s2;
      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) {
        h += 360;
      }
      const l = (min + max) / 2;
      if (max === min) {
        s2 = 0;
      } else if (l <= 0.5) {
        s2 = delta / (max + min);
      } else {
        s2 = delta / (2 - max - min);
      }
      return [h, s2 * 100, l * 100];
    };
    convert.rgb.hsv = function(rgb) {
      let rdif;
      let gdif;
      let bdif;
      let h;
      let s2;
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const v = Math.max(r, g, b);
      const diff = v - Math.min(r, g, b);
      const diffc = function(c) {
        return (v - c) / 6 / diff + 1 / 2;
      };
      if (diff === 0) {
        h = 0;
        s2 = 0;
      } else {
        s2 = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);
        if (r === v) {
          h = bdif - gdif;
        } else if (g === v) {
          h = 1 / 3 + rdif - bdif;
        } else if (b === v) {
          h = 2 / 3 + gdif - rdif;
        }
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }
      return [
        h * 360,
        s2 * 100,
        v * 100
      ];
    };
    convert.rgb.hwb = function(rgb) {
      const r = rgb[0];
      const g = rgb[1];
      let b = rgb[2];
      const h = convert.rgb.hsl(rgb)[0];
      const w = 1 / 255 * Math.min(r, Math.min(g, b));
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
      return [h, w * 100, b * 100];
    };
    convert.rgb.cmyk = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const k = Math.min(1 - r, 1 - g, 1 - b);
      const c = (1 - r - k) / (1 - k) || 0;
      const m = (1 - g - k) / (1 - k) || 0;
      const y = (1 - b - k) / (1 - k) || 0;
      return [c * 100, m * 100, y * 100, k * 100];
    };
    function comparativeDistance(x, y) {
      return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
    }
    convert.rgb.keyword = function(rgb) {
      const reversed = reverseKeywords[rgb];
      if (reversed) {
        return reversed;
      }
      let currentClosestDistance = Infinity;
      let currentClosestKeyword;
      for (const keyword of Object.keys(cssKeywords)) {
        const value = cssKeywords[keyword];
        const distance = comparativeDistance(rgb, value);
        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
      return currentClosestKeyword;
    };
    convert.keyword.rgb = function(keyword) {
      return cssKeywords[keyword];
    };
    convert.rgb.xyz = function(rgb) {
      let r = rgb[0] / 255;
      let g = rgb[1] / 255;
      let b = rgb[2] / 255;
      r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
      g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
      b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
      const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return [x * 100, y * 100, z * 100];
    };
    convert.rgb.lab = function(rgb) {
      const xyz = convert.rgb.xyz(rgb);
      let x = xyz[0];
      let y = xyz[1];
      let z = xyz[2];
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);
      return [l, a, b];
    };
    convert.hsl.rgb = function(hsl) {
      const h = hsl[0] / 360;
      const s2 = hsl[1] / 100;
      const l = hsl[2] / 100;
      let t2;
      let t3;
      let val;
      if (s2 === 0) {
        val = l * 255;
        return [val, val, val];
      }
      if (l < 0.5) {
        t2 = l * (1 + s2);
      } else {
        t2 = l + s2 - l * s2;
      }
      const t1 = 2 * l - t2;
      const rgb = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }
        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        rgb[i] = val * 255;
      }
      return rgb;
    };
    convert.hsl.hsv = function(hsl) {
      const h = hsl[0];
      let s2 = hsl[1] / 100;
      let l = hsl[2] / 100;
      let smin = s2;
      const lmin = Math.max(l, 0.01);
      l *= 2;
      s2 *= l <= 1 ? l : 2 - l;
      smin *= lmin <= 1 ? lmin : 2 - lmin;
      const v = (l + s2) / 2;
      const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s2 / (l + s2);
      return [h, sv * 100, v * 100];
    };
    convert.hsv.rgb = function(hsv) {
      const h = hsv[0] / 60;
      const s2 = hsv[1] / 100;
      let v = hsv[2] / 100;
      const hi = Math.floor(h) % 6;
      const f = h - Math.floor(h);
      const p = 255 * v * (1 - s2);
      const q2 = 255 * v * (1 - s2 * f);
      const t = 255 * v * (1 - s2 * (1 - f));
      v *= 255;
      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q2, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q2, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q2];
      }
    };
    convert.hsv.hsl = function(hsv) {
      const h = hsv[0];
      const s2 = hsv[1] / 100;
      const v = hsv[2] / 100;
      const vmin = Math.max(v, 0.01);
      let sl;
      let l;
      l = (2 - s2) * v;
      const lmin = (2 - s2) * vmin;
      sl = s2 * vmin;
      sl /= lmin <= 1 ? lmin : 2 - lmin;
      sl = sl || 0;
      l /= 2;
      return [h, sl * 100, l * 100];
    };
    convert.hwb.rgb = function(hwb) {
      const h = hwb[0] / 360;
      let wh = hwb[1] / 100;
      let bl = hwb[2] / 100;
      const ratio = wh + bl;
      let f;
      if (ratio > 1) {
        wh /= ratio;
        bl /= ratio;
      }
      const i = Math.floor(6 * h);
      const v = 1 - bl;
      f = 6 * h - i;
      if ((i & 1) !== 0) {
        f = 1 - f;
      }
      const n = wh + f * (v - wh);
      let r;
      let g;
      let b;
      switch (i) {
        default:
        case 6:
        case 0:
          r = v;
          g = n;
          b = wh;
          break;
        case 1:
          r = n;
          g = v;
          b = wh;
          break;
        case 2:
          r = wh;
          g = v;
          b = n;
          break;
        case 3:
          r = wh;
          g = n;
          b = v;
          break;
        case 4:
          r = n;
          g = wh;
          b = v;
          break;
        case 5:
          r = v;
          g = wh;
          b = n;
          break;
      }
      return [r * 255, g * 255, b * 255];
    };
    convert.cmyk.rgb = function(cmyk) {
      const c = cmyk[0] / 100;
      const m = cmyk[1] / 100;
      const y = cmyk[2] / 100;
      const k = cmyk[3] / 100;
      const r = 1 - Math.min(1, c * (1 - k) + k);
      const g = 1 - Math.min(1, m * (1 - k) + k);
      const b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.rgb = function(xyz) {
      const x = xyz[0] / 100;
      const y = xyz[1] / 100;
      const z = xyz[2] / 100;
      let r;
      let g;
      let b;
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
      g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
      b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
      r = Math.min(Math.max(0, r), 1);
      g = Math.min(Math.max(0, g), 1);
      b = Math.min(Math.max(0, b), 1);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.lab = function(xyz) {
      let x = xyz[0];
      let y = xyz[1];
      let z = xyz[2];
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);
      return [l, a, b];
    };
    convert.lab.xyz = function(lab) {
      const l = lab[0];
      const a = lab[1];
      const b = lab[2];
      let x;
      let y;
      let z;
      y = (l + 16) / 116;
      x = a / 500 + y;
      z = y - b / 200;
      const y2 = y ** 3;
      const x2 = x ** 3;
      const z2 = z ** 3;
      y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
      x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
      z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
      x *= 95.047;
      y *= 100;
      z *= 108.883;
      return [x, y, z];
    };
    convert.lab.lch = function(lab) {
      const l = lab[0];
      const a = lab[1];
      const b = lab[2];
      let h;
      const hr = Math.atan2(b, a);
      h = hr * 360 / 2 / Math.PI;
      if (h < 0) {
        h += 360;
      }
      const c = Math.sqrt(a * a + b * b);
      return [l, c, h];
    };
    convert.lch.lab = function(lch) {
      const l = lch[0];
      const c = lch[1];
      const h = lch[2];
      const hr = h / 360 * 2 * Math.PI;
      const a = c * Math.cos(hr);
      const b = c * Math.sin(hr);
      return [l, a, b];
    };
    convert.rgb.ansi16 = function(args, saturation = null) {
      const [r, g, b] = args;
      let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
      value = Math.round(value / 50);
      if (value === 0) {
        return 30;
      }
      let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
      if (value === 2) {
        ansi += 60;
      }
      return ansi;
    };
    convert.hsv.ansi16 = function(args) {
      return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
    };
    convert.rgb.ansi256 = function(args) {
      const r = args[0];
      const g = args[1];
      const b = args[2];
      if (r === g && g === b) {
        if (r < 8) {
          return 16;
        }
        if (r > 248) {
          return 231;
        }
        return Math.round((r - 8) / 247 * 24) + 232;
      }
      const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
      return ansi;
    };
    convert.ansi16.rgb = function(args) {
      let color = args % 10;
      if (color === 0 || color === 7) {
        if (args > 50) {
          color += 3.5;
        }
        color = color / 10.5 * 255;
        return [color, color, color];
      }
      const mult = (~~(args > 50) + 1) * 0.5;
      const r = (color & 1) * mult * 255;
      const g = (color >> 1 & 1) * mult * 255;
      const b = (color >> 2 & 1) * mult * 255;
      return [r, g, b];
    };
    convert.ansi256.rgb = function(args) {
      if (args >= 232) {
        const c = (args - 232) * 10 + 8;
        return [c, c, c];
      }
      args -= 16;
      let rem;
      const r = Math.floor(args / 36) / 5 * 255;
      const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
      const b = rem % 6 / 5 * 255;
      return [r, g, b];
    };
    convert.rgb.hex = function(args) {
      const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
      const string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.hex.rgb = function(args) {
      const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!match) {
        return [0, 0, 0];
      }
      let colorString = match[0];
      if (match[0].length === 3) {
        colorString = colorString.split("").map((char) => {
          return char + char;
        }).join("");
      }
      const integer = parseInt(colorString, 16);
      const r = integer >> 16 & 255;
      const g = integer >> 8 & 255;
      const b = integer & 255;
      return [r, g, b];
    };
    convert.rgb.hcg = function(rgb) {
      const r = rgb[0] / 255;
      const g = rgb[1] / 255;
      const b = rgb[2] / 255;
      const max = Math.max(Math.max(r, g), b);
      const min = Math.min(Math.min(r, g), b);
      const chroma = max - min;
      let grayscale;
      let hue;
      if (chroma < 1) {
        grayscale = min / (1 - chroma);
      } else {
        grayscale = 0;
      }
      if (chroma <= 0) {
        hue = 0;
      } else if (max === r) {
        hue = (g - b) / chroma % 6;
      } else if (max === g) {
        hue = 2 + (b - r) / chroma;
      } else {
        hue = 4 + (r - g) / chroma;
      }
      hue /= 6;
      hue %= 1;
      return [hue * 360, chroma * 100, grayscale * 100];
    };
    convert.hsl.hcg = function(hsl) {
      const s2 = hsl[1] / 100;
      const l = hsl[2] / 100;
      const c = l < 0.5 ? 2 * s2 * l : 2 * s2 * (1 - l);
      let f = 0;
      if (c < 1) {
        f = (l - 0.5 * c) / (1 - c);
      }
      return [hsl[0], c * 100, f * 100];
    };
    convert.hsv.hcg = function(hsv) {
      const s2 = hsv[1] / 100;
      const v = hsv[2] / 100;
      const c = s2 * v;
      let f = 0;
      if (c < 1) {
        f = (v - c) / (1 - c);
      }
      return [hsv[0], c * 100, f * 100];
    };
    convert.hcg.rgb = function(hcg) {
      const h = hcg[0] / 360;
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      if (c === 0) {
        return [g * 255, g * 255, g * 255];
      }
      const pure = [0, 0, 0];
      const hi = h % 1 * 6;
      const v = hi % 1;
      const w = 1 - v;
      let mg = 0;
      switch (Math.floor(hi)) {
        case 0:
          pure[0] = 1;
          pure[1] = v;
          pure[2] = 0;
          break;
        case 1:
          pure[0] = w;
          pure[1] = 1;
          pure[2] = 0;
          break;
        case 2:
          pure[0] = 0;
          pure[1] = 1;
          pure[2] = v;
          break;
        case 3:
          pure[0] = 0;
          pure[1] = w;
          pure[2] = 1;
          break;
        case 4:
          pure[0] = v;
          pure[1] = 0;
          pure[2] = 1;
          break;
        default:
          pure[0] = 1;
          pure[1] = 0;
          pure[2] = w;
      }
      mg = (1 - c) * g;
      return [
        (c * pure[0] + mg) * 255,
        (c * pure[1] + mg) * 255,
        (c * pure[2] + mg) * 255
      ];
    };
    convert.hcg.hsv = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const v = c + g * (1 - c);
      let f = 0;
      if (v > 0) {
        f = c / v;
      }
      return [hcg[0], f * 100, v * 100];
    };
    convert.hcg.hsl = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const l = g * (1 - c) + 0.5 * c;
      let s2 = 0;
      if (l > 0 && l < 0.5) {
        s2 = c / (2 * l);
      } else if (l >= 0.5 && l < 1) {
        s2 = c / (2 * (1 - l));
      }
      return [hcg[0], s2 * 100, l * 100];
    };
    convert.hcg.hwb = function(hcg) {
      const c = hcg[1] / 100;
      const g = hcg[2] / 100;
      const v = c + g * (1 - c);
      return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };
    convert.hwb.hcg = function(hwb) {
      const w = hwb[1] / 100;
      const b = hwb[2] / 100;
      const v = 1 - b;
      const c = v - w;
      let g = 0;
      if (c < 1) {
        g = (v - c) / (1 - c);
      }
      return [hwb[0], c * 100, g * 100];
    };
    convert.apple.rgb = function(apple) {
      return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
    };
    convert.rgb.apple = function(rgb) {
      return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
    };
    convert.gray.rgb = function(args) {
      return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
    };
    convert.gray.hsl = function(args) {
      return [0, 0, args[0]];
    };
    convert.gray.hsv = convert.gray.hsl;
    convert.gray.hwb = function(gray) {
      return [0, 100, gray[0]];
    };
    convert.gray.cmyk = function(gray) {
      return [0, 0, 0, gray[0]];
    };
    convert.gray.lab = function(gray) {
      return [gray[0], 0, 0];
    };
    convert.gray.hex = function(gray) {
      const val = Math.round(gray[0] / 100 * 255) & 255;
      const integer = (val << 16) + (val << 8) + val;
      const string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.rgb.gray = function(rgb) {
      const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
      return [val / 255 * 100];
    };
  }
});

// node_modules/color-convert/route.js
var require_route = __commonJS({
  "node_modules/color-convert/route.js"(exports, module2) {
    init_shims();
    var conversions = require_conversions();
    function buildGraph() {
      const graph = {};
      const models = Object.keys(conversions);
      for (let len = models.length, i = 0; i < len; i++) {
        graph[models[i]] = {
          distance: -1,
          parent: null
        };
      }
      return graph;
    }
    function deriveBFS(fromModel) {
      const graph = buildGraph();
      const queue = [fromModel];
      graph[fromModel].distance = 0;
      while (queue.length) {
        const current = queue.pop();
        const adjacents = Object.keys(conversions[current]);
        for (let len = adjacents.length, i = 0; i < len; i++) {
          const adjacent = adjacents[i];
          const node = graph[adjacent];
          if (node.distance === -1) {
            node.distance = graph[current].distance + 1;
            node.parent = current;
            queue.unshift(adjacent);
          }
        }
      }
      return graph;
    }
    function link(from, to) {
      return function(args) {
        return to(from(args));
      };
    }
    function wrapConversion(toModel, graph) {
      const path = [graph[toModel].parent, toModel];
      let fn = conversions[graph[toModel].parent][toModel];
      let cur = graph[toModel].parent;
      while (graph[cur].parent) {
        path.unshift(graph[cur].parent);
        fn = link(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
      }
      fn.conversion = path;
      return fn;
    }
    module2.exports = function(fromModel) {
      const graph = deriveBFS(fromModel);
      const conversion = {};
      const models = Object.keys(graph);
      for (let len = models.length, i = 0; i < len; i++) {
        const toModel = models[i];
        const node = graph[toModel];
        if (node.parent === null) {
          continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
      }
      return conversion;
    };
  }
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS({
  "node_modules/color-convert/index.js"(exports, module2) {
    init_shims();
    var conversions = require_conversions();
    var route = require_route();
    var convert = {};
    var models = Object.keys(conversions);
    function wrapRaw(fn) {
      const wrappedFn = function(...args) {
        const arg0 = args[0];
        if (arg0 === void 0 || arg0 === null) {
          return arg0;
        }
        if (arg0.length > 1) {
          args = arg0;
        }
        return fn(args);
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    function wrapRounded(fn) {
      const wrappedFn = function(...args) {
        const arg0 = args[0];
        if (arg0 === void 0 || arg0 === null) {
          return arg0;
        }
        if (arg0.length > 1) {
          args = arg0;
        }
        const result = fn(args);
        if (typeof result === "object") {
          for (let len = result.length, i = 0; i < len; i++) {
            result[i] = Math.round(result[i]);
          }
        }
        return result;
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    models.forEach((fromModel) => {
      convert[fromModel] = {};
      Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
      Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
      const routes = route(fromModel);
      const routeModels = Object.keys(routes);
      routeModels.forEach((toModel) => {
        const fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
      });
    });
    module2.exports = convert;
  }
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS({
  "node_modules/ansi-styles/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var wrapAnsi16 = (fn, offset) => (...args) => {
      const code = fn(...args);
      return `[${code + offset}m`;
    };
    var wrapAnsi256 = (fn, offset) => (...args) => {
      const code = fn(...args);
      return `[${38 + offset};5;${code}m`;
    };
    var wrapAnsi16m = (fn, offset) => (...args) => {
      const rgb = fn(...args);
      return `[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
    };
    var ansi2ansi = (n) => n;
    var rgb2rgb = (r, g, b) => [r, g, b];
    var setLazyProperty = (object, property, get2) => {
      Object.defineProperty(object, property, {
        get: () => {
          const value = get2();
          Object.defineProperty(object, property, {
            value,
            enumerable: true,
            configurable: true
          });
          return value;
        },
        enumerable: true,
        configurable: true
      });
    };
    var colorConvert;
    var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
      if (colorConvert === void 0) {
        colorConvert = require_color_convert();
      }
      const offset = isBackground ? 10 : 0;
      const styles = {};
      for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
        const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
        if (sourceSpace === targetSpace) {
          styles[name] = wrap(identity, offset);
        } else if (typeof suite === "object") {
          styles[name] = wrap(suite[targetSpace], offset);
        }
      }
      return styles;
    };
    function assembleStyles() {
      const codes = new Map();
      const styles = {
        modifier: {
          reset: [0, 0],
          bold: [1, 22],
          dim: [2, 22],
          italic: [3, 23],
          underline: [4, 24],
          inverse: [7, 27],
          hidden: [8, 28],
          strikethrough: [9, 29]
        },
        color: {
          black: [30, 39],
          red: [31, 39],
          green: [32, 39],
          yellow: [33, 39],
          blue: [34, 39],
          magenta: [35, 39],
          cyan: [36, 39],
          white: [37, 39],
          blackBright: [90, 39],
          redBright: [91, 39],
          greenBright: [92, 39],
          yellowBright: [93, 39],
          blueBright: [94, 39],
          magentaBright: [95, 39],
          cyanBright: [96, 39],
          whiteBright: [97, 39]
        },
        bgColor: {
          bgBlack: [40, 49],
          bgRed: [41, 49],
          bgGreen: [42, 49],
          bgYellow: [43, 49],
          bgBlue: [44, 49],
          bgMagenta: [45, 49],
          bgCyan: [46, 49],
          bgWhite: [47, 49],
          bgBlackBright: [100, 49],
          bgRedBright: [101, 49],
          bgGreenBright: [102, 49],
          bgYellowBright: [103, 49],
          bgBlueBright: [104, 49],
          bgMagentaBright: [105, 49],
          bgCyanBright: [106, 49],
          bgWhiteBright: [107, 49]
        }
      };
      styles.color.gray = styles.color.blackBright;
      styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
      styles.color.grey = styles.color.blackBright;
      styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
      for (const [groupName, group] of Object.entries(styles)) {
        for (const [styleName, style] of Object.entries(group)) {
          styles[styleName] = {
            open: `[${style[0]}m`,
            close: `[${style[1]}m`
          };
          group[styleName] = styles[styleName];
          codes.set(style[0], style[1]);
        }
        Object.defineProperty(styles, groupName, {
          value: group,
          enumerable: false
        });
      }
      Object.defineProperty(styles, "codes", {
        value: codes,
        enumerable: false
      });
      styles.color.close = "[39m";
      styles.bgColor.close = "[49m";
      setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
      setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
      setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
      setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
      setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
      setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
      return styles;
    }
    Object.defineProperty(module2, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = (flag, argv = process.argv) => {
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const position = argv.indexOf(prefix + flag);
      const terminatorPosition = argv.indexOf("--");
      return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var os = require("os");
    var tty = require("tty");
    var hasFlag = require_has_flag();
    var { env } = process;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      forceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = 1;
    }
    if ("FORCE_COLOR" in env) {
      if (env.FORCE_COLOR === "true") {
        forceColor = 1;
      } else if (env.FORCE_COLOR === "false") {
        forceColor = 0;
      } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
      }
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(haveStream, streamIsTTY) {
      if (forceColor === 0) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (haveStream && !streamIsTTY && forceColor === void 0) {
        return 0;
      }
      const min = forceColor || 0;
      if (env.TERM === "dumb") {
        return min;
      }
      if (process.platform === "win32") {
        const osRelease = os.release().split(".");
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream, stream && stream.isTTY);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: translateLevel(supportsColor(true, tty.isatty(1))),
      stderr: translateLevel(supportsColor(true, tty.isatty(2)))
    };
  }
});

// node_modules/chalk/source/util.js
var require_util = __commonJS({
  "node_modules/chalk/source/util.js"(exports, module2) {
    init_shims();
    "use strict";
    var stringReplaceAll = (string, substring, replacer) => {
      let index2 = string.indexOf(substring);
      if (index2 === -1) {
        return string;
      }
      const substringLength = substring.length;
      let endIndex = 0;
      let returnValue = "";
      do {
        returnValue += string.substr(endIndex, index2 - endIndex) + substring + replacer;
        endIndex = index2 + substringLength;
        index2 = string.indexOf(substring, endIndex);
      } while (index2 !== -1);
      returnValue += string.substr(endIndex);
      return returnValue;
    };
    var stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index2) => {
      let endIndex = 0;
      let returnValue = "";
      do {
        const gotCR = string[index2 - 1] === "\r";
        returnValue += string.substr(endIndex, (gotCR ? index2 - 1 : index2) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
        endIndex = index2 + 1;
        index2 = string.indexOf("\n", endIndex);
      } while (index2 !== -1);
      returnValue += string.substr(endIndex);
      return returnValue;
    };
    module2.exports = {
      stringReplaceAll,
      stringEncaseCRLFWithFirstIndex
    };
  }
});

// node_modules/chalk/source/templates.js
var require_templates = __commonJS({
  "node_modules/chalk/source/templates.js"(exports, module2) {
    init_shims();
    "use strict";
    var TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
    var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
    var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
    var ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
    var ESCAPES = new Map([
      ["n", "\n"],
      ["r", "\r"],
      ["t", "	"],
      ["b", "\b"],
      ["f", "\f"],
      ["v", "\v"],
      ["0", "\0"],
      ["\\", "\\"],
      ["e", ""],
      ["a", "\x07"]
    ]);
    function unescape2(c) {
      const u = c[0] === "u";
      const bracket = c[1] === "{";
      if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
        return String.fromCharCode(parseInt(c.slice(1), 16));
      }
      if (u && bracket) {
        return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
      }
      return ESCAPES.get(c) || c;
    }
    function parseArguments(name, arguments_) {
      const results = [];
      const chunks = arguments_.trim().split(/\s*,\s*/g);
      let matches;
      for (const chunk of chunks) {
        const number = Number(chunk);
        if (!Number.isNaN(number)) {
          results.push(number);
        } else if (matches = chunk.match(STRING_REGEX)) {
          results.push(matches[2].replace(ESCAPE_REGEX, (m, escape3, character) => escape3 ? unescape2(escape3) : character));
        } else {
          throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
        }
      }
      return results;
    }
    function parseStyle(style) {
      STYLE_REGEX.lastIndex = 0;
      const results = [];
      let matches;
      while ((matches = STYLE_REGEX.exec(style)) !== null) {
        const name = matches[1];
        if (matches[2]) {
          const args = parseArguments(name, matches[2]);
          results.push([name].concat(args));
        } else {
          results.push([name]);
        }
      }
      return results;
    }
    function buildStyle(chalk, styles) {
      const enabled = {};
      for (const layer of styles) {
        for (const style of layer.styles) {
          enabled[style[0]] = layer.inverse ? null : style.slice(1);
        }
      }
      let current = chalk;
      for (const [styleName, styles2] of Object.entries(enabled)) {
        if (!Array.isArray(styles2)) {
          continue;
        }
        if (!(styleName in current)) {
          throw new Error(`Unknown Chalk style: ${styleName}`);
        }
        current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
      }
      return current;
    }
    module2.exports = (chalk, temporary) => {
      const styles = [];
      const chunks = [];
      let chunk = [];
      temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
        if (escapeCharacter) {
          chunk.push(unescape2(escapeCharacter));
        } else if (style) {
          const string = chunk.join("");
          chunk = [];
          chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
          styles.push({ inverse, styles: parseStyle(style) });
        } else if (close) {
          if (styles.length === 0) {
            throw new Error("Found extraneous } in Chalk template literal");
          }
          chunks.push(buildStyle(chalk, styles)(chunk.join("")));
          chunk = [];
          styles.pop();
        } else {
          chunk.push(character);
        }
      });
      chunks.push(chunk.join(""));
      if (styles.length > 0) {
        const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
        throw new Error(errMessage);
      }
      return chunks.join("");
    };
  }
});

// node_modules/chalk/source/index.js
var require_source = __commonJS({
  "node_modules/chalk/source/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var ansiStyles = require_ansi_styles();
    var { stdout: stdoutColor, stderr: stderrColor } = require_supports_color();
    var {
      stringReplaceAll,
      stringEncaseCRLFWithFirstIndex
    } = require_util();
    var { isArray } = Array;
    var levelMapping = [
      "ansi",
      "ansi",
      "ansi256",
      "ansi16m"
    ];
    var styles = Object.create(null);
    var applyOptions = (object, options2 = {}) => {
      if (options2.level && !(Number.isInteger(options2.level) && options2.level >= 0 && options2.level <= 3)) {
        throw new Error("The `level` option should be an integer from 0 to 3");
      }
      const colorLevel = stdoutColor ? stdoutColor.level : 0;
      object.level = options2.level === void 0 ? colorLevel : options2.level;
    };
    var ChalkClass = class {
      constructor(options2) {
        return chalkFactory(options2);
      }
    };
    var chalkFactory = (options2) => {
      const chalk2 = {};
      applyOptions(chalk2, options2);
      chalk2.template = (...arguments_) => chalkTag(chalk2.template, ...arguments_);
      Object.setPrototypeOf(chalk2, Chalk.prototype);
      Object.setPrototypeOf(chalk2.template, chalk2);
      chalk2.template.constructor = () => {
        throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
      };
      chalk2.template.Instance = ChalkClass;
      return chalk2.template;
    };
    function Chalk(options2) {
      return chalkFactory(options2);
    }
    for (const [styleName, style] of Object.entries(ansiStyles)) {
      styles[styleName] = {
        get() {
          const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
          Object.defineProperty(this, styleName, { value: builder });
          return builder;
        }
      };
    }
    styles.visible = {
      get() {
        const builder = createBuilder(this, this._styler, true);
        Object.defineProperty(this, "visible", { value: builder });
        return builder;
      }
    };
    var usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
    for (const model of usedModels) {
      styles[model] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
            return createBuilder(this, styler, this._isEmpty);
          };
        }
      };
    }
    for (const model of usedModels) {
      const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
      styles[bgModel] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
            return createBuilder(this, styler, this._isEmpty);
          };
        }
      };
    }
    var proto = Object.defineProperties(() => {
    }, {
      ...styles,
      level: {
        enumerable: true,
        get() {
          return this._generator.level;
        },
        set(level) {
          this._generator.level = level;
        }
      }
    });
    var createStyler = (open, close, parent) => {
      let openAll;
      let closeAll;
      if (parent === void 0) {
        openAll = open;
        closeAll = close;
      } else {
        openAll = parent.openAll + open;
        closeAll = close + parent.closeAll;
      }
      return {
        open,
        close,
        openAll,
        closeAll,
        parent
      };
    };
    var createBuilder = (self2, _styler, _isEmpty) => {
      const builder = (...arguments_) => {
        if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
          return applyStyle(builder, chalkTag(builder, ...arguments_));
        }
        return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
      };
      Object.setPrototypeOf(builder, proto);
      builder._generator = self2;
      builder._styler = _styler;
      builder._isEmpty = _isEmpty;
      return builder;
    };
    var applyStyle = (self2, string) => {
      if (self2.level <= 0 || !string) {
        return self2._isEmpty ? "" : string;
      }
      let styler = self2._styler;
      if (styler === void 0) {
        return string;
      }
      const { openAll, closeAll } = styler;
      if (string.indexOf("") !== -1) {
        while (styler !== void 0) {
          string = stringReplaceAll(string, styler.close, styler.open);
          styler = styler.parent;
        }
      }
      const lfIndex = string.indexOf("\n");
      if (lfIndex !== -1) {
        string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
      }
      return openAll + string + closeAll;
    };
    var template2;
    var chalkTag = (chalk2, ...strings) => {
      const [firstString] = strings;
      if (!isArray(firstString) || !isArray(firstString.raw)) {
        return strings.join(" ");
      }
      const arguments_ = strings.slice(1);
      const parts = [firstString.raw[0]];
      for (let i = 1; i < firstString.length; i++) {
        parts.push(String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[i]));
      }
      if (template2 === void 0) {
        template2 = require_templates();
      }
      return template2(chalk2, parts.join(""));
    };
    Object.defineProperties(Chalk.prototype, styles);
    var chalk = Chalk();
    chalk.supportsColor = stdoutColor;
    chalk.stderr = Chalk({ level: stderrColor ? stderrColor.level : 0 });
    chalk.stderr.supportsColor = stderrColor;
    module2.exports = chalk;
  }
});

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS({
  "node_modules/ansi-regex/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = ({ onlyFirst = false } = {}) => {
      const pattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
      ].join("|");
      return new RegExp(pattern, onlyFirst ? void 0 : "g");
    };
  }
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS({
  "node_modules/strip-ansi/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var ansiRegex = require_ansi_regex();
    module2.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
  }
});

// node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = __commonJS({
  "node_modules/is-fullwidth-code-point/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var isFullwidthCodePoint = (codePoint) => {
      if (Number.isNaN(codePoint)) {
        return false;
      }
      if (codePoint >= 4352 && (codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || 11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || 12880 <= codePoint && codePoint <= 19903 || 19968 <= codePoint && codePoint <= 42182 || 43360 <= codePoint && codePoint <= 43388 || 44032 <= codePoint && codePoint <= 55203 || 63744 <= codePoint && codePoint <= 64255 || 65040 <= codePoint && codePoint <= 65049 || 65072 <= codePoint && codePoint <= 65131 || 65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || 110592 <= codePoint && codePoint <= 110593 || 127488 <= codePoint && codePoint <= 127569 || 131072 <= codePoint && codePoint <= 262141)) {
        return true;
      }
      return false;
    };
    module2.exports = isFullwidthCodePoint;
    module2.exports.default = isFullwidthCodePoint;
  }
});

// node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS({
  "node_modules/emoji-regex/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = function() {
      return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
    };
  }
});

// node_modules/string-width/index.js
var require_string_width = __commonJS({
  "node_modules/string-width/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var stripAnsi = require_strip_ansi();
    var isFullwidthCodePoint = require_is_fullwidth_code_point();
    var emojiRegex = require_emoji_regex();
    var stringWidth = (string) => {
      if (typeof string !== "string" || string.length === 0) {
        return 0;
      }
      string = stripAnsi(string);
      if (string.length === 0) {
        return 0;
      }
      string = string.replace(emojiRegex(), "  ");
      let width = 0;
      for (let i = 0; i < string.length; i++) {
        const code = string.codePointAt(i);
        if (code <= 31 || code >= 127 && code <= 159) {
          continue;
        }
        if (code >= 768 && code <= 879) {
          continue;
        }
        if (code > 65535) {
          i++;
        }
        width += isFullwidthCodePoint(code) ? 2 : 1;
      }
      return width;
    };
    module2.exports = stringWidth;
    module2.exports.default = stringWidth;
  }
});

// node_modules/widest-line/index.js
var require_widest_line = __commonJS({
  "node_modules/widest-line/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var stringWidth = require_string_width();
    var widestLine = (input) => {
      let max = 0;
      for (const line of input.split("\n")) {
        max = Math.max(max, stringWidth(line));
      }
      return max;
    };
    module2.exports = widestLine;
    module2.exports.default = widestLine;
  }
});

// node_modules/cli-boxes/boxes.json
var require_boxes = __commonJS({
  "node_modules/cli-boxes/boxes.json"(exports, module2) {
    module2.exports = {
      single: {
        topLeft: "\u250C",
        topRight: "\u2510",
        bottomRight: "\u2518",
        bottomLeft: "\u2514",
        vertical: "\u2502",
        horizontal: "\u2500"
      },
      double: {
        topLeft: "\u2554",
        topRight: "\u2557",
        bottomRight: "\u255D",
        bottomLeft: "\u255A",
        vertical: "\u2551",
        horizontal: "\u2550"
      },
      round: {
        topLeft: "\u256D",
        topRight: "\u256E",
        bottomRight: "\u256F",
        bottomLeft: "\u2570",
        vertical: "\u2502",
        horizontal: "\u2500"
      },
      bold: {
        topLeft: "\u250F",
        topRight: "\u2513",
        bottomRight: "\u251B",
        bottomLeft: "\u2517",
        vertical: "\u2503",
        horizontal: "\u2501"
      },
      singleDouble: {
        topLeft: "\u2553",
        topRight: "\u2556",
        bottomRight: "\u255C",
        bottomLeft: "\u2559",
        vertical: "\u2551",
        horizontal: "\u2500"
      },
      doubleSingle: {
        topLeft: "\u2552",
        topRight: "\u2555",
        bottomRight: "\u255B",
        bottomLeft: "\u2558",
        vertical: "\u2502",
        horizontal: "\u2550"
      },
      classic: {
        topLeft: "+",
        topRight: "+",
        bottomRight: "+",
        bottomLeft: "+",
        vertical: "|",
        horizontal: "-"
      }
    };
  }
});

// node_modules/cli-boxes/index.js
var require_cli_boxes = __commonJS({
  "node_modules/cli-boxes/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var cliBoxes = require_boxes();
    module2.exports = cliBoxes;
    module2.exports.default = cliBoxes;
  }
});

// node_modules/camelcase/index.js
var require_camelcase = __commonJS({
  "node_modules/camelcase/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var preserveCamelCase = (string, locale) => {
      let isLastCharLower = false;
      let isLastCharUpper = false;
      let isLastLastCharUpper = false;
      for (let i = 0; i < string.length; i++) {
        const character = string[i];
        if (isLastCharLower && /[\p{Lu}]/u.test(character)) {
          string = string.slice(0, i) + "-" + string.slice(i);
          isLastCharLower = false;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = true;
          i++;
        } else if (isLastCharUpper && isLastLastCharUpper && /[\p{Ll}]/u.test(character)) {
          string = string.slice(0, i - 1) + "-" + string.slice(i - 1);
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = false;
          isLastCharLower = true;
        } else {
          isLastCharLower = character.toLocaleLowerCase(locale) === character && character.toLocaleUpperCase(locale) !== character;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = character.toLocaleUpperCase(locale) === character && character.toLocaleLowerCase(locale) !== character;
        }
      }
      return string;
    };
    var preserveConsecutiveUppercase = (input) => {
      return input.replace(/^[\p{Lu}](?![\p{Lu}])/gu, (m1) => m1.toLowerCase());
    };
    var postProcess = (input, options2) => {
      return input.replace(/[_.\- ]+([\p{Alpha}\p{N}_]|$)/gu, (_, p1) => p1.toLocaleUpperCase(options2.locale)).replace(/\d+([\p{Alpha}\p{N}_]|$)/gu, (m) => m.toLocaleUpperCase(options2.locale));
    };
    var camelCase = (input, options2) => {
      if (!(typeof input === "string" || Array.isArray(input))) {
        throw new TypeError("Expected the input to be `string | string[]`");
      }
      options2 = {
        pascalCase: false,
        preserveConsecutiveUppercase: false,
        ...options2
      };
      if (Array.isArray(input)) {
        input = input.map((x) => x.trim()).filter((x) => x.length).join("-");
      } else {
        input = input.trim();
      }
      if (input.length === 0) {
        return "";
      }
      if (input.length === 1) {
        return options2.pascalCase ? input.toLocaleUpperCase(options2.locale) : input.toLocaleLowerCase(options2.locale);
      }
      const hasUpperCase = input !== input.toLocaleLowerCase(options2.locale);
      if (hasUpperCase) {
        input = preserveCamelCase(input, options2.locale);
      }
      input = input.replace(/^[_.\- ]+/, "");
      if (options2.preserveConsecutiveUppercase) {
        input = preserveConsecutiveUppercase(input);
      } else {
        input = input.toLocaleLowerCase();
      }
      if (options2.pascalCase) {
        input = input.charAt(0).toLocaleUpperCase(options2.locale) + input.slice(1);
      }
      return postProcess(input, options2);
    };
    module2.exports = camelCase;
    module2.exports.default = camelCase;
  }
});

// node_modules/ansi-align/node_modules/ansi-regex/index.js
var require_ansi_regex2 = __commonJS({
  "node_modules/ansi-align/node_modules/ansi-regex/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = (options2) => {
      options2 = Object.assign({
        onlyFirst: false
      }, options2);
      const pattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
      ].join("|");
      return new RegExp(pattern, options2.onlyFirst ? void 0 : "g");
    };
  }
});

// node_modules/ansi-align/node_modules/strip-ansi/index.js
var require_strip_ansi2 = __commonJS({
  "node_modules/ansi-align/node_modules/strip-ansi/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var ansiRegex = require_ansi_regex2();
    var stripAnsi = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
    module2.exports = stripAnsi;
    module2.exports.default = stripAnsi;
  }
});

// node_modules/ansi-align/node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point2 = __commonJS({
  "node_modules/ansi-align/node_modules/is-fullwidth-code-point/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = (x) => {
      if (Number.isNaN(x)) {
        return false;
      }
      if (x >= 4352 && (x <= 4447 || x === 9001 || x === 9002 || 11904 <= x && x <= 12871 && x !== 12351 || 12880 <= x && x <= 19903 || 19968 <= x && x <= 42182 || 43360 <= x && x <= 43388 || 44032 <= x && x <= 55203 || 63744 <= x && x <= 64255 || 65040 <= x && x <= 65049 || 65072 <= x && x <= 65131 || 65281 <= x && x <= 65376 || 65504 <= x && x <= 65510 || 110592 <= x && x <= 110593 || 127488 <= x && x <= 127569 || 131072 <= x && x <= 262141)) {
        return true;
      }
      return false;
    };
  }
});

// node_modules/ansi-align/node_modules/emoji-regex/index.js
var require_emoji_regex2 = __commonJS({
  "node_modules/ansi-align/node_modules/emoji-regex/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = function() {
      return /\uD83C\uDFF4(?:\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74)\uDB40\uDC7F|\u200D\u2620\uFE0F)|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3]))|\uD83D\uDC69\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83D\uDC69\u200D[\u2695\u2696\u2708])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC68(?:\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDD1-\uDDDD])/g;
    };
  }
});

// node_modules/ansi-align/node_modules/string-width/index.js
var require_string_width2 = __commonJS({
  "node_modules/ansi-align/node_modules/string-width/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var stripAnsi = require_strip_ansi2();
    var isFullwidthCodePoint = require_is_fullwidth_code_point2();
    var emojiRegex = require_emoji_regex2()();
    module2.exports = (input) => {
      input = input.replace(emojiRegex, "  ");
      if (typeof input !== "string" || input.length === 0) {
        return 0;
      }
      input = stripAnsi(input);
      let width = 0;
      for (let i = 0; i < input.length; i++) {
        const code = input.codePointAt(i);
        if (code <= 31 || code >= 127 && code <= 159) {
          continue;
        }
        if (code >= 768 && code <= 879) {
          continue;
        }
        if (code > 65535) {
          i++;
        }
        width += isFullwidthCodePoint(code) ? 2 : 1;
      }
      return width;
    };
  }
});

// node_modules/ansi-align/index.js
var require_ansi_align = __commonJS({
  "node_modules/ansi-align/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var stringWidth = require_string_width2();
    function ansiAlign(text, opts) {
      if (!text)
        return text;
      opts = opts || {};
      const align = opts.align || "center";
      if (align === "left")
        return text;
      const split = opts.split || "\n";
      const pad = opts.pad || " ";
      const widthDiffFn = align !== "right" ? halfDiff : fullDiff;
      let returnString = false;
      if (!Array.isArray(text)) {
        returnString = true;
        text = String(text).split(split);
      }
      let width;
      let maxWidth = 0;
      text = text.map(function(str) {
        str = String(str);
        width = stringWidth(str);
        maxWidth = Math.max(width, maxWidth);
        return {
          str,
          width
        };
      }).map(function(obj) {
        return new Array(widthDiffFn(maxWidth, obj.width) + 1).join(pad) + obj.str;
      });
      return returnString ? text.join(split) : text;
    }
    ansiAlign.left = function left(text) {
      return ansiAlign(text, { align: "left" });
    };
    ansiAlign.center = function center(text) {
      return ansiAlign(text, { align: "center" });
    };
    ansiAlign.right = function right(text) {
      return ansiAlign(text, { align: "right" });
    };
    module2.exports = ansiAlign;
    function halfDiff(maxWidth, curWidth) {
      return Math.floor((maxWidth - curWidth) / 2);
    }
    function fullDiff(maxWidth, curWidth) {
      return maxWidth - curWidth;
    }
  }
});

// node_modules/wrap-ansi/index.js
var require_wrap_ansi = __commonJS({
  "node_modules/wrap-ansi/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var stringWidth = require_string_width();
    var stripAnsi = require_strip_ansi();
    var ansiStyles = require_ansi_styles();
    var ESCAPES = new Set([
      "",
      "\x9B"
    ]);
    var END_CODE = 39;
    var ANSI_ESCAPE_BELL = "\x07";
    var ANSI_CSI = "[";
    var ANSI_OSC = "]";
    var ANSI_SGR_TERMINATOR = "m";
    var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
    var wrapAnsi = (code) => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
    var wrapAnsiHyperlink = (uri) => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;
    var wordLengths = (string) => string.split(" ").map((character) => stringWidth(character));
    var wrapWord = (rows, word, columns) => {
      const characters = [...word];
      let isInsideEscape = false;
      let isInsideLinkEscape = false;
      let visible = stringWidth(stripAnsi(rows[rows.length - 1]));
      for (const [index2, character] of characters.entries()) {
        const characterLength = stringWidth(character);
        if (visible + characterLength <= columns) {
          rows[rows.length - 1] += character;
        } else {
          rows.push(character);
          visible = 0;
        }
        if (ESCAPES.has(character)) {
          isInsideEscape = true;
          isInsideLinkEscape = characters.slice(index2 + 1).join("").startsWith(ANSI_ESCAPE_LINK);
        }
        if (isInsideEscape) {
          if (isInsideLinkEscape) {
            if (character === ANSI_ESCAPE_BELL) {
              isInsideEscape = false;
              isInsideLinkEscape = false;
            }
          } else if (character === ANSI_SGR_TERMINATOR) {
            isInsideEscape = false;
          }
          continue;
        }
        visible += characterLength;
        if (visible === columns && index2 < characters.length - 1) {
          rows.push("");
          visible = 0;
        }
      }
      if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
        rows[rows.length - 2] += rows.pop();
      }
    };
    var stringVisibleTrimSpacesRight = (string) => {
      const words = string.split(" ");
      let last = words.length;
      while (last > 0) {
        if (stringWidth(words[last - 1]) > 0) {
          break;
        }
        last--;
      }
      if (last === words.length) {
        return string;
      }
      return words.slice(0, last).join(" ") + words.slice(last).join("");
    };
    var exec = (string, columns, options2 = {}) => {
      if (options2.trim !== false && string.trim() === "") {
        return "";
      }
      let returnValue = "";
      let escapeCode;
      let escapeUrl;
      const lengths = wordLengths(string);
      let rows = [""];
      for (const [index2, word] of string.split(" ").entries()) {
        if (options2.trim !== false) {
          rows[rows.length - 1] = rows[rows.length - 1].trimStart();
        }
        let rowLength = stringWidth(rows[rows.length - 1]);
        if (index2 !== 0) {
          if (rowLength >= columns && (options2.wordWrap === false || options2.trim === false)) {
            rows.push("");
            rowLength = 0;
          }
          if (rowLength > 0 || options2.trim === false) {
            rows[rows.length - 1] += " ";
            rowLength++;
          }
        }
        if (options2.hard && lengths[index2] > columns) {
          const remainingColumns = columns - rowLength;
          const breaksStartingThisLine = 1 + Math.floor((lengths[index2] - remainingColumns - 1) / columns);
          const breaksStartingNextLine = Math.floor((lengths[index2] - 1) / columns);
          if (breaksStartingNextLine < breaksStartingThisLine) {
            rows.push("");
          }
          wrapWord(rows, word, columns);
          continue;
        }
        if (rowLength + lengths[index2] > columns && rowLength > 0 && lengths[index2] > 0) {
          if (options2.wordWrap === false && rowLength < columns) {
            wrapWord(rows, word, columns);
            continue;
          }
          rows.push("");
        }
        if (rowLength + lengths[index2] > columns && options2.wordWrap === false) {
          wrapWord(rows, word, columns);
          continue;
        }
        rows[rows.length - 1] += word;
      }
      if (options2.trim !== false) {
        rows = rows.map(stringVisibleTrimSpacesRight);
      }
      const pre = [...rows.join("\n")];
      for (const [index2, character] of pre.entries()) {
        returnValue += character;
        if (ESCAPES.has(character)) {
          const { groups } = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(pre.slice(index2).join("")) || { groups: {} };
          if (groups.code !== void 0) {
            const code2 = Number.parseFloat(groups.code);
            escapeCode = code2 === END_CODE ? void 0 : code2;
          } else if (groups.uri !== void 0) {
            escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
          }
        }
        const code = ansiStyles.codes.get(Number(escapeCode));
        if (pre[index2 + 1] === "\n") {
          if (escapeUrl) {
            returnValue += wrapAnsiHyperlink("");
          }
          if (escapeCode && code) {
            returnValue += wrapAnsi(code);
          }
        } else if (character === "\n") {
          if (escapeCode && code) {
            returnValue += wrapAnsi(escapeCode);
          }
          if (escapeUrl) {
            returnValue += wrapAnsiHyperlink(escapeUrl);
          }
        }
      }
      return returnValue;
    };
    module2.exports = (string, columns, options2) => {
      return String(string).normalize().replace(/\r\n/g, "\n").split("\n").map((line) => exec(line, columns, options2)).join("\n");
    };
  }
});

// node_modules/boxen/index.js
var require_boxen = __commonJS({
  "node_modules/boxen/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var stringWidth = require_string_width();
    var chalk = require_source();
    var widestLine = require_widest_line();
    var cliBoxes = require_cli_boxes();
    var camelCase = require_camelcase();
    var ansiAlign = require_ansi_align();
    var wrapAnsi = require_wrap_ansi();
    var terminalColumns = () => {
      const { env, stdout, stderr } = process;
      if (stdout && stdout.columns) {
        return stdout.columns;
      }
      if (stderr && stderr.columns) {
        return stderr.columns;
      }
      if (env.COLUMNS) {
        return Number.parseInt(env.COLUMNS, 10);
      }
      return 80;
    };
    var getObject = (detail) => {
      return typeof detail === "number" ? {
        top: detail,
        right: detail * 3,
        bottom: detail,
        left: detail * 3
      } : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...detail
      };
    };
    var getBorderChars = (borderStyle) => {
      const sides = [
        "topLeft",
        "topRight",
        "bottomRight",
        "bottomLeft",
        "vertical",
        "horizontal"
      ];
      let chararacters;
      if (typeof borderStyle === "string") {
        chararacters = cliBoxes[borderStyle];
        if (!chararacters) {
          throw new TypeError(`Invalid border style: ${borderStyle}`);
        }
      } else {
        for (const side of sides) {
          if (!borderStyle[side] || typeof borderStyle[side] !== "string") {
            throw new TypeError(`Invalid border style: ${side}`);
          }
        }
        chararacters = borderStyle;
      }
      return chararacters;
    };
    var isHex = (color) => color.match(/^#(?:[0-f]{3}){1,2}$/i);
    var isColorValid = (color) => typeof color === "string" && (chalk[color] || isHex(color));
    var getColorFn = (color) => isHex(color) ? chalk.hex(color) : chalk[color];
    var getBGColorFn = (color) => isHex(color) ? chalk.bgHex(color) : chalk[camelCase(["bg", color])];
    module2.exports = (text, options2) => {
      options2 = {
        padding: 0,
        borderStyle: "single",
        dimBorder: false,
        align: "left",
        float: "left",
        ...options2
      };
      if (options2.borderColor && !isColorValid(options2.borderColor)) {
        throw new Error(`${options2.borderColor} is not a valid borderColor`);
      }
      if (options2.backgroundColor && !isColorValid(options2.backgroundColor)) {
        throw new Error(`${options2.backgroundColor} is not a valid backgroundColor`);
      }
      const chars2 = getBorderChars(options2.borderStyle);
      const padding = getObject(options2.padding);
      const margin = getObject(options2.margin);
      const colorizeBorder = (border) => {
        const newBorder = options2.borderColor ? getColorFn(options2.borderColor)(border) : border;
        return options2.dimBorder ? chalk.dim(newBorder) : newBorder;
      };
      const colorizeContent = (content) => options2.backgroundColor ? getBGColorFn(options2.backgroundColor)(content) : content;
      const NL = "\n";
      const PAD = " ";
      const columns = terminalColumns();
      text = ansiAlign(text, { align: options2.align });
      let lines = text.split(NL);
      let contentWidth = widestLine(text) + padding.left + padding.right;
      const BORDERS_WIDTH = 2;
      if (contentWidth + BORDERS_WIDTH > columns) {
        contentWidth = columns - BORDERS_WIDTH;
        const max = contentWidth - padding.left - padding.right;
        const newLines = [];
        for (const line of lines) {
          const createdLines = wrapAnsi(line, max, { hard: true });
          const alignedLines = ansiAlign(createdLines, { align: options2.align });
          const alignedLinesArray = alignedLines.split("\n");
          const longestLength = Math.max(...alignedLinesArray.map((s2) => stringWidth(s2)));
          for (const alignedLine of alignedLinesArray) {
            let paddedLine;
            switch (options2.align) {
              case "center":
                paddedLine = PAD.repeat((max - longestLength) / 2) + alignedLine;
                break;
              case "right":
                paddedLine = PAD.repeat(max - longestLength) + alignedLine;
                break;
              default:
                paddedLine = alignedLine;
                break;
            }
            newLines.push(paddedLine);
          }
        }
        lines = newLines;
      }
      if (contentWidth + BORDERS_WIDTH + margin.left + margin.right > columns) {
        const spaceForMargins = columns - contentWidth - BORDERS_WIDTH;
        const multiplier = spaceForMargins / (margin.left + margin.right);
        margin.left = Math.floor(margin.left * multiplier);
        margin.right = Math.floor(margin.right * multiplier);
      }
      if (padding.top > 0) {
        lines = new Array(padding.top).fill("").concat(lines);
      }
      if (padding.bottom > 0) {
        lines = lines.concat(new Array(padding.bottom).fill(""));
      }
      const paddingLeft = PAD.repeat(padding.left);
      let marginLeft = PAD.repeat(margin.left);
      if (options2.float === "center") {
        const padWidth = Math.max((columns - contentWidth - BORDERS_WIDTH) / 2, 0);
        marginLeft = PAD.repeat(padWidth);
      } else if (options2.float === "right") {
        const padWidth = Math.max(columns - contentWidth - margin.right - BORDERS_WIDTH, 0);
        marginLeft = PAD.repeat(padWidth);
      }
      const horizontal = chars2.horizontal.repeat(contentWidth);
      const top = colorizeBorder(NL.repeat(margin.top) + marginLeft + chars2.topLeft + horizontal + chars2.topRight);
      const bottom = colorizeBorder(marginLeft + chars2.bottomLeft + horizontal + chars2.bottomRight + NL.repeat(margin.bottom));
      const side = colorizeBorder(chars2.vertical);
      const LINE_SEPARATOR = contentWidth + BORDERS_WIDTH + margin.left >= columns ? "" : NL;
      const middle = lines.map((line) => {
        const paddingRight = PAD.repeat(contentWidth - stringWidth(line) - padding.left);
        return marginLeft + side + colorizeContent(paddingLeft + line + paddingRight) + side;
      }).join(LINE_SEPARATOR);
      return top + LINE_SEPARATOR + middle + LINE_SEPARATOR + bottom;
    };
    module2.exports._borderStyles = cliBoxes;
  }
});

// node_modules/node-fetch/lib/index.js
var require_lib = __commonJS({
  "node_modules/node-fetch/lib/index.js"(exports, module2) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var Stream2 = _interopDefault(require("stream"));
    var http2 = _interopDefault(require("http"));
    var Url = _interopDefault(require("url"));
    var https2 = _interopDefault(require("https"));
    var zlib2 = _interopDefault(require("zlib"));
    var Readable2 = Stream2.Readable;
    var BUFFER = Symbol("buffer");
    var TYPE = Symbol("type");
    var Blob2 = class {
      constructor() {
        this[TYPE] = "";
        const blobParts = arguments[0];
        const options2 = arguments[1];
        const buffers = [];
        let size = 0;
        if (blobParts) {
          const a = blobParts;
          const length = Number(a.length);
          for (let i = 0; i < length; i++) {
            const element = a[i];
            let buffer;
            if (element instanceof Buffer) {
              buffer = element;
            } else if (ArrayBuffer.isView(element)) {
              buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
            } else if (element instanceof ArrayBuffer) {
              buffer = Buffer.from(element);
            } else if (element instanceof Blob2) {
              buffer = element[BUFFER];
            } else {
              buffer = Buffer.from(typeof element === "string" ? element : String(element));
            }
            size += buffer.length;
            buffers.push(buffer);
          }
        }
        this[BUFFER] = Buffer.concat(buffers);
        let type = options2 && options2.type !== void 0 && String(options2.type).toLowerCase();
        if (type && !/[^\u0020-\u007E]/.test(type)) {
          this[TYPE] = type;
        }
      }
      get size() {
        return this[BUFFER].length;
      }
      get type() {
        return this[TYPE];
      }
      text() {
        return Promise.resolve(this[BUFFER].toString());
      }
      arrayBuffer() {
        const buf = this[BUFFER];
        const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        return Promise.resolve(ab);
      }
      stream() {
        const readable = new Readable2();
        readable._read = function() {
        };
        readable.push(this[BUFFER]);
        readable.push(null);
        return readable;
      }
      toString() {
        return "[object Blob]";
      }
      slice() {
        const size = this.size;
        const start = arguments[0];
        const end = arguments[1];
        let relativeStart, relativeEnd;
        if (start === void 0) {
          relativeStart = 0;
        } else if (start < 0) {
          relativeStart = Math.max(size + start, 0);
        } else {
          relativeStart = Math.min(start, size);
        }
        if (end === void 0) {
          relativeEnd = size;
        } else if (end < 0) {
          relativeEnd = Math.max(size + end, 0);
        } else {
          relativeEnd = Math.min(end, size);
        }
        const span = Math.max(relativeEnd - relativeStart, 0);
        const buffer = this[BUFFER];
        const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
        const blob = new Blob2([], { type: arguments[2] });
        blob[BUFFER] = slicedBuffer;
        return blob;
      }
    };
    Object.defineProperties(Blob2.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Object.defineProperty(Blob2.prototype, Symbol.toStringTag, {
      value: "Blob",
      writable: false,
      enumerable: false,
      configurable: true
    });
    function FetchError2(message, type, systemError) {
      Error.call(this, message);
      this.message = message;
      this.type = type;
      if (systemError) {
        this.code = this.errno = systemError.code;
      }
      Error.captureStackTrace(this, this.constructor);
    }
    FetchError2.prototype = Object.create(Error.prototype);
    FetchError2.prototype.constructor = FetchError2;
    FetchError2.prototype.name = "FetchError";
    var convert;
    try {
      convert = require("encoding").convert;
    } catch (e) {
    }
    var INTERNALS2 = Symbol("Body internals");
    var PassThrough2 = Stream2.PassThrough;
    function Body2(body) {
      var _this = this;
      var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$size = _ref.size;
      let size = _ref$size === void 0 ? 0 : _ref$size;
      var _ref$timeout = _ref.timeout;
      let timeout = _ref$timeout === void 0 ? 0 : _ref$timeout;
      if (body == null) {
        body = null;
      } else if (isURLSearchParams(body)) {
        body = Buffer.from(body.toString());
      } else if (isBlob2(body))
        ;
      else if (Buffer.isBuffer(body))
        ;
      else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
        body = Buffer.from(body);
      } else if (ArrayBuffer.isView(body)) {
        body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
      } else if (body instanceof Stream2)
        ;
      else {
        body = Buffer.from(String(body));
      }
      this[INTERNALS2] = {
        body,
        disturbed: false,
        error: null
      };
      this.size = size;
      this.timeout = timeout;
      if (body instanceof Stream2) {
        body.on("error", function(err) {
          const error3 = err.name === "AbortError" ? err : new FetchError2(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
          _this[INTERNALS2].error = error3;
        });
      }
    }
    Body2.prototype = {
      get body() {
        return this[INTERNALS2].body;
      },
      get bodyUsed() {
        return this[INTERNALS2].disturbed;
      },
      arrayBuffer() {
        return consumeBody2.call(this).then(function(buf) {
          return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        });
      },
      blob() {
        let ct = this.headers && this.headers.get("content-type") || "";
        return consumeBody2.call(this).then(function(buf) {
          return Object.assign(new Blob2([], {
            type: ct.toLowerCase()
          }), {
            [BUFFER]: buf
          });
        });
      },
      json() {
        var _this2 = this;
        return consumeBody2.call(this).then(function(buffer) {
          try {
            return JSON.parse(buffer.toString());
          } catch (err) {
            return Body2.Promise.reject(new FetchError2(`invalid json response body at ${_this2.url} reason: ${err.message}`, "invalid-json"));
          }
        });
      },
      text() {
        return consumeBody2.call(this).then(function(buffer) {
          return buffer.toString();
        });
      },
      buffer() {
        return consumeBody2.call(this);
      },
      textConverted() {
        var _this3 = this;
        return consumeBody2.call(this).then(function(buffer) {
          return convertBody(buffer, _this3.headers);
        });
      }
    };
    Object.defineProperties(Body2.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    Body2.mixIn = function(proto) {
      for (const name of Object.getOwnPropertyNames(Body2.prototype)) {
        if (!(name in proto)) {
          const desc = Object.getOwnPropertyDescriptor(Body2.prototype, name);
          Object.defineProperty(proto, name, desc);
        }
      }
    };
    function consumeBody2() {
      var _this4 = this;
      if (this[INTERNALS2].disturbed) {
        return Body2.Promise.reject(new TypeError(`body used already for: ${this.url}`));
      }
      this[INTERNALS2].disturbed = true;
      if (this[INTERNALS2].error) {
        return Body2.Promise.reject(this[INTERNALS2].error);
      }
      let body = this.body;
      if (body === null) {
        return Body2.Promise.resolve(Buffer.alloc(0));
      }
      if (isBlob2(body)) {
        body = body.stream();
      }
      if (Buffer.isBuffer(body)) {
        return Body2.Promise.resolve(body);
      }
      if (!(body instanceof Stream2)) {
        return Body2.Promise.resolve(Buffer.alloc(0));
      }
      let accum = [];
      let accumBytes = 0;
      let abort = false;
      return new Body2.Promise(function(resolve2, reject) {
        let resTimeout;
        if (_this4.timeout) {
          resTimeout = setTimeout(function() {
            abort = true;
            reject(new FetchError2(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, "body-timeout"));
          }, _this4.timeout);
        }
        body.on("error", function(err) {
          if (err.name === "AbortError") {
            abort = true;
            reject(err);
          } else {
            reject(new FetchError2(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, "system", err));
          }
        });
        body.on("data", function(chunk) {
          if (abort || chunk === null) {
            return;
          }
          if (_this4.size && accumBytes + chunk.length > _this4.size) {
            abort = true;
            reject(new FetchError2(`content size at ${_this4.url} over limit: ${_this4.size}`, "max-size"));
            return;
          }
          accumBytes += chunk.length;
          accum.push(chunk);
        });
        body.on("end", function() {
          if (abort) {
            return;
          }
          clearTimeout(resTimeout);
          try {
            resolve2(Buffer.concat(accum, accumBytes));
          } catch (err) {
            reject(new FetchError2(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, "system", err));
          }
        });
      });
    }
    function convertBody(buffer, headers) {
      if (typeof convert !== "function") {
        throw new Error("The package `encoding` must be installed to use the textConverted() function");
      }
      const ct = headers.get("content-type");
      let charset = "utf-8";
      let res, str;
      if (ct) {
        res = /charset=([^;]*)/i.exec(ct);
      }
      str = buffer.slice(0, 1024).toString();
      if (!res && str) {
        res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
      }
      if (!res && str) {
        res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
        if (!res) {
          res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
          if (res) {
            res.pop();
          }
        }
        if (res) {
          res = /charset=(.*)/i.exec(res.pop());
        }
      }
      if (!res && str) {
        res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
      }
      if (res) {
        charset = res.pop();
        if (charset === "gb2312" || charset === "gbk") {
          charset = "gb18030";
        }
      }
      return convert(buffer, "UTF-8", charset).toString();
    }
    function isURLSearchParams(obj) {
      if (typeof obj !== "object" || typeof obj.append !== "function" || typeof obj.delete !== "function" || typeof obj.get !== "function" || typeof obj.getAll !== "function" || typeof obj.has !== "function" || typeof obj.set !== "function") {
        return false;
      }
      return obj.constructor.name === "URLSearchParams" || Object.prototype.toString.call(obj) === "[object URLSearchParams]" || typeof obj.sort === "function";
    }
    function isBlob2(obj) {
      return typeof obj === "object" && typeof obj.arrayBuffer === "function" && typeof obj.type === "string" && typeof obj.stream === "function" && typeof obj.constructor === "function" && typeof obj.constructor.name === "string" && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
    }
    function clone2(instance) {
      let p1, p2;
      let body = instance.body;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof Stream2 && typeof body.getBoundary !== "function") {
        p1 = new PassThrough2();
        p2 = new PassThrough2();
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS2].body = p1;
        body = p2;
      }
      return body;
    }
    function extractContentType2(body) {
      if (body === null) {
        return null;
      } else if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      } else if (isURLSearchParams(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      } else if (isBlob2(body)) {
        return body.type || null;
      } else if (Buffer.isBuffer(body)) {
        return null;
      } else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
        return null;
      } else if (ArrayBuffer.isView(body)) {
        return null;
      } else if (typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      } else if (body instanceof Stream2) {
        return null;
      } else {
        return "text/plain;charset=UTF-8";
      }
    }
    function getTotalBytes2(instance) {
      const body = instance.body;
      if (body === null) {
        return 0;
      } else if (isBlob2(body)) {
        return body.size;
      } else if (Buffer.isBuffer(body)) {
        return body.length;
      } else if (body && typeof body.getLengthSync === "function") {
        if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || body.hasKnownLength && body.hasKnownLength()) {
          return body.getLengthSync();
        }
        return null;
      } else {
        return null;
      }
    }
    function writeToStream2(dest, instance) {
      const body = instance.body;
      if (body === null) {
        dest.end();
      } else if (isBlob2(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    }
    Body2.Promise = global.Promise;
    var invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
    var invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
    function validateName(name) {
      name = `${name}`;
      if (invalidTokenRegex.test(name) || name === "") {
        throw new TypeError(`${name} is not a legal HTTP header name`);
      }
    }
    function validateValue(value) {
      value = `${value}`;
      if (invalidHeaderCharRegex.test(value)) {
        throw new TypeError(`${value} is not a legal HTTP header value`);
      }
    }
    function find(map, name) {
      name = name.toLowerCase();
      for (const key in map) {
        if (key.toLowerCase() === name) {
          return key;
        }
      }
      return void 0;
    }
    var MAP = Symbol("map");
    var Headers2 = class {
      constructor() {
        let init2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
        this[MAP] = Object.create(null);
        if (init2 instanceof Headers2) {
          const rawHeaders = init2.raw();
          const headerNames = Object.keys(rawHeaders);
          for (const headerName of headerNames) {
            for (const value of rawHeaders[headerName]) {
              this.append(headerName, value);
            }
          }
          return;
        }
        if (init2 == null)
          ;
        else if (typeof init2 === "object") {
          const method = init2[Symbol.iterator];
          if (method != null) {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            const pairs = [];
            for (const pair of init2) {
              if (typeof pair !== "object" || typeof pair[Symbol.iterator] !== "function") {
                throw new TypeError("Each header pair must be iterable");
              }
              pairs.push(Array.from(pair));
            }
            for (const pair of pairs) {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              this.append(pair[0], pair[1]);
            }
          } else {
            for (const key of Object.keys(init2)) {
              const value = init2[key];
              this.append(key, value);
            }
          }
        } else {
          throw new TypeError("Provided initializer must be an object");
        }
      }
      get(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key === void 0) {
          return null;
        }
        return this[MAP][key].join(", ");
      }
      forEach(callback) {
        let thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
        let pairs = getHeaders(this);
        let i = 0;
        while (i < pairs.length) {
          var _pairs$i = pairs[i];
          const name = _pairs$i[0], value = _pairs$i[1];
          callback.call(thisArg, value, name, this);
          pairs = getHeaders(this);
          i++;
        }
      }
      set(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        this[MAP][key !== void 0 ? key : name] = [value];
      }
      append(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          this[MAP][key].push(value);
        } else {
          this[MAP][name] = [value];
        }
      }
      has(name) {
        name = `${name}`;
        validateName(name);
        return find(this[MAP], name) !== void 0;
      }
      delete(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          delete this[MAP][key];
        }
      }
      raw() {
        return this[MAP];
      }
      keys() {
        return createHeadersIterator(this, "key");
      }
      values() {
        return createHeadersIterator(this, "value");
      }
      [Symbol.iterator]() {
        return createHeadersIterator(this, "key+value");
      }
    };
    Headers2.prototype.entries = Headers2.prototype[Symbol.iterator];
    Object.defineProperty(Headers2.prototype, Symbol.toStringTag, {
      value: "Headers",
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Headers2.prototype, {
      get: { enumerable: true },
      forEach: { enumerable: true },
      set: { enumerable: true },
      append: { enumerable: true },
      has: { enumerable: true },
      delete: { enumerable: true },
      keys: { enumerable: true },
      values: { enumerable: true },
      entries: { enumerable: true }
    });
    function getHeaders(headers) {
      let kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "key+value";
      const keys = Object.keys(headers[MAP]).sort();
      return keys.map(kind === "key" ? function(k) {
        return k.toLowerCase();
      } : kind === "value" ? function(k) {
        return headers[MAP][k].join(", ");
      } : function(k) {
        return [k.toLowerCase(), headers[MAP][k].join(", ")];
      });
    }
    var INTERNAL = Symbol("internal");
    function createHeadersIterator(target, kind) {
      const iterator = Object.create(HeadersIteratorPrototype);
      iterator[INTERNAL] = {
        target,
        kind,
        index: 0
      };
      return iterator;
    }
    var HeadersIteratorPrototype = Object.setPrototypeOf({
      next() {
        if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
          throw new TypeError("Value of `this` is not a HeadersIterator");
        }
        var _INTERNAL = this[INTERNAL];
        const target = _INTERNAL.target, kind = _INTERNAL.kind, index2 = _INTERNAL.index;
        const values = getHeaders(target, kind);
        const len = values.length;
        if (index2 >= len) {
          return {
            value: void 0,
            done: true
          };
        }
        this[INTERNAL].index = index2 + 1;
        return {
          value: values[index2],
          done: false
        };
      }
    }, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));
    Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
      value: "HeadersIterator",
      writable: false,
      enumerable: false,
      configurable: true
    });
    function exportNodeCompatibleHeaders(headers) {
      const obj = Object.assign({ __proto__: null }, headers[MAP]);
      const hostHeaderKey = find(headers[MAP], "Host");
      if (hostHeaderKey !== void 0) {
        obj[hostHeaderKey] = obj[hostHeaderKey][0];
      }
      return obj;
    }
    function createHeadersLenient(obj) {
      const headers = new Headers2();
      for (const name of Object.keys(obj)) {
        if (invalidTokenRegex.test(name)) {
          continue;
        }
        if (Array.isArray(obj[name])) {
          for (const val of obj[name]) {
            if (invalidHeaderCharRegex.test(val)) {
              continue;
            }
            if (headers[MAP][name] === void 0) {
              headers[MAP][name] = [val];
            } else {
              headers[MAP][name].push(val);
            }
          }
        } else if (!invalidHeaderCharRegex.test(obj[name])) {
          headers[MAP][name] = [obj[name]];
        }
      }
      return headers;
    }
    var INTERNALS$12 = Symbol("Response internals");
    var STATUS_CODES = http2.STATUS_CODES;
    var Response2 = class {
      constructor() {
        let body = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        Body2.call(this, body, opts);
        const status = opts.status || 200;
        const headers = new Headers2(opts.headers);
        if (body != null && !headers.has("Content-Type")) {
          const contentType = extractContentType2(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$12] = {
          url: opts.url,
          status,
          statusText: opts.statusText || STATUS_CODES[status],
          headers,
          counter: opts.counter
        };
      }
      get url() {
        return this[INTERNALS$12].url || "";
      }
      get status() {
        return this[INTERNALS$12].status;
      }
      get ok() {
        return this[INTERNALS$12].status >= 200 && this[INTERNALS$12].status < 300;
      }
      get redirected() {
        return this[INTERNALS$12].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$12].statusText;
      }
      get headers() {
        return this[INTERNALS$12].headers;
      }
      clone() {
        return new Response2(clone2(this), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected
        });
      }
    };
    Body2.mixIn(Response2.prototype);
    Object.defineProperties(Response2.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    Object.defineProperty(Response2.prototype, Symbol.toStringTag, {
      value: "Response",
      writable: false,
      enumerable: false,
      configurable: true
    });
    var INTERNALS$22 = Symbol("Request internals");
    var parse_url = Url.parse;
    var format_url = Url.format;
    var streamDestructionSupported = "destroy" in Stream2.Readable.prototype;
    function isRequest2(input) {
      return typeof input === "object" && typeof input[INTERNALS$22] === "object";
    }
    function isAbortSignal2(signal) {
      const proto = signal && typeof signal === "object" && Object.getPrototypeOf(signal);
      return !!(proto && proto.constructor.name === "AbortSignal");
    }
    var Request2 = class {
      constructor(input) {
        let init2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        let parsedURL;
        if (!isRequest2(input)) {
          if (input && input.href) {
            parsedURL = parse_url(input.href);
          } else {
            parsedURL = parse_url(`${input}`);
          }
          input = {};
        } else {
          parsedURL = parse_url(input.url);
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest2(input) && input.body !== null) && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        let inputBody = init2.body != null ? init2.body : isRequest2(input) && input.body !== null ? clone2(input) : null;
        Body2.call(this, inputBody, {
          timeout: init2.timeout || input.timeout || 0,
          size: init2.size || input.size || 0
        });
        const headers = new Headers2(init2.headers || input.headers || {});
        if (inputBody != null && !headers.has("Content-Type")) {
          const contentType = extractContentType2(inputBody);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest2(input) ? input.signal : null;
        if ("signal" in init2)
          signal = init2.signal;
        if (signal != null && !isAbortSignal2(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS$22] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow !== void 0 ? init2.follow : input.follow !== void 0 ? input.follow : 20;
        this.compress = init2.compress !== void 0 ? init2.compress : input.compress !== void 0 ? input.compress : true;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
      }
      get method() {
        return this[INTERNALS$22].method;
      }
      get url() {
        return format_url(this[INTERNALS$22].parsedURL);
      }
      get headers() {
        return this[INTERNALS$22].headers;
      }
      get redirect() {
        return this[INTERNALS$22].redirect;
      }
      get signal() {
        return this[INTERNALS$22].signal;
      }
      clone() {
        return new Request2(this);
      }
    };
    Body2.mixIn(Request2.prototype);
    Object.defineProperty(Request2.prototype, Symbol.toStringTag, {
      value: "Request",
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Request2.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    function getNodeRequestOptions2(request) {
      const parsedURL = request[INTERNALS$22].parsedURL;
      const headers = new Headers2(request[INTERNALS$22].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      if (!parsedURL.protocol || !parsedURL.hostname) {
        throw new TypeError("Only absolute URLs are supported");
      }
      if (!/^https?:$/.test(parsedURL.protocol)) {
        throw new TypeError("Only HTTP(S) protocols are supported");
      }
      if (request.signal && request.body instanceof Stream2.Readable && !streamDestructionSupported) {
        throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");
      }
      let contentLengthValue = null;
      if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body != null) {
        const totalBytes = getTotalBytes2(request);
        if (typeof totalBytes === "number") {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate");
      }
      let agent = request.agent;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      return Object.assign({}, parsedURL, {
        method: request.method,
        headers: exportNodeCompatibleHeaders(headers),
        agent
      });
    }
    function AbortError2(message) {
      Error.call(this, message);
      this.type = "aborted";
      this.message = message;
      Error.captureStackTrace(this, this.constructor);
    }
    AbortError2.prototype = Object.create(Error.prototype);
    AbortError2.prototype.constructor = AbortError2;
    AbortError2.prototype.name = "AbortError";
    var PassThrough$1 = Stream2.PassThrough;
    var resolve_url = Url.resolve;
    function fetch2(url, opts) {
      if (!fetch2.Promise) {
        throw new Error("native promise missing, set fetch.Promise to your favorite alternative");
      }
      Body2.Promise = fetch2.Promise;
      return new fetch2.Promise(function(resolve2, reject) {
        const request = new Request2(url, opts);
        const options2 = getNodeRequestOptions2(request);
        const send = (options2.protocol === "https:" ? https2 : http2).request;
        const signal = request.signal;
        let response = null;
        const abort = function abort2() {
          let error3 = new AbortError2("The user aborted a request.");
          reject(error3);
          if (request.body && request.body instanceof Stream2.Readable) {
            request.body.destroy(error3);
          }
          if (!response || !response.body)
            return;
          response.body.emit("error", error3);
        };
        if (signal && signal.aborted) {
          abort();
          return;
        }
        const abortAndFinalize = function abortAndFinalize2() {
          abort();
          finalize();
        };
        const req = send(options2);
        let reqTimeout;
        if (signal) {
          signal.addEventListener("abort", abortAndFinalize);
        }
        function finalize() {
          req.abort();
          if (signal)
            signal.removeEventListener("abort", abortAndFinalize);
          clearTimeout(reqTimeout);
        }
        if (request.timeout) {
          req.once("socket", function(socket) {
            reqTimeout = setTimeout(function() {
              reject(new FetchError2(`network timeout at: ${request.url}`, "request-timeout"));
              finalize();
            }, request.timeout);
          });
        }
        req.on("error", function(err) {
          reject(new FetchError2(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
          finalize();
        });
        req.on("response", function(res) {
          clearTimeout(reqTimeout);
          const headers = createHeadersLenient(res.headers);
          if (fetch2.isRedirect(res.statusCode)) {
            const location = headers.get("Location");
            const locationURL = location === null ? null : resolve_url(request.url, location);
            switch (request.redirect) {
              case "error":
                reject(new FetchError2(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
                finalize();
                return;
              case "manual":
                if (locationURL !== null) {
                  try {
                    headers.set("Location", locationURL);
                  } catch (err) {
                    reject(err);
                  }
                }
                break;
              case "follow":
                if (locationURL === null) {
                  break;
                }
                if (request.counter >= request.follow) {
                  reject(new FetchError2(`maximum redirect reached at: ${request.url}`, "max-redirect"));
                  finalize();
                  return;
                }
                const requestOpts = {
                  headers: new Headers2(request.headers),
                  follow: request.follow,
                  counter: request.counter + 1,
                  agent: request.agent,
                  compress: request.compress,
                  method: request.method,
                  body: request.body,
                  signal: request.signal,
                  timeout: request.timeout,
                  size: request.size
                };
                if (res.statusCode !== 303 && request.body && getTotalBytes2(request) === null) {
                  reject(new FetchError2("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
                  finalize();
                  return;
                }
                if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === "POST") {
                  requestOpts.method = "GET";
                  requestOpts.body = void 0;
                  requestOpts.headers.delete("content-length");
                }
                resolve2(fetch2(new Request2(locationURL, requestOpts)));
                finalize();
                return;
            }
          }
          res.once("end", function() {
            if (signal)
              signal.removeEventListener("abort", abortAndFinalize);
          });
          let body = res.pipe(new PassThrough$1());
          const response_options = {
            url: request.url,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers,
            size: request.size,
            timeout: request.timeout,
            counter: request.counter
          };
          const codings = headers.get("Content-Encoding");
          if (!request.compress || request.method === "HEAD" || codings === null || res.statusCode === 204 || res.statusCode === 304) {
            response = new Response2(body, response_options);
            resolve2(response);
            return;
          }
          const zlibOptions = {
            flush: zlib2.Z_SYNC_FLUSH,
            finishFlush: zlib2.Z_SYNC_FLUSH
          };
          if (codings == "gzip" || codings == "x-gzip") {
            body = body.pipe(zlib2.createGunzip(zlibOptions));
            response = new Response2(body, response_options);
            resolve2(response);
            return;
          }
          if (codings == "deflate" || codings == "x-deflate") {
            const raw = res.pipe(new PassThrough$1());
            raw.once("data", function(chunk) {
              if ((chunk[0] & 15) === 8) {
                body = body.pipe(zlib2.createInflate());
              } else {
                body = body.pipe(zlib2.createInflateRaw());
              }
              response = new Response2(body, response_options);
              resolve2(response);
            });
            return;
          }
          if (codings == "br" && typeof zlib2.createBrotliDecompress === "function") {
            body = body.pipe(zlib2.createBrotliDecompress());
            response = new Response2(body, response_options);
            resolve2(response);
            return;
          }
          response = new Response2(body, response_options);
          resolve2(response);
        });
        writeToStream2(req, request);
      });
    }
    fetch2.isRedirect = function(code) {
      return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
    };
    fetch2.Promise = global.Promise;
    module2.exports = exports = fetch2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = exports;
    exports.Headers = Headers2;
    exports.Request = Request2;
    exports.Response = Response2;
    exports.FetchError = FetchError2;
  }
});

// node_modules/cross-fetch/dist/node-ponyfill.js
var require_node_ponyfill = __commonJS({
  "node_modules/cross-fetch/dist/node-ponyfill.js"(exports, module2) {
    init_shims();
    var nodeFetch = require_lib();
    var realFetch = nodeFetch.default || nodeFetch;
    var fetch2 = function(url, options2) {
      if (/^\/\//.test(url)) {
        url = "https:" + url;
      }
      return realFetch.call(this, url, options2);
    };
    fetch2.ponyfill = true;
    module2.exports = exports = fetch2;
    exports.fetch = fetch2;
    exports.Headers = nodeFetch.Headers;
    exports.Request = nodeFetch.Request;
    exports.Response = nodeFetch.Response;
    exports.default = fetch2;
  }
});

// node_modules/faunadb/src/_util.js
var require_util2 = __commonJS({
  "node_modules/faunadb/src/_util.js"(exports, module2) {
    init_shims();
    "use strict";
    var packageJson = require_package();
    var chalk = require_source();
    var boxen = require_boxen();
    var crossGlobal = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : self;
    function inherits(ctor, superCtor) {
      if (ctor === void 0 || ctor === null) {
        throw new TypeError('The constructor to "inherits" must not be null or undefined');
      }
      if (superCtor === void 0 || superCtor === null) {
        throw new TypeError('The super constructor to "inherits" must not be null or undefined');
      }
      if (superCtor.prototype === void 0) {
        throw new TypeError('The super constructor to "inherits" must have a prototype');
      }
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
    function isNodeEnv() {
      return typeof window === "undefined" && typeof process !== "undefined" && process.versions != null && process.versions.node != null;
    }
    function getEnvVariable(envKey) {
      var areEnvVarsAvailable = !!(typeof process !== "undefined" && process && process.env);
      if (areEnvVarsAvailable && process.env[envKey] != null) {
        return process.env[envKey];
      }
    }
    function getBrowserDetails() {
      var browser = navigator.appName;
      var browserVersion = "" + parseFloat(navigator.appVersion);
      var nameOffset, verOffset, ix;
      if ((verOffset = navigator.userAgent.indexOf("Opera")) != -1) {
        browser = "Opera";
        browserVersion = navigator.userAgent.substring(verOffset + 6);
        if ((verOffset = navigator.userAgent.indexOf("Version")) != -1) {
          browserVersion = navigator.userAgent.substring(verOffset + 8);
        }
      } else if ((verOffset = navigator.userAgent.indexOf("MSIE")) != -1) {
        browser = "Microsoft Internet Explorer";
        browserVersion = navigator.userAgent.substring(verOffset + 5);
      } else if (browser == "Netscape" && navigator.userAgent.indexOf("Trident/") != -1) {
        browser = "Microsoft Internet Explorer";
        browserVersion = navigator.userAgent.substring(verOffset + 5);
        if ((verOffset = navigator.userAgent.indexOf("rv:")) != -1) {
          browserVersion = navigator.userAgent.substring(verOffset + 3);
        }
      } else if ((verOffset = navigator.userAgent.indexOf("Chrome")) != -1) {
        browser = "Chrome";
        browserVersion = navigator.userAgent.substring(verOffset + 7);
      } else if ((verOffset = navigator.userAgent.indexOf("Safari")) != -1) {
        browser = "Safari";
        browserVersion = navigator.userAgent.substring(verOffset + 7);
        if ((verOffset = navigator.userAgent.indexOf("Version")) != -1) {
          browserVersion = navigator.userAgent.substring(verOffset + 8);
        }
        if (navigator.userAgent.indexOf("CriOS") != -1) {
          browser = "Chrome";
        }
      } else if ((verOffset = navigator.userAgent.indexOf("Firefox")) != -1) {
        browser = "Firefox";
        browserVersion = navigator.userAgent.substring(verOffset + 8);
      } else if ((nameOffset = navigator.userAgent.lastIndexOf(" ") + 1) < (verOffset = navigator.userAgent.lastIndexOf("/"))) {
        browser = navigator.userAgent.substring(nameOffset, verOffset);
        browserVersion = navigator.userAgent.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
          browser = navigator.appName;
        }
      }
      if ((ix = browserVersion.indexOf(";")) != -1)
        browserVersion = browserVersion.substring(0, ix);
      if ((ix = browserVersion.indexOf(" ")) != -1)
        browserVersion = browserVersion.substring(0, ix);
      if ((ix = browserVersion.indexOf(")")) != -1)
        browserVersion = browserVersion.substring(0, ix);
      return [browser, browserVersion].join("-");
    }
    function getBrowserOsDetails() {
      var os = "unknown";
      var clientStrings = [
        { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
        { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
        { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
        { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
        { s: "Windows Vista", r: /Windows NT 6.0/ },
        { s: "Windows Server 2003", r: /Windows NT 5.2/ },
        { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
        { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
        { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
        { s: "Windows 98", r: /(Windows 98|Win98)/ },
        { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
        { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
        { s: "Windows CE", r: /Windows CE/ },
        { s: "Windows 3.11", r: /Win16/ },
        { s: "Android", r: /Android/ },
        { s: "Open BSD", r: /OpenBSD/ },
        { s: "Sun OS", r: /SunOS/ },
        { s: "Chrome OS", r: /CrOS/ },
        { s: "Linux", r: /(Linux|X11(?!.*CrOS))/ },
        { s: "iOS", r: /(iPhone|iPad|iPod)/ },
        { s: "Mac OS X", r: /Mac OS X/ },
        { s: "Mac OS", r: /(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        { s: "QNX", r: /QNX/ },
        { s: "UNIX", r: /UNIX/ },
        { s: "BeOS", r: /BeOS/ },
        { s: "OS/2", r: /OS\/2/ },
        {
          s: "Search Bot",
          r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
        }
      ];
      for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(navigator.userAgent)) {
          os = cs.s;
          break;
        }
      }
      var osVersion = "unknown";
      if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        os = "Windows";
      }
      switch (os) {
        case "Mac OS":
        case "Mac OS X":
        case "Android":
          osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(navigator.userAgent)[1];
          break;
        case "iOS":
          osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(navigator.appVersion);
          osVersion = osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0);
          break;
      }
      return [os, osVersion].join("-");
    }
    function getNodeRuntimeEnv() {
      var runtimeEnvs = [
        {
          name: "Netlify",
          check: () => process.env.hasOwnProperty("NETLIFY_IMAGES_CDN_DOMAIN")
        },
        {
          name: "Vercel",
          check: () => process.env.hasOwnProperty("VERCEL")
        },
        {
          name: "Heroku",
          check: () => process.env.hasOwnProperty("PATH") && process.env.PATH.indexOf(".heroku") !== -1
        },
        {
          name: "AWS Lambda",
          check: () => process.env.hasOwnProperty("AWS_LAMBDA_FUNCTION_VERSION")
        },
        {
          name: "GCP Cloud Functions",
          check: () => process.env.hasOwnProperty("_") && process.env._.indexOf("google") !== -1
        },
        {
          name: "GCP Compute Instances",
          check: () => process.env.hasOwnProperty("GOOGLE_CLOUD_PROJECT")
        },
        {
          name: "Azure Cloud Functions",
          check: () => process.env.hasOwnProperty("WEBSITE_FUNCTIONS_AZUREMONITOR_CATEGORIES")
        },
        {
          name: "Azure Compute",
          check: () => process.env.hasOwnProperty("ORYX_ENV_TYPE") && process.env.hasOwnProperty("WEBSITE_INSTANCE_ID") && process.env.ORYX_ENV_TYPE === "AppService"
        },
        {
          name: "Mongo Stitch",
          check: () => typeof crossGlobal.StitchError === "function"
        },
        {
          name: "Render",
          check: () => process.env.hasOwnProperty("RENDER_SERVICE_ID")
        },
        {
          name: "Begin",
          check: () => process.env.hasOwnProperty("BEGIN_DATA_SCOPE_ID")
        }
      ];
      var detectedEnv = runtimeEnvs.find((env) => env.check());
      return detectedEnv ? detectedEnv.name : "unknown";
    }
    function defaults(obj, def) {
      if (obj === void 0) {
        return def;
      } else {
        return obj;
      }
    }
    function applyDefaults(provided, defaults2) {
      var out = {};
      for (var providedKey in provided) {
        if (!(providedKey in defaults2)) {
          throw new Error("No such option " + providedKey);
        }
        out[providedKey] = provided[providedKey];
      }
      for (var defaultsKey in defaults2) {
        if (!(defaultsKey in out)) {
          out[defaultsKey] = defaults2[defaultsKey];
        }
      }
      return out;
    }
    function removeNullAndUndefinedValues(object) {
      var res = {};
      for (var key in object) {
        var val = object[key];
        if (val !== null && val !== void 0) {
          res[key] = val;
        }
      }
      return res;
    }
    function removeUndefinedValues(object) {
      var res = {};
      for (var key in object) {
        var val = object[key];
        if (val !== void 0) {
          res[key] = val;
        }
      }
      return res;
    }
    function checkInstanceHasProperty(obj, prop) {
      return typeof obj === "object" && obj !== null && Boolean(obj[prop]);
    }
    function formatUrl(base, path, query) {
      query = typeof query === "object" ? querystringify(query) : query;
      return [
        base,
        path ? path.charAt(0) === "/" ? "" : "/" + path : "",
        query ? query.charAt(0) === "?" ? "" : "?" + query : ""
      ].join("");
    }
    function querystringify(obj, prefix) {
      prefix = prefix || "";
      var pairs = [], value, key;
      if (typeof prefix !== "string")
        prefix = "?";
      for (key in obj) {
        if (checkInstanceHasProperty(obj, key)) {
          value = obj[key];
          if (!value && (value === null || value === void 0 || isNaN(value))) {
            value = "";
          }
          key = encode(key);
          value = encode(value);
          if (key === null || value === null)
            continue;
          pairs.push(key + "=" + value);
        }
      }
      return pairs.length ? prefix + pairs.join("&") : "";
    }
    function encode(input) {
      try {
        return encodeURIComponent(input);
      } catch (e) {
        return null;
      }
    }
    function mergeObjects(obj1, obj2) {
      var obj3 = {};
      for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
      }
      for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
      }
      return obj3;
    }
    function resolveFetch(fetchOverride) {
      if (typeof fetchOverride === "function") {
        return fetchOverride;
      }
      if (typeof crossGlobal.fetch === "function") {
        return crossGlobal.fetch.bind(crossGlobal);
      }
      return require_node_ponyfill();
    }
    function notifyAboutNewVersion() {
      if (!isNodeEnv())
        return;
      function checkAndNotify(latestVersion) {
        var latest = latestVersion.split(".");
        var current = packageJson.version.split(".");
        var isNewVersionAvailable = latest.some(function(l, index2) {
          return l > current[index2];
        });
        if (isNewVersionAvailable) {
          console.info(boxen("New " + packageJson.name + " version available " + chalk.dim(packageJson.version) + chalk.reset(" \u2192 ") + chalk.green(latestVersion) + `
Changelog: https://github.com/${packageJson.repository}/blob/master/CHANGELOG.md`, { padding: 1, borderColor: "yellow" }));
        }
      }
      resolveFetch()("https://registry.npmjs.org/" + packageJson.name).then((resp) => resp.json()).then((json) => checkAndNotify(json["dist-tags"].latest)).catch((err) => {
        console.error("Unable to check new driver version");
        console.error(err);
      });
    }
    notifyAboutNewVersion();
    module2.exports = {
      crossGlobal,
      mergeObjects,
      formatUrl,
      querystringify,
      inherits,
      isNodeEnv,
      getEnvVariable,
      defaults,
      applyDefaults,
      removeNullAndUndefinedValues,
      removeUndefinedValues,
      checkInstanceHasProperty,
      getBrowserDetails,
      getBrowserOsDetails,
      getNodeRuntimeEnv,
      resolveFetch
    };
  }
});

// node_modules/faunadb/src/Expr.js
var require_Expr = __commonJS({
  "node_modules/faunadb/src/Expr.js"(exports, module2) {
    init_shims();
    "use strict";
    var util = require_util2();
    function Expr(obj) {
      this.raw = obj;
    }
    Expr.prototype._isFaunaExpr = true;
    Expr.prototype.toJSON = function() {
      return this.raw;
    };
    Expr.prototype.toFQL = function() {
      return exprToString(this.raw);
    };
    var varArgsFunctions = [
      "Do",
      "Call",
      "Union",
      "Intersection",
      "Difference",
      "Equals",
      "Add",
      "BitAnd",
      "BitOr",
      "BitXor",
      "Divide",
      "Max",
      "Min",
      "Modulo",
      "Multiply",
      "Subtract",
      "LT",
      "LTE",
      "GT",
      "GTE",
      "And",
      "Or"
    ];
    var specialCases = {
      containsstrregex: "ContainsStrRegex",
      endswith: "EndsWith",
      findstr: "FindStr",
      findstrregex: "FindStrRegex",
      gt: "GT",
      gte: "GTE",
      is_nonempty: "is_non_empty",
      lowercase: "LowerCase",
      lt: "LT",
      lte: "LTE",
      ltrim: "LTrim",
      ngram: "NGram",
      rtrim: "RTrim",
      regexescape: "RegexEscape",
      replacestr: "ReplaceStr",
      replacestrregex: "ReplaceStrRegex",
      startswith: "StartsWith",
      substring: "SubString",
      titlecase: "TitleCase",
      uppercase: "UpperCase"
    };
    function isExpr(expression) {
      return expression instanceof Expr || util.checkInstanceHasProperty(expression, "_isFaunaExpr");
    }
    function printObject(obj) {
      return "{" + Object.keys(obj).map(function(k) {
        return '"' + k + '": ' + exprToString(obj[k]);
      }).join(", ") + "}";
    }
    function printArray(arr, toStr) {
      return arr.map(function(item) {
        return toStr(item);
      }).join(", ");
    }
    function convertToCamelCase(fn) {
      if (fn in specialCases)
        fn = specialCases[fn];
      return fn.split("_").map(function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }).join("");
    }
    var exprToString = function(expr, caller) {
      if (isExpr(expr)) {
        if ("value" in expr)
          return expr.toString();
        expr = expr.raw;
      }
      if (expr === null) {
        return "null";
      }
      switch (typeof expr) {
        case "string":
          return JSON.stringify(expr);
        case "symbol":
        case "number":
        case "boolean":
          return expr.toString();
        case "undefined":
          return "undefined";
      }
      if (Array.isArray(expr)) {
        var array = printArray(expr, exprToString);
        return varArgsFunctions.indexOf(caller) != -1 ? array : "[" + array + "]";
      }
      if ("match" in expr) {
        var matchStr = exprToString(expr["match"]);
        var terms = expr["terms"] || [];
        if (isExpr(terms))
          terms = terms.raw;
        if (Array.isArray(terms) && terms.length == 0)
          return "Match(" + matchStr + ")";
        if (Array.isArray(terms)) {
          return "Match(" + matchStr + ", [" + printArray(terms, exprToString) + "])";
        }
        return "Match(" + matchStr + ", " + exprToString(terms) + ")";
      }
      if ("paginate" in expr) {
        var exprKeys = Object.keys(expr);
        if (exprKeys.length === 1) {
          return "Paginate(" + exprToString(expr["paginate"]) + ")";
        }
        var expr2 = Object.assign({}, expr);
        delete expr2["paginate"];
        return "Paginate(" + exprToString(expr["paginate"]) + ", " + printObject(expr2) + ")";
      }
      if ("let" in expr && "in" in expr) {
        var letExpr = "";
        if (Array.isArray(expr["let"]))
          letExpr = "[" + printArray(expr["let"], printObject) + "]";
        else
          letExpr = printObject(expr["let"]);
        return "Let(" + letExpr + ", " + exprToString(expr["in"]) + ")";
      }
      if ("object" in expr)
        return printObject(expr["object"]);
      if ("merge" in expr) {
        if (expr.lambda) {
          return "Merge(" + exprToString(expr.merge) + ", " + exprToString(expr.with) + ", " + exprToString(expr.lambda) + ")";
        }
        return "Merge(" + exprToString(expr.merge) + ", " + exprToString(expr.with) + ")";
      }
      if ("lambda" in expr) {
        return "Lambda(" + exprToString(expr["lambda"]) + ", " + exprToString(expr["expr"]) + ")";
      }
      if ("filter" in expr) {
        return "Filter(" + exprToString(expr["collection"]) + ", " + exprToString(expr["filter"]) + ")";
      }
      if ("call" in expr) {
        return "Call(" + exprToString(expr["call"]) + ", " + exprToString(expr["arguments"]) + ")";
      }
      if ("map" in expr) {
        return "Map(" + exprToString(expr["collection"]) + ", " + exprToString(expr["map"]) + ")";
      }
      if ("foreach" in expr) {
        return "Foreach(" + exprToString(expr["collection"]) + ", " + exprToString(expr["foreach"]) + ")";
      }
      var keys = Object.keys(expr);
      var fn = keys[0];
      fn = convertToCamelCase(fn);
      var args = keys.filter((k) => expr[k] !== null || keys.length > 1).map((k) => exprToString(expr[k], fn)).join(", ");
      return fn + "(" + args + ")";
    };
    Expr.toString = exprToString;
    module2.exports = Expr;
  }
});

// node_modules/faunadb/src/errors.js
var require_errors = __commonJS({
  "node_modules/faunadb/src/errors.js"(exports, module2) {
    init_shims();
    "use strict";
    var util = require_util2();
    function FaunaError(name, message, description) {
      Error.call(this);
      this.name = name;
      this.message = message;
      this.description = description;
    }
    util.inherits(FaunaError, Error);
    function InvalidValue(message) {
      FaunaError.call(this, "InvalidValue", message);
    }
    util.inherits(InvalidValue, FaunaError);
    function InvalidArity(min, max, actual, callerFunc) {
      var arityInfo = `${callerFunc} function requires ${messageForArity(min, max)} argument(s) but ${actual} were given`;
      var documentationLink = logDocumentationLink(callerFunc);
      FaunaError.call(this, "InvalidArity", `${arityInfo}
${documentationLink}`);
      this.min = min;
      this.max = max;
      this.actual = actual;
      function messageForArity(min2, max2) {
        if (max2 === null)
          return "at least " + min2;
        if (min2 === null)
          return "up to " + max2;
        if (min2 === max2)
          return min2;
        return "from " + min2 + " to " + max2;
      }
      function logDocumentationLink(functionName) {
        var docsURL = "https://docs.fauna.com/fauna/current/api/fql/functions/";
        return `For more info, see the docs: ${docsURL}${functionName.toLowerCase()}`;
      }
    }
    util.inherits(InvalidArity, FaunaError);
    function FaunaHTTPError(name, requestResult) {
      var response = requestResult.responseContent;
      var errors = response.errors;
      var message = errors.length === 0 ? '(empty "errors")' : errors[0].code;
      var description = errors.length === 0 ? '(empty "errors")' : errors[0].description;
      FaunaError.call(this, name, message, description);
      this.requestResult = requestResult;
    }
    util.inherits(FaunaHTTPError, FaunaError);
    FaunaHTTPError.prototype.errors = function() {
      return this.requestResult.responseContent.errors;
    };
    FaunaHTTPError.raiseForStatusCode = function(requestResult) {
      var code = requestResult.statusCode;
      if (code < 200 || code >= 300) {
        switch (code) {
          case 400:
            throw new BadRequest(requestResult);
          case 401:
            throw new Unauthorized(requestResult);
          case 403:
            throw new PermissionDenied(requestResult);
          case 404:
            throw new NotFound(requestResult);
          case 405:
            throw new MethodNotAllowed(requestResult);
          case 429:
            throw new TooManyRequests(requestResult);
          case 500:
            throw new InternalError(requestResult);
          case 503:
            throw new UnavailableError(requestResult);
          default:
            throw new FaunaHTTPError("UnknownError", requestResult);
        }
      }
    };
    function BadRequest(requestResult) {
      FaunaHTTPError.call(this, "BadRequest", requestResult);
    }
    util.inherits(BadRequest, FaunaHTTPError);
    function Unauthorized(requestResult) {
      FaunaHTTPError.call(this, "Unauthorized", requestResult);
    }
    util.inherits(Unauthorized, FaunaHTTPError);
    function PermissionDenied(requestResult) {
      FaunaHTTPError.call(this, "PermissionDenied", requestResult);
    }
    util.inherits(PermissionDenied, FaunaHTTPError);
    function NotFound(requestResult) {
      FaunaHTTPError.call(this, "NotFound", requestResult);
    }
    util.inherits(NotFound, FaunaHTTPError);
    function MethodNotAllowed(requestResult) {
      FaunaHTTPError.call(this, "MethodNotAllowed", requestResult);
    }
    util.inherits(MethodNotAllowed, FaunaHTTPError);
    function TooManyRequests(requestResult) {
      FaunaHTTPError.call(this, "TooManyRequests", requestResult);
    }
    util.inherits(TooManyRequests, FaunaHTTPError);
    function InternalError(requestResult) {
      FaunaHTTPError.call(this, "InternalError", requestResult);
    }
    util.inherits(InternalError, FaunaHTTPError);
    function UnavailableError(requestResult) {
      FaunaHTTPError.call(this, "UnavailableError", requestResult);
    }
    util.inherits(UnavailableError, FaunaHTTPError);
    function StreamError(name, message, description) {
      FaunaError.call(this, name, message, description);
    }
    util.inherits(StreamError, FaunaError);
    function StreamsNotSupported(description) {
      FaunaError.call(this, "StreamsNotSupported", "streams not supported", description);
    }
    util.inherits(StreamsNotSupported, StreamError);
    function StreamErrorEvent(event) {
      var error3 = event.data || {};
      FaunaError.call(this, "StreamErrorEvent", error3.code, error3.description);
      this.event = event;
    }
    util.inherits(StreamErrorEvent, StreamError);
    function ClientClosed(message, description) {
      FaunaError.call(this, "ClientClosed", message, description);
    }
    util.inherits(ClientClosed, FaunaError);
    module2.exports = {
      FaunaError,
      ClientClosed,
      FaunaHTTPError,
      InvalidValue,
      InvalidArity,
      BadRequest,
      Unauthorized,
      PermissionDenied,
      NotFound,
      MethodNotAllowed,
      TooManyRequests,
      InternalError,
      UnavailableError,
      StreamError,
      StreamsNotSupported,
      StreamErrorEvent
    };
  }
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    init_shims();
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1)
        validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }
});

// node_modules/faunadb/src/values.js
var require_values = __commonJS({
  "node_modules/faunadb/src/values.js"(exports, module2) {
    init_shims();
    "use strict";
    var base64 = require_base64_js();
    var deprecate = require_node();
    var errors = require_errors();
    var Expr = require_Expr();
    var util = require_util2();
    var nodeUtil = util.isNodeEnv() ? require("util") : null;
    var customInspect = nodeUtil && nodeUtil.inspect.custom;
    var stringify = nodeUtil ? nodeUtil.inspect : JSON.stringify;
    function Value() {
    }
    Value.prototype._isFaunaValue = true;
    util.inherits(Value, Expr);
    function Ref(id, collection, database) {
      if (!id)
        throw new errors.InvalidValue("id cannot be null or undefined");
      this.value = { id };
      if (collection)
        this.value["collection"] = collection;
      if (database)
        this.value["database"] = database;
    }
    Ref.prototype._isFaunaRef = true;
    util.inherits(Ref, Value);
    Object.defineProperty(Ref.prototype, "collection", {
      get: function() {
        return this.value["collection"];
      }
    });
    Object.defineProperty(Ref.prototype, "class", {
      get: deprecate(function() {
        return this.value["collection"];
      }, "class is deprecated, use collection instead")
    });
    Object.defineProperty(Ref.prototype, "database", {
      get: function() {
        return this.value["database"];
      }
    });
    Object.defineProperty(Ref.prototype, "id", {
      get: function() {
        return this.value["id"];
      }
    });
    Ref.prototype.toJSON = function() {
      return { "@ref": this.value };
    };
    wrapToString(Ref, function() {
      var constructors = {
        collections: "Collection",
        databases: "Database",
        indexes: "Index",
        functions: "Function",
        roles: "Role",
        access_providers: "AccessProvider"
      };
      var isNative = function(ref) {
        return ref.collection === void 0;
      };
      var toString = function(ref) {
        if (isNative(ref)) {
          var db = ref.database !== void 0 ? ref.database.toString() : "";
          if (ref.id === "access_providers")
            return "AccessProviders(" + db + ")";
          return ref.id.charAt(0).toUpperCase() + ref.id.slice(1) + "(" + db + ")";
        }
        if (isNative(ref.collection)) {
          var constructor = constructors[ref.collection.id];
          if (constructor !== void 0) {
            var db = ref.database !== void 0 ? ", " + ref.database.toString() : "";
            return constructor + '("' + ref.id + '"' + db + ")";
          }
        }
        return "Ref(" + toString(ref.collection) + ', "' + ref.id + '")';
      };
      return toString(this);
    });
    Ref.prototype.valueOf = function() {
      return this.value;
    };
    Ref.prototype.equals = function(other) {
      return (other instanceof Ref || util.checkInstanceHasProperty(other, "_isFaunaRef")) && this.id === other.id && (this.collection === void 0 && other.collection === void 0 || this.collection.equals(other.collection)) && (this.database === void 0 && other.database === void 0 || this.database.equals(other.database));
    };
    var Native = {
      COLLECTIONS: new Ref("collections"),
      INDEXES: new Ref("indexes"),
      DATABASES: new Ref("databases"),
      FUNCTIONS: new Ref("functions"),
      ROLES: new Ref("roles"),
      KEYS: new Ref("keys"),
      ACCESS_PROVIDERS: new Ref("access_providers")
    };
    Native.fromName = function(name) {
      switch (name) {
        case "collections":
          return Native.COLLECTIONS;
        case "indexes":
          return Native.INDEXES;
        case "databases":
          return Native.DATABASES;
        case "functions":
          return Native.FUNCTIONS;
        case "roles":
          return Native.ROLES;
        case "keys":
          return Native.KEYS;
        case "access_providers":
          return Native.ACCESS_PROVIDERS;
      }
      return new Ref(name);
    };
    function SetRef(value) {
      this.value = value;
    }
    util.inherits(SetRef, Value);
    wrapToString(SetRef, function() {
      return Expr.toString(this.value);
    });
    SetRef.prototype.toJSON = function() {
      return { "@set": this.value };
    };
    function FaunaTime(value) {
      if (value instanceof Date) {
        value = value.toISOString();
      } else if (!(value.charAt(value.length - 1) === "Z")) {
        throw new errors.InvalidValue("Only allowed timezone is 'Z', got: " + value);
      }
      this.value = value;
    }
    util.inherits(FaunaTime, Value);
    Object.defineProperty(FaunaTime.prototype, "date", {
      get: function() {
        return new Date(this.value);
      }
    });
    wrapToString(FaunaTime, function() {
      return 'Time("' + this.value + '")';
    });
    FaunaTime.prototype.toJSON = function() {
      return { "@ts": this.value };
    };
    function FaunaDate(value) {
      if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      }
      this.value = value;
    }
    util.inherits(FaunaDate, Value);
    Object.defineProperty(FaunaDate.prototype, "date", {
      get: function() {
        return new Date(this.value);
      }
    });
    wrapToString(FaunaDate, function() {
      return 'Date("' + this.value + '")';
    });
    FaunaDate.prototype.toJSON = function() {
      return { "@date": this.value };
    };
    function Bytes(value) {
      if (value instanceof ArrayBuffer) {
        this.value = new Uint8Array(value);
      } else if (typeof value === "string") {
        this.value = base64.toByteArray(value);
      } else if (value instanceof Uint8Array) {
        this.value = value;
      } else {
        throw new errors.InvalidValue("Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: " + stringify(value));
      }
    }
    util.inherits(Bytes, Value);
    wrapToString(Bytes, function() {
      return 'Bytes("' + base64.fromByteArray(this.value) + '")';
    });
    Bytes.prototype.toJSON = function() {
      return { "@bytes": base64.fromByteArray(this.value) };
    };
    function Query(value) {
      this.value = value;
    }
    util.inherits(Query, Value);
    wrapToString(Query, function() {
      return "Query(" + Expr.toString(this.value) + ")";
    });
    Query.prototype.toJSON = function() {
      return { "@query": this.value };
    };
    function wrapToString(type, fn) {
      type.prototype.toString = fn;
      type.prototype.inspect = fn;
      if (customInspect) {
        type.prototype[customInspect] = fn;
      }
    }
    module2.exports = {
      Value,
      Ref,
      Native,
      SetRef,
      FaunaTime,
      FaunaDate,
      Bytes,
      Query
    };
  }
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s2 = 1; s2 < arguments.length; s2++) {
        from = Object(arguments[s2]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/faunadb/src/query.js
var require_query = __commonJS({
  "node_modules/faunadb/src/query.js"(exports, module2) {
    init_shims();
    "use strict";
    var annotate = require_fn_annotate();
    var deprecate = require_node();
    var Expr = require_Expr();
    var errors = require_errors();
    var values = require_values();
    var objectAssign = require_object_assign();
    var util = require_util2();
    function Ref() {
      arity.between(1, 2, arguments, Ref.name);
      switch (arguments.length) {
        case 1:
          return new Expr({ "@ref": wrap(arguments[0]) });
        case 2:
          return new Expr({ ref: wrap(arguments[0]), id: wrap(arguments[1]) });
      }
    }
    function Bytes(bytes) {
      arity.exact(1, arguments, Bytes.name);
      return new values.Bytes(bytes);
    }
    function Abort(msg) {
      arity.exact(1, arguments, Abort.name);
      return new Expr({ abort: wrap(msg) });
    }
    function At(timestamp, expr) {
      arity.exact(2, arguments, At.name);
      return new Expr({ at: wrap(timestamp), expr: wrap(expr) });
    }
    function Let(vars, expr) {
      arity.exact(2, arguments, Let.name);
      var bindings = [];
      if (Array.isArray(vars)) {
        bindings = vars.map(function(item) {
          return wrapValues(item);
        });
      } else {
        bindings = Object.keys(vars).filter(function(k) {
          return vars[k] !== void 0;
        }).map(function(k) {
          var b = {};
          b[k] = wrap(vars[k]);
          return b;
        });
      }
      if (typeof expr === "function") {
        if (Array.isArray(vars)) {
          var expr_vars = [];
          vars.forEach(function(item) {
            Object.keys(item).forEach(function(name) {
              expr_vars.push(Var(name));
            });
          });
          expr = expr.apply(null, expr_vars);
        } else {
          expr = expr.apply(null, Object.keys(vars).map(function(name) {
            return Var(name);
          }));
        }
      }
      return new Expr({ let: bindings, in: wrap(expr) });
    }
    function Var(varName) {
      arity.exact(1, arguments, Var.name);
      return new Expr({ var: wrap(varName) });
    }
    function If(condition, then, _else) {
      arity.exact(3, arguments, If.name);
      return new Expr({ if: wrap(condition), then: wrap(then), else: wrap(_else) });
    }
    function Do() {
      arity.min(1, arguments, Do.name);
      var args = argsToArray(arguments);
      return new Expr({ do: wrap(args) });
    }
    var objectFunction = function(fields) {
      arity.exact(1, arguments, objectFunction.name);
      return new Expr({ object: wrapValues(fields) });
    };
    function Lambda() {
      arity.between(1, 2, arguments, Lambda.name);
      switch (arguments.length) {
        case 1:
          var value = arguments[0];
          if (typeof value === "function") {
            return _lambdaFunc(value);
          } else if (value instanceof Expr || util.checkInstanceHasProperty(value, "_isFaunaExpr")) {
            return value;
          } else {
            throw new errors.InvalidValue("Lambda function takes either a Function or an Expr.");
          }
        case 2:
          var var_name = arguments[0];
          var expr = arguments[1];
          return _lambdaExpr(var_name, expr);
      }
    }
    function _lambdaFunc(func) {
      var vars = annotate(func);
      switch (vars.length) {
        case 0:
          throw new errors.InvalidValue("Provided Function must take at least 1 argument.");
        case 1:
          return _lambdaExpr(vars[0], func(Var(vars[0])));
        default:
          return _lambdaExpr(vars, func.apply(null, vars.map(function(name) {
            return Var(name);
          })));
      }
    }
    function _lambdaExpr(var_name, expr) {
      return new Expr({ lambda: wrap(var_name), expr: wrap(expr) });
    }
    function Call(ref) {
      arity.min(1, arguments, Call.name);
      var args = argsToArray(arguments);
      args.shift();
      return new Expr({ call: wrap(ref), arguments: wrap(varargs(args)) });
    }
    function Query(lambda) {
      arity.exact(1, arguments, Query.name);
      return new Expr({ query: wrap(lambda) });
    }
    function Map2(collection, lambda_expr) {
      arity.exact(2, arguments, Map2.name);
      return new Expr({ map: wrap(lambda_expr), collection: wrap(collection) });
    }
    function Foreach(collection, lambda_expr) {
      arity.exact(2, arguments, Foreach.name);
      return new Expr({ foreach: wrap(lambda_expr), collection: wrap(collection) });
    }
    function Filter(collection, lambda_expr) {
      arity.exact(2, arguments, Filter.name);
      return new Expr({ filter: wrap(lambda_expr), collection: wrap(collection) });
    }
    function Take(number, collection) {
      arity.exact(2, arguments, Take.name);
      return new Expr({ take: wrap(number), collection: wrap(collection) });
    }
    function Drop(number, collection) {
      arity.exact(2, arguments, Drop.name);
      return new Expr({ drop: wrap(number), collection: wrap(collection) });
    }
    function Prepend(elements, collection) {
      arity.exact(2, arguments, Prepend.name);
      return new Expr({ prepend: wrap(elements), collection: wrap(collection) });
    }
    function Append(elements, collection) {
      arity.exact(2, arguments, Append.name);
      return new Expr({ append: wrap(elements), collection: wrap(collection) });
    }
    function IsEmpty(collection) {
      arity.exact(1, arguments, IsEmpty.name);
      return new Expr({ is_empty: wrap(collection) });
    }
    function IsNonEmpty(collection) {
      arity.exact(1, arguments, IsNonEmpty.name);
      return new Expr({ is_nonempty: wrap(collection) });
    }
    function IsNumber(expr) {
      arity.exact(1, arguments, IsNumber.name);
      return new Expr({ is_number: wrap(expr) });
    }
    function IsDouble(expr) {
      arity.exact(1, arguments, IsDouble.name);
      return new Expr({ is_double: wrap(expr) });
    }
    function IsInteger(expr) {
      arity.exact(1, arguments, IsInteger.name);
      return new Expr({ is_integer: wrap(expr) });
    }
    function IsBoolean(expr) {
      arity.exact(1, arguments, IsBoolean.name);
      return new Expr({ is_boolean: wrap(expr) });
    }
    function IsNull(expr) {
      arity.exact(1, arguments, IsNull.name);
      return new Expr({ is_null: wrap(expr) });
    }
    function IsBytes(expr) {
      arity.exact(1, arguments, IsBytes.name);
      return new Expr({ is_bytes: wrap(expr) });
    }
    function IsTimestamp(expr) {
      arity.exact(1, arguments, IsTimestamp.name);
      return new Expr({ is_timestamp: wrap(expr) });
    }
    function IsDate(expr) {
      arity.exact(1, arguments, IsDate.name);
      return new Expr({ is_date: wrap(expr) });
    }
    function IsString(expr) {
      arity.exact(1, arguments, IsString.name);
      return new Expr({ is_string: wrap(expr) });
    }
    function IsArray(expr) {
      arity.exact(1, arguments, IsArray.name);
      return new Expr({ is_array: wrap(expr) });
    }
    function IsObject(expr) {
      arity.exact(1, arguments, IsObject.name);
      return new Expr({ is_object: wrap(expr) });
    }
    function IsRef(expr) {
      arity.exact(1, arguments, IsRef.name);
      return new Expr({ is_ref: wrap(expr) });
    }
    function IsSet(expr) {
      arity.exact(1, arguments, IsSet.name);
      return new Expr({ is_set: wrap(expr) });
    }
    function IsDoc(expr) {
      arity.exact(1, arguments, IsDoc.name);
      return new Expr({ is_doc: wrap(expr) });
    }
    function IsLambda(expr) {
      arity.exact(1, arguments, IsLambda.name);
      return new Expr({ is_lambda: wrap(expr) });
    }
    function IsCollection(expr) {
      arity.exact(1, arguments, IsCollection.name);
      return new Expr({ is_collection: wrap(expr) });
    }
    function IsDatabase(expr) {
      arity.exact(1, arguments, IsDatabase.name);
      return new Expr({ is_database: wrap(expr) });
    }
    function IsIndex(expr) {
      arity.exact(1, arguments, IsIndex.name);
      return new Expr({ is_index: wrap(expr) });
    }
    function IsFunction(expr) {
      arity.exact(1, arguments, IsFunction.name);
      return new Expr({ is_function: wrap(expr) });
    }
    function IsKey(expr) {
      arity.exact(1, arguments, IsKey.name);
      return new Expr({ is_key: wrap(expr) });
    }
    function IsToken(expr) {
      arity.exact(1, arguments, IsToken.name);
      return new Expr({ is_token: wrap(expr) });
    }
    function IsCredentials(expr) {
      arity.exact(1, arguments, IsCredentials.name);
      return new Expr({ is_credentials: wrap(expr) });
    }
    function IsRole(expr) {
      arity.exact(1, arguments, IsRole.name);
      return new Expr({ is_role: wrap(expr) });
    }
    function Get(ref, ts) {
      arity.between(1, 2, arguments, Get.name);
      ts = util.defaults(ts, null);
      return new Expr(params({ get: wrap(ref) }, { ts: wrap(ts) }));
    }
    function KeyFromSecret(secret) {
      arity.exact(1, arguments, KeyFromSecret.name);
      return new Expr({ key_from_secret: wrap(secret) });
    }
    function Reduce(lambda, initial, collection) {
      arity.exact(3, arguments, Reduce.name);
      return new Expr({
        reduce: wrap(lambda),
        initial: wrap(initial),
        collection: wrap(collection)
      });
    }
    function Paginate(set, opts) {
      arity.between(1, 2, arguments, Paginate.name);
      opts = util.defaults(opts, {});
      return new Expr(objectAssign({ paginate: wrap(set) }, wrapValues(opts)));
    }
    function Exists(ref, ts) {
      arity.between(1, 2, arguments, Exists.name);
      ts = util.defaults(ts, null);
      return new Expr(params({ exists: wrap(ref) }, { ts: wrap(ts) }));
    }
    function Create(collection_ref, params2) {
      arity.between(1, 2, arguments, Create.name);
      return new Expr({ create: wrap(collection_ref), params: wrap(params2) });
    }
    function Update(ref, params2) {
      arity.exact(2, arguments, Update.name);
      return new Expr({ update: wrap(ref), params: wrap(params2) });
    }
    function Replace(ref, params2) {
      arity.exact(2, arguments, Replace.name);
      return new Expr({ replace: wrap(ref), params: wrap(params2) });
    }
    function Delete(ref) {
      arity.exact(1, arguments, Delete.name);
      return new Expr({ delete: wrap(ref) });
    }
    function Insert(ref, ts, action, params2) {
      arity.exact(4, arguments, Insert.name);
      return new Expr({
        insert: wrap(ref),
        ts: wrap(ts),
        action: wrap(action),
        params: wrap(params2)
      });
    }
    function Remove(ref, ts, action) {
      arity.exact(3, arguments, Remove.name);
      return new Expr({ remove: wrap(ref), ts: wrap(ts), action: wrap(action) });
    }
    function CreateClass(params2) {
      arity.exact(1, arguments, CreateClass.name);
      return new Expr({ create_class: wrap(params2) });
    }
    function CreateCollection(params2) {
      arity.exact(1, arguments, CreateCollection.name);
      return new Expr({ create_collection: wrap(params2) });
    }
    function CreateDatabase(params2) {
      arity.exact(1, arguments, CreateDatabase.name);
      return new Expr({ create_database: wrap(params2) });
    }
    function CreateIndex(params2) {
      arity.exact(1, arguments, CreateIndex.name);
      return new Expr({ create_index: wrap(params2) });
    }
    function CreateKey(params2) {
      arity.exact(1, arguments, CreateKey.name);
      return new Expr({ create_key: wrap(params2) });
    }
    function CreateFunction(params2) {
      arity.exact(1, arguments, CreateFunction.name);
      return new Expr({ create_function: wrap(params2) });
    }
    function CreateRole(params2) {
      arity.exact(1, arguments, CreateRole.name);
      return new Expr({ create_role: wrap(params2) });
    }
    function CreateAccessProvider(params2) {
      arity.exact(1, arguments, CreateAccessProvider.name);
      return new Expr({ create_access_provider: wrap(params2) });
    }
    function Singleton(ref) {
      arity.exact(1, arguments, Singleton.name);
      return new Expr({ singleton: wrap(ref) });
    }
    function Events(ref_set) {
      arity.exact(1, arguments, Events.name);
      return new Expr({ events: wrap(ref_set) });
    }
    function Match(index2) {
      arity.min(1, arguments, Match.name);
      var args = argsToArray(arguments);
      args.shift();
      return new Expr({ match: wrap(index2), terms: wrap(varargs(args)) });
    }
    function Union() {
      arity.min(1, arguments, Union.name);
      return new Expr({ union: wrap(varargs(arguments)) });
    }
    function Merge(merge, _with, lambda) {
      arity.between(2, 3, arguments, Merge.name);
      return new Expr(params({ merge: wrap(merge), with: wrap(_with) }, { lambda: wrap(lambda) }));
    }
    function Intersection() {
      arity.min(1, arguments, Intersection.name);
      return new Expr({ intersection: wrap(varargs(arguments)) });
    }
    function Difference() {
      arity.min(1, arguments, Difference.name);
      return new Expr({ difference: wrap(varargs(arguments)) });
    }
    function Distinct(set) {
      arity.exact(1, arguments, Distinct.name);
      return new Expr({ distinct: wrap(set) });
    }
    function Join(source, target) {
      arity.exact(2, arguments, Join.name);
      return new Expr({ join: wrap(source), with: wrap(target) });
    }
    function Range(set, from, to) {
      arity.exact(3, arguments, Range.name);
      return new Expr({ range: wrap(set), from: wrap(from), to: wrap(to) });
    }
    function Login2(ref, params2) {
      arity.exact(2, arguments, Login2.name);
      return new Expr({ login: wrap(ref), params: wrap(params2) });
    }
    function Logout(delete_tokens) {
      arity.exact(1, arguments, Logout.name);
      return new Expr({ logout: wrap(delete_tokens) });
    }
    function Identify(ref, password) {
      arity.exact(2, arguments, Identify.name);
      return new Expr({ identify: wrap(ref), password: wrap(password) });
    }
    function Identity() {
      arity.exact(0, arguments, Identity.name);
      return new Expr({ identity: null });
    }
    function CurrentIdentity() {
      arity.exact(0, arguments, CurrentIdentity.name);
      return new Expr({ current_identity: null });
    }
    function HasIdentity() {
      arity.exact(0, arguments, HasIdentity.name);
      return new Expr({ has_identity: null });
    }
    function HasCurrentIdentity() {
      arity.exact(0, arguments, HasCurrentIdentity.name);
      return new Expr({ has_current_identity: null });
    }
    function CurrentToken() {
      arity.exact(0, arguments, CurrentToken.name);
      return new Expr({ current_token: null });
    }
    function HasCurrentToken() {
      arity.exact(0, arguments, HasCurrentToken.name);
      return new Expr({ has_current_token: null });
    }
    function Concat(strings, separator) {
      arity.min(1, arguments, Concat.name);
      separator = util.defaults(separator, null);
      return new Expr(params({ concat: wrap(strings) }, { separator: wrap(separator) }));
    }
    function Casefold(string, normalizer) {
      arity.min(1, arguments, Casefold.name);
      return new Expr(params({ casefold: wrap(string) }, { normalizer: wrap(normalizer) }));
    }
    function ContainsStr(value, search) {
      arity.exact(2, arguments, ContainsStr.name);
      return new Expr({ containsstr: wrap(value), search: wrap(search) });
    }
    function ContainsStrRegex(value, pattern) {
      arity.exact(2, arguments, ContainsStrRegex.name);
      return new Expr({ containsstrregex: wrap(value), pattern: wrap(pattern) });
    }
    function StartsWith(value, search) {
      arity.exact(2, arguments, StartsWith.name);
      return new Expr({ startswith: wrap(value), search: wrap(search) });
    }
    function EndsWith(value, search) {
      arity.exact(2, arguments, EndsWith.name);
      return new Expr({ endswith: wrap(value), search: wrap(search) });
    }
    function RegexEscape(value) {
      arity.exact(1, arguments, RegexEscape.name);
      return new Expr({ regexescape: wrap(value) });
    }
    function FindStr(value, find, start) {
      arity.between(2, 3, arguments, FindStr.name);
      start = util.defaults(start, null);
      return new Expr(params({ findstr: wrap(value), find: wrap(find) }, { start: wrap(start) }));
    }
    function FindStrRegex(value, pattern, start, numResults) {
      arity.between(2, 4, arguments, FindStrRegex.name);
      start = util.defaults(start, null);
      return new Expr(params({ findstrregex: wrap(value), pattern: wrap(pattern) }, { start: wrap(start), num_results: wrap(numResults) }));
    }
    function Length(value) {
      arity.exact(1, arguments, Length.name);
      return new Expr({ length: wrap(value) });
    }
    function LowerCase(value) {
      arity.exact(1, arguments, LowerCase.name);
      return new Expr({ lowercase: wrap(value) });
    }
    function LTrim(value) {
      arity.exact(1, arguments, LTrim.name);
      return new Expr({ ltrim: wrap(value) });
    }
    function NGram(terms, min, max) {
      arity.between(1, 3, arguments, NGram.name);
      min = util.defaults(min, null);
      max = util.defaults(max, null);
      return new Expr(params({ ngram: wrap(terms) }, { min: wrap(min), max: wrap(max) }));
    }
    function Repeat(value, number) {
      arity.between(1, 2, arguments, Repeat.name);
      number = util.defaults(number, null);
      return new Expr(params({ repeat: wrap(value) }, { number: wrap(number) }));
    }
    function ReplaceStr(value, find, replace) {
      arity.exact(3, arguments, ReplaceStr.name);
      return new Expr({
        replacestr: wrap(value),
        find: wrap(find),
        replace: wrap(replace)
      });
    }
    function ReplaceStrRegex(value, pattern, replace, first) {
      arity.between(3, 4, arguments, ReplaceStrRegex.name);
      first = util.defaults(first, null);
      return new Expr(params({
        replacestrregex: wrap(value),
        pattern: wrap(pattern),
        replace: wrap(replace)
      }, { first: wrap(first) }));
    }
    function RTrim(value) {
      arity.exact(1, arguments, RTrim.name);
      return new Expr({ rtrim: wrap(value) });
    }
    function Space(num) {
      arity.exact(1, arguments, Space.name);
      return new Expr({ space: wrap(num) });
    }
    function SubString(value, start, length) {
      arity.between(1, 3, arguments, SubString.name);
      start = util.defaults(start, null);
      length = util.defaults(length, null);
      return new Expr(params({ substring: wrap(value) }, { start: wrap(start), length: wrap(length) }));
    }
    function TitleCase(value) {
      arity.exact(1, arguments, TitleCase.name);
      return new Expr({ titlecase: wrap(value) });
    }
    function Trim(value) {
      arity.exact(1, arguments, Trim.name);
      return new Expr({ trim: wrap(value) });
    }
    function UpperCase(value) {
      arity.exact(1, arguments, UpperCase.name);
      return new Expr({ uppercase: wrap(value) });
    }
    function Format(string) {
      arity.min(1, arguments, Format.name);
      var args = argsToArray(arguments);
      args.shift();
      return new Expr({ format: wrap(string), values: wrap(varargs(args)) });
    }
    function Time(string) {
      arity.exact(1, arguments, Time.name);
      return new Expr({ time: wrap(string) });
    }
    function Epoch(number, unit) {
      arity.exact(2, arguments, Epoch.name);
      return new Expr({ epoch: wrap(number), unit: wrap(unit) });
    }
    function TimeAdd(base, offset, unit) {
      arity.exact(3, arguments, TimeAdd.name);
      return new Expr({
        time_add: wrap(base),
        offset: wrap(offset),
        unit: wrap(unit)
      });
    }
    function TimeSubtract(base, offset, unit) {
      arity.exact(3, arguments, TimeSubtract.name);
      return new Expr({
        time_subtract: wrap(base),
        offset: wrap(offset),
        unit: wrap(unit)
      });
    }
    function TimeDiff(start, finish, unit) {
      arity.exact(3, arguments, TimeDiff.name);
      return new Expr({
        time_diff: wrap(start),
        other: wrap(finish),
        unit: wrap(unit)
      });
    }
    function Date2(string) {
      arity.exact(1, arguments, Date2.name);
      return new Expr({ date: wrap(string) });
    }
    function Now() {
      arity.exact(0, arguments, Now.name);
      return new Expr({ now: wrap(null) });
    }
    function NextId() {
      arity.exact(0, arguments, NextId.name);
      return new Expr({ next_id: null });
    }
    function NewId() {
      arity.exact(0, arguments, NewId.name);
      return new Expr({ new_id: null });
    }
    function Database(name, scope) {
      arity.between(1, 2, arguments, Database.name);
      switch (arguments.length) {
        case 1:
          return new Expr({ database: wrap(name) });
        case 2:
          return new Expr({ database: wrap(name), scope: wrap(scope) });
      }
    }
    function Index(name, scope) {
      arity.between(1, 2, arguments, Index.name);
      switch (arguments.length) {
        case 1:
          return new Expr({ index: wrap(name) });
        case 2:
          return new Expr({ index: wrap(name), scope: wrap(scope) });
      }
    }
    function Class(name, scope) {
      arity.between(1, 2, arguments, Class.name);
      switch (arguments.length) {
        case 1:
          return new Expr({ class: wrap(name) });
        case 2:
          return new Expr({ class: wrap(name), scope: wrap(scope) });
      }
    }
    function Collection(name, scope) {
      arity.between(1, 2, arguments, Collection.name);
      switch (arguments.length) {
        case 1:
          return new Expr({ collection: wrap(name) });
        case 2:
          return new Expr({ collection: wrap(name), scope: wrap(scope) });
      }
    }
    function FunctionFn(name, scope) {
      arity.between(1, 2, arguments, FunctionFn.name);
      switch (arguments.length) {
        case 1:
          return new Expr({ function: wrap(name) });
        case 2:
          return new Expr({ function: wrap(name), scope: wrap(scope) });
      }
    }
    function Role(name, scope) {
      arity.between(1, 2, arguments, Role.name);
      scope = util.defaults(scope, null);
      return new Expr(params({ role: wrap(name) }, { scope: wrap(scope) }));
    }
    function AccessProviders(scope) {
      arity.max(1, arguments, AccessProviders.name);
      scope = util.defaults(scope, null);
      return new Expr({ access_providers: wrap(scope) });
    }
    function Classes(scope) {
      arity.max(1, arguments, Classes.name);
      scope = util.defaults(scope, null);
      return new Expr({ classes: wrap(scope) });
    }
    function Collections(scope) {
      arity.max(1, arguments, Collections.name);
      scope = util.defaults(scope, null);
      return new Expr({ collections: wrap(scope) });
    }
    function Databases(scope) {
      arity.max(1, arguments, Databases.name);
      scope = util.defaults(scope, null);
      return new Expr({ databases: wrap(scope) });
    }
    function Indexes(scope) {
      arity.max(1, arguments, Indexes.name);
      scope = util.defaults(scope, null);
      return new Expr({ indexes: wrap(scope) });
    }
    function Functions(scope) {
      arity.max(1, arguments, Functions.name);
      scope = util.defaults(scope, null);
      return new Expr({ functions: wrap(scope) });
    }
    function Roles(scope) {
      arity.max(1, arguments, Roles.name);
      scope = util.defaults(scope, null);
      return new Expr({ roles: wrap(scope) });
    }
    function Keys(scope) {
      arity.max(1, arguments, Keys.name);
      scope = util.defaults(scope, null);
      return new Expr({ keys: wrap(scope) });
    }
    function Tokens(scope) {
      arity.max(1, arguments, Tokens.name);
      scope = util.defaults(scope, null);
      return new Expr({ tokens: wrap(scope) });
    }
    function Credentials(scope) {
      arity.max(1, arguments, Credentials.name);
      scope = util.defaults(scope, null);
      return new Expr({ credentials: wrap(scope) });
    }
    function Equals() {
      arity.min(1, arguments, Equals.name);
      return new Expr({ equals: wrap(varargs(arguments)) });
    }
    function Contains(path, _in) {
      arity.exact(2, arguments, Contains.name);
      return new Expr({ contains: wrap(path), in: wrap(_in) });
    }
    function ContainsValue(value, _in) {
      arity.exact(2, arguments, ContainsValue.name);
      return new Expr({ contains_value: wrap(value), in: wrap(_in) });
    }
    function ContainsField(field, obj) {
      arity.exact(2, arguments, ContainsField.name);
      return new Expr({ contains_field: wrap(field), in: wrap(obj) });
    }
    function ContainsPath(path, _in) {
      arity.exact(2, arguments, ContainsPath.name);
      return new Expr({ contains_path: wrap(path), in: wrap(_in) });
    }
    function Select(path, from, _default) {
      arity.between(2, 3, arguments, Select.name);
      var exprObj = { select: wrap(path), from: wrap(from) };
      if (_default !== void 0) {
        exprObj.default = wrap(_default);
      }
      return new Expr(exprObj);
    }
    function SelectAll(path, from) {
      arity.exact(2, arguments, SelectAll.name);
      return new Expr({ select_all: wrap(path), from: wrap(from) });
    }
    function Abs(expr) {
      arity.exact(1, arguments, Abs.name);
      return new Expr({ abs: wrap(expr) });
    }
    function Add() {
      arity.min(1, arguments, Add.name);
      return new Expr({ add: wrap(varargs(arguments)) });
    }
    function BitAnd() {
      arity.min(1, arguments, BitAnd.name);
      return new Expr({ bitand: wrap(varargs(arguments)) });
    }
    function BitNot(expr) {
      arity.exact(1, arguments, BitNot.name);
      return new Expr({ bitnot: wrap(expr) });
    }
    function BitOr() {
      arity.min(1, arguments, BitOr.name);
      return new Expr({ bitor: wrap(varargs(arguments)) });
    }
    function BitXor() {
      arity.min(1, arguments, BitXor.name);
      return new Expr({ bitxor: wrap(varargs(arguments)) });
    }
    function Ceil(expr) {
      arity.exact(1, arguments, Ceil.name);
      return new Expr({ ceil: wrap(expr) });
    }
    function Divide() {
      arity.min(1, arguments, Divide.name);
      return new Expr({ divide: wrap(varargs(arguments)) });
    }
    function Floor(expr) {
      arity.exact(1, arguments, Floor.name);
      return new Expr({ floor: wrap(expr) });
    }
    function Max() {
      arity.min(1, arguments, Max.name);
      return new Expr({ max: wrap(varargs(arguments)) });
    }
    function Min() {
      arity.min(1, arguments, Min.name);
      return new Expr({ min: wrap(varargs(arguments)) });
    }
    function Modulo() {
      arity.min(1, arguments, Modulo.name);
      return new Expr({ modulo: wrap(varargs(arguments)) });
    }
    function Multiply() {
      arity.min(1, arguments, Multiply.name);
      return new Expr({ multiply: wrap(varargs(arguments)) });
    }
    function Round(value, precision) {
      arity.min(1, arguments, Round.name);
      precision = util.defaults(precision, null);
      return new Expr(params({ round: wrap(value) }, { precision: wrap(precision) }));
    }
    function Subtract() {
      arity.min(1, arguments, Subtract.name);
      return new Expr({ subtract: wrap(varargs(arguments)) });
    }
    function Sign(expr) {
      arity.exact(1, arguments, Sign.name);
      return new Expr({ sign: wrap(expr) });
    }
    function Sqrt(expr) {
      arity.exact(1, arguments, Sqrt.name);
      return new Expr({ sqrt: wrap(expr) });
    }
    function Trunc(value, precision) {
      arity.min(1, arguments, Trunc.name);
      precision = util.defaults(precision, null);
      return new Expr(params({ trunc: wrap(value) }, { precision: wrap(precision) }));
    }
    function Count(collection) {
      arity.exact(1, arguments, Count.name);
      return new Expr({ count: wrap(collection) });
    }
    function Sum(collection) {
      arity.exact(1, arguments, Sum.name);
      return new Expr({ sum: wrap(collection) });
    }
    function Mean(collection) {
      arity.exact(1, arguments, Mean.name);
      return new Expr({ mean: wrap(collection) });
    }
    function Any(collection) {
      arity.exact(1, arguments, Any.name);
      return new Expr({ any: wrap(collection) });
    }
    function All(collection) {
      arity.exact(1, arguments, All.name);
      return new Expr({ all: wrap(collection) });
    }
    function Acos(expr) {
      arity.exact(1, arguments, Acos.name);
      return new Expr({ acos: wrap(expr) });
    }
    function Asin(expr) {
      arity.exact(1, arguments, Asin.name);
      return new Expr({ asin: wrap(expr) });
    }
    function Atan(expr) {
      arity.exact(1, arguments, Atan.name);
      return new Expr({ atan: wrap(expr) });
    }
    function Cos(expr) {
      arity.exact(1, arguments, Cos.name);
      return new Expr({ cos: wrap(expr) });
    }
    function Cosh(expr) {
      arity.exact(1, arguments, Cosh.name);
      return new Expr({ cosh: wrap(expr) });
    }
    function Degrees(expr) {
      arity.exact(1, arguments, Degrees.name);
      return new Expr({ degrees: wrap(expr) });
    }
    function Exp(expr) {
      arity.exact(1, arguments, Exp.name);
      return new Expr({ exp: wrap(expr) });
    }
    function Hypot(value, side) {
      arity.min(1, arguments, Hypot.name);
      side = util.defaults(side, null);
      return new Expr(params({ hypot: wrap(value) }, { b: wrap(side) }));
    }
    function Ln(expr) {
      arity.exact(1, arguments, Ln.name);
      return new Expr({ ln: wrap(expr) });
    }
    function Log(expr) {
      arity.exact(1, arguments, Log.name);
      return new Expr({ log: wrap(expr) });
    }
    function Pow(value, exponent) {
      arity.min(1, arguments, Pow.name);
      exponent = util.defaults(exponent, null);
      return new Expr(params({ pow: wrap(value) }, { exp: wrap(exponent) }));
    }
    function Radians(expr) {
      arity.exact(1, arguments, Radians.name);
      return new Expr({ radians: wrap(expr) });
    }
    function Sin(expr) {
      arity.exact(1, arguments, Sin.name);
      return new Expr({ sin: wrap(expr) });
    }
    function Sinh(expr) {
      arity.exact(1, arguments, Sinh.name);
      return new Expr({ sinh: wrap(expr) });
    }
    function Tan(expr) {
      arity.exact(1, arguments, Tan.name);
      return new Expr({ tan: wrap(expr) });
    }
    function Tanh(expr) {
      arity.exact(1, arguments, Tanh.name);
      return new Expr({ tanh: wrap(expr) });
    }
    function LT() {
      arity.min(1, arguments, LT.name);
      return new Expr({ lt: wrap(varargs(arguments)) });
    }
    function LTE() {
      arity.min(1, arguments, LTE.name);
      return new Expr({ lte: wrap(varargs(arguments)) });
    }
    function GT() {
      arity.min(1, arguments, GT.name);
      return new Expr({ gt: wrap(varargs(arguments)) });
    }
    function GTE() {
      arity.min(1, arguments, GTE.name);
      return new Expr({ gte: wrap(varargs(arguments)) });
    }
    function And() {
      arity.min(1, arguments, And.name);
      return new Expr({ and: wrap(varargs(arguments)) });
    }
    function Or() {
      arity.min(1, arguments, Or.name);
      return new Expr({ or: wrap(varargs(arguments)) });
    }
    function Not(boolean) {
      arity.exact(1, arguments, Not.name);
      return new Expr({ not: wrap(boolean) });
    }
    function ToString(expr) {
      arity.exact(1, arguments, ToString.name);
      return new Expr({ to_string: wrap(expr) });
    }
    function ToNumber(expr) {
      arity.exact(1, arguments, ToNumber.name);
      return new Expr({ to_number: wrap(expr) });
    }
    function ToObject(expr) {
      arity.exact(1, arguments, ToObject.name);
      return new Expr({ to_object: wrap(expr) });
    }
    function ToArray(expr) {
      arity.exact(1, arguments, ToArray.name);
      return new Expr({ to_array: wrap(expr) });
    }
    function ToDouble(expr) {
      arity.exact(1, arguments, ToDouble.name);
      return new Expr({ to_double: wrap(expr) });
    }
    function ToInteger(expr) {
      arity.exact(1, arguments, ToInteger.name);
      return new Expr({ to_integer: wrap(expr) });
    }
    function ToTime(expr) {
      arity.exact(1, arguments, ToTime.name);
      return new Expr({ to_time: wrap(expr) });
    }
    function ToSeconds(expr) {
      arity.exact(1, arguments, ToSeconds.name);
      return new Expr({ to_seconds: wrap(expr) });
    }
    function ToMillis(expr) {
      arity.exact(1, arguments, ToMillis.name);
      return new Expr({ to_millis: wrap(expr) });
    }
    function ToMicros(expr) {
      arity.exact(1, arguments, ToMicros.name);
      return new Expr({ to_micros: wrap(expr) });
    }
    function DayOfWeek(expr) {
      arity.exact(1, arguments, DayOfWeek.name);
      return new Expr({ day_of_week: wrap(expr) });
    }
    function DayOfYear(expr) {
      arity.exact(1, arguments, DayOfYear.name);
      return new Expr({ day_of_year: wrap(expr) });
    }
    function DayOfMonth(expr) {
      arity.exact(1, arguments, DayOfMonth.name);
      return new Expr({ day_of_month: wrap(expr) });
    }
    function Hour(expr) {
      arity.exact(1, arguments, Hour.name);
      return new Expr({ hour: wrap(expr) });
    }
    function Minute(expr) {
      arity.exact(1, arguments, Minute.name);
      return new Expr({ minute: wrap(expr) });
    }
    function Second(expr) {
      arity.exact(1, arguments, Second.name);
      return new Expr({ second: wrap(expr) });
    }
    function Month(expr) {
      arity.exact(1, arguments, Month.name);
      return new Expr({ month: wrap(expr) });
    }
    function Year(expr) {
      arity.exact(1, arguments, Year.name);
      return new Expr({ year: wrap(expr) });
    }
    function ToDate(expr) {
      arity.exact(1, arguments, ToDate.name);
      return new Expr({ to_date: wrap(expr) });
    }
    function MoveDatabase(from, to) {
      arity.exact(2, arguments, MoveDatabase.name);
      return new Expr({ move_database: wrap(from), to: wrap(to) });
    }
    function Documents(collection) {
      arity.exact(1, arguments, Documents.name);
      return new Expr({ documents: wrap(collection) });
    }
    function Reverse(expr) {
      arity.exact(1, arguments, Reverse.name);
      return new Expr({ reverse: wrap(expr) });
    }
    function AccessProvider(name) {
      arity.exact(1, arguments, AccessProvider.name);
      return new Expr({ access_provider: wrap(name) });
    }
    function arity(min, max, args, callerFunc) {
      if (min !== null && args.length < min || max !== null && args.length > max) {
        throw new errors.InvalidArity(min, max, args.length, callerFunc);
      }
    }
    arity.exact = function(n, args, callerFunc) {
      arity(n, n, args, callerFunc);
    };
    arity.max = function(n, args, callerFunc) {
      arity(null, n, args, callerFunc);
    };
    arity.min = function(n, args, callerFunc) {
      arity(n, null, args, callerFunc);
    };
    arity.between = function(min, max, args, callerFunc) {
      arity(min, max, args, callerFunc);
    };
    function params(mainParams, optionalParams) {
      for (var key in optionalParams) {
        var val = optionalParams[key];
        if (val !== null && val !== void 0) {
          mainParams[key] = val;
        }
      }
      return mainParams;
    }
    function varargs(values2) {
      var valuesAsArr = Array.isArray(values2) ? values2 : Array.prototype.slice.call(values2);
      return values2.length === 1 ? values2[0] : valuesAsArr;
    }
    function argsToArray(args) {
      var rv = [];
      rv.push.apply(rv, args);
      return rv;
    }
    function wrap(obj) {
      arity.exact(1, arguments, wrap.name);
      if (obj === null) {
        return null;
      } else if (obj instanceof Expr || util.checkInstanceHasProperty(obj, "_isFaunaExpr")) {
        return obj;
      } else if (typeof obj === "symbol") {
        return obj.toString().replace(/Symbol\((.*)\)/, function(str, symbol) {
          return symbol;
        });
      } else if (typeof obj === "function") {
        return Lambda(obj);
      } else if (Array.isArray(obj)) {
        return new Expr(obj.map(function(elem) {
          return wrap(elem);
        }));
      } else if (obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
        return new values.Bytes(obj);
      } else if (typeof obj === "object") {
        return new Expr({ object: wrapValues(obj) });
      } else {
        return obj;
      }
    }
    function wrapValues(obj) {
      if (obj !== null) {
        var rv = {};
        Object.keys(obj).forEach(function(key) {
          rv[key] = wrap(obj[key]);
        });
        return rv;
      } else {
        return null;
      }
    }
    module2.exports = {
      Ref,
      Bytes,
      Abort,
      At,
      Let,
      Var,
      If,
      Do,
      Object: objectFunction,
      Lambda,
      Call,
      Query,
      Map: Map2,
      Foreach,
      Filter,
      Take,
      Drop,
      Prepend,
      Append,
      IsEmpty,
      IsNonEmpty,
      IsNumber,
      IsDouble,
      IsInteger,
      IsBoolean,
      IsNull,
      IsBytes,
      IsTimestamp,
      IsDate,
      IsString,
      IsArray,
      IsObject,
      IsRef,
      IsSet,
      IsDoc,
      IsLambda,
      IsCollection,
      IsDatabase,
      IsIndex,
      IsFunction,
      IsKey,
      IsToken,
      IsCredentials,
      IsRole,
      Get,
      KeyFromSecret,
      Reduce,
      Paginate,
      Exists,
      Create,
      Update,
      Replace,
      Delete,
      Insert,
      Remove,
      CreateClass: deprecate(CreateClass, "CreateClass() is deprecated, use CreateCollection() instead"),
      CreateCollection,
      CreateDatabase,
      CreateIndex,
      CreateKey,
      CreateFunction,
      CreateRole,
      CreateAccessProvider,
      Singleton,
      Events,
      Match,
      Union,
      Merge,
      Intersection,
      Difference,
      Distinct,
      Join,
      Range,
      Login: Login2,
      Logout,
      Identify,
      Identity: deprecate(Identity, "Identity() is deprecated, use CurrentIdentity() instead"),
      CurrentIdentity,
      HasIdentity: deprecate(HasIdentity, "HasIdentity() is deprecated, use HasCurrentIdentity() instead"),
      HasCurrentIdentity,
      CurrentToken,
      HasCurrentToken,
      Concat,
      Casefold,
      ContainsStr,
      ContainsStrRegex,
      StartsWith,
      EndsWith,
      FindStr,
      FindStrRegex,
      Length,
      LowerCase,
      LTrim,
      NGram,
      Repeat,
      ReplaceStr,
      ReplaceStrRegex,
      RegexEscape,
      RTrim,
      Space,
      SubString,
      TitleCase,
      Trim,
      UpperCase,
      Format,
      Time,
      TimeAdd,
      TimeSubtract,
      TimeDiff,
      Epoch,
      Date: Date2,
      Now,
      NextId: deprecate(NextId, "NextId() is deprecated, use NewId() instead"),
      NewId,
      Database,
      Index,
      Class: deprecate(Class, "Class() is deprecated, use Collection() instead"),
      Collection,
      Function: FunctionFn,
      Role,
      AccessProviders,
      Classes: deprecate(Classes, "Classes() is deprecated, use Collections() instead"),
      Collections,
      Databases,
      Indexes,
      Functions,
      Roles,
      Keys,
      Tokens,
      Credentials,
      Equals,
      Contains: deprecate(Contains, "Contains() is deprecated, use ContainsPath() instead"),
      ContainsPath,
      ContainsField,
      ContainsValue,
      Select,
      SelectAll: deprecate(SelectAll, "SelectAll() is deprecated. Avoid use."),
      Abs,
      Add,
      BitAnd,
      BitNot,
      BitOr,
      BitXor,
      Ceil,
      Divide,
      Floor,
      Max,
      Min,
      Modulo,
      Multiply,
      Round,
      Subtract,
      Sign,
      Sqrt,
      Trunc,
      Count,
      Sum,
      Mean,
      Any,
      All,
      Acos,
      Asin,
      Atan,
      Cos,
      Cosh,
      Degrees,
      Exp,
      Hypot,
      Ln,
      Log,
      Pow,
      Radians,
      Sin,
      Sinh,
      Tan,
      Tanh,
      LT,
      LTE,
      GT,
      GTE,
      And,
      Or,
      Not,
      ToString,
      ToNumber,
      ToObject,
      ToArray,
      ToDouble,
      ToInteger,
      ToTime,
      ToSeconds,
      ToMicros,
      ToMillis,
      DayOfMonth,
      DayOfWeek,
      DayOfYear,
      Second,
      Minute,
      Hour,
      Month,
      Year,
      ToDate,
      MoveDatabase,
      Documents,
      Reverse,
      AccessProvider,
      wrap
    };
  }
});

// node_modules/faunadb/src/_json.js
var require_json = __commonJS({
  "node_modules/faunadb/src/_json.js"(exports, module2) {
    init_shims();
    "use strict";
    var values = require_values();
    function toJSON(object, pretty) {
      pretty = typeof pretty !== "undefined" ? pretty : false;
      if (pretty) {
        return JSON.stringify(object, null, "  ");
      } else {
        return JSON.stringify(object);
      }
    }
    function parseJSON(json) {
      return JSON.parse(json, json_parse);
    }
    function parseJSONStreaming(content) {
      var values2 = [];
      try {
        values2.push(parseJSON(content));
        content = "";
      } catch (err) {
        while (true) {
          var pos = content.indexOf("\n") + 1;
          if (pos <= 0) {
            break;
          }
          var slice = content.slice(0, pos).trim();
          if (slice.length > 0) {
            values2.push(parseJSON(slice));
          }
          content = content.slice(pos);
        }
      }
      return {
        values: values2,
        buffer: content
      };
    }
    function json_parse(_, val) {
      if (typeof val !== "object" || val === null) {
        return val;
      } else if ("@ref" in val) {
        var ref = val["@ref"];
        if (!("collection" in ref) && !("database" in ref)) {
          return values.Native.fromName(ref["id"]);
        }
        var col = json_parse("collection", ref["collection"]);
        var db = json_parse("database", ref["database"]);
        return new values.Ref(ref["id"], col, db);
      } else if ("@obj" in val) {
        return val["@obj"];
      } else if ("@set" in val) {
        return new values.SetRef(val["@set"]);
      } else if ("@ts" in val) {
        return new values.FaunaTime(val["@ts"]);
      } else if ("@date" in val) {
        return new values.FaunaDate(val["@date"]);
      } else if ("@bytes" in val) {
        return new values.Bytes(val["@bytes"]);
      } else if ("@query" in val) {
        return new values.Query(val["@query"]);
      } else {
        return val;
      }
    }
    module2.exports = {
      toJSON,
      parseJSON,
      parseJSONStreaming
    };
  }
});

// node_modules/faunadb/src/PageHelper.js
var require_PageHelper = __commonJS({
  "node_modules/faunadb/src/PageHelper.js"(exports, module2) {
    init_shims();
    "use strict";
    var query = require_query();
    var objectAssign = require_object_assign();
    function PageHelper(client2, set, params, options2) {
      if (params === void 0) {
        params = {};
      }
      if (options2 === void 0) {
        options2 = {};
      }
      this.reverse = false;
      this.params = {};
      this.before = void 0;
      this.after = void 0;
      objectAssign(this.params, params);
      var cursorParams = this.params.cursor || this.params;
      if ("before" in cursorParams) {
        this.before = cursorParams.before;
        delete cursorParams.before;
      } else if ("after" in cursorParams) {
        this.after = cursorParams.after;
        delete cursorParams.after;
      }
      this.options = {};
      objectAssign(this.options, options2);
      this.client = client2;
      this.set = set;
      this._faunaFunctions = [];
    }
    PageHelper.prototype.map = function(lambda) {
      var rv = this._clone();
      rv._faunaFunctions.push(function(q2) {
        return query.Map(q2, lambda);
      });
      return rv;
    };
    PageHelper.prototype.filter = function(lambda) {
      var rv = this._clone();
      rv._faunaFunctions.push(function(q2) {
        return query.Filter(q2, lambda);
      });
      return rv;
    };
    PageHelper.prototype.each = function(lambda) {
      return this._retrieveNextPage(this.after, false).then(this._consumePages(lambda, false));
    };
    PageHelper.prototype.eachReverse = function(lambda) {
      return this._retrieveNextPage(this.before, true).then(this._consumePages(lambda, true));
    };
    PageHelper.prototype.previousPage = function() {
      var self2 = this;
      return this._retrieveNextPage(this.before, true).then(this._adjustCursors.bind(self2));
    };
    PageHelper.prototype.nextPage = function() {
      var self2 = this;
      return this._retrieveNextPage(this.after, false).then(this._adjustCursors.bind(self2));
    };
    PageHelper.prototype._adjustCursors = function(page) {
      if (page.after !== void 0) {
        this.after = page.after;
      }
      if (page.before !== void 0) {
        this.before = page.before;
      }
      return page.data;
    };
    PageHelper.prototype._consumePages = function(lambda, reverse) {
      var self2 = this;
      return function(page) {
        var data = [];
        page.data.forEach(function(item) {
          if (item.document) {
            item.instance = item.document;
          }
          if (item.value && item.value.document) {
            item.value.instance = item.value.document;
          }
          data.push(item);
        });
        lambda(data);
        var nextCursor;
        if (reverse) {
          nextCursor = page.before;
        } else {
          nextCursor = page.after;
        }
        if (nextCursor !== void 0) {
          return self2._retrieveNextPage(nextCursor, reverse).then(self2._consumePages(lambda, reverse));
        } else {
          return Promise.resolve();
        }
      };
    };
    PageHelper.prototype._retrieveNextPage = function(cursor, reverse) {
      var opts = {};
      objectAssign(opts, this.params);
      var cursorOpts = opts.cursor || opts;
      if (cursor !== void 0) {
        if (reverse) {
          cursorOpts.before = cursor;
        } else {
          cursorOpts.after = cursor;
        }
      } else {
        if (reverse) {
          cursorOpts.before = null;
        }
      }
      var q2 = query.Paginate(this.set, opts);
      if (this._faunaFunctions.length > 0) {
        this._faunaFunctions.forEach(function(lambda) {
          q2 = lambda(q2);
        });
      }
      return this.client.query(q2, this.options);
    };
    PageHelper.prototype._clone = function() {
      return Object.create(PageHelper.prototype, {
        client: { value: this.client },
        set: { value: this.set },
        _faunaFunctions: { value: this._faunaFunctions },
        before: { value: this.before },
        after: { value: this.after }
      });
    };
    module2.exports = PageHelper;
  }
});

// node_modules/faunadb/src/RequestResult.js
var require_RequestResult = __commonJS({
  "node_modules/faunadb/src/RequestResult.js"(exports, module2) {
    init_shims();
    "use strict";
    function RequestResult(method, path, query, requestRaw, requestContent, responseRaw, responseContent, statusCode, responseHeaders, startTime, endTime) {
      this.method = method;
      this.path = path;
      this.query = query;
      this.requestRaw = requestRaw;
      this.requestContent = requestContent;
      this.responseRaw = responseRaw;
      this.responseContent = responseContent;
      this.statusCode = statusCode;
      this.responseHeaders = responseHeaders;
      this.startTime = startTime;
      this.endTime = endTime;
    }
    Object.defineProperty(RequestResult.prototype, "timeTaken", {
      get: function() {
        return this.endTime - this.startTime;
      }
    });
    module2.exports = RequestResult;
  }
});

// node_modules/faunadb/src/_http/errors.js
var require_errors2 = __commonJS({
  "node_modules/faunadb/src/_http/errors.js"(exports, module2) {
    init_shims();
    "use strict";
    var util = require_util2();
    function TimeoutError(message) {
      Error.call(this);
      this.message = message || "Request aborted due to timeout";
      this.isTimeoutError = true;
    }
    util.inherits(TimeoutError, Error);
    function AbortError2(message) {
      Error.call(this);
      this.message = message || "Request aborted";
      this.isAbortError = true;
    }
    util.inherits(AbortError2, Error);
    module2.exports = {
      TimeoutError,
      AbortError: AbortError2
    };
  }
});

// node_modules/faunadb/src/_http/http2Adapter.js
var require_http2Adapter = __commonJS({
  "node_modules/faunadb/src/_http/http2Adapter.js"(exports, module2) {
    init_shims();
    "use strict";
    var http2 = require("http2");
    var errors = require_errors2();
    var faunaErrors = require_errors();
    var util = require_util2();
    var STREAM_PREFIX = "stream::";
    function Http2Adapter(options2) {
      this.type = "http2";
      this._sessionMap = {};
      this._http2SessionIdleTime = options2.http2SessionIdleTime;
      this._closed = false;
    }
    Http2Adapter.prototype._resolveSessionFor = function(origin, isStreaming) {
      var sessionKey = isStreaming ? STREAM_PREFIX + origin : origin;
      if (this._sessionMap[sessionKey]) {
        return this._sessionMap[sessionKey];
      }
      var self2 = this;
      var timerId = null;
      var ongoingRequests = 0;
      var cleanup = function() {
        self2._cleanupSessionFor(origin, isStreaming);
      };
      var clearInactivityTimeout = function() {
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
      };
      var setInactivityTimeout = function() {
        clearInactivityTimeout();
        if (self2._http2SessionIdleTime === Infinity) {
          return;
        }
        var onTimeout = function() {
          timerId = null;
          if (ongoingRequests === 0) {
            cleanup();
          }
        };
        timerId = setTimeout(onTimeout, self2._http2SessionIdleTime);
      };
      var close = function(force) {
        clearInactivityTimeout();
        var shouldDestroy = force || isStreaming;
        if (shouldDestroy) {
          session.destroy();
          return Promise.resolve();
        }
        return new Promise(function(resolve2) {
          session.close(resolve2);
        });
      };
      var onRequestStart = function() {
        ++ongoingRequests;
        clearInactivityTimeout();
      };
      var onRequestEnd = function() {
        --ongoingRequests;
        var noOngoingRequests = ongoingRequests === 0;
        var isSessionClosed = self2._closed || session.closed || session.destroyed;
        if (noOngoingRequests && !isSessionClosed) {
          setInactivityTimeout();
        }
      };
      var session = http2.connect(origin).once("error", cleanup).once("goaway", cleanup);
      var sessionInterface = {
        session,
        close,
        onRequestStart,
        onRequestEnd
      };
      this._sessionMap[sessionKey] = sessionInterface;
      return sessionInterface;
    };
    Http2Adapter.prototype._cleanupSessionFor = function(origin, isStreaming) {
      var sessionKey = isStreaming ? STREAM_PREFIX + origin : origin;
      if (this._sessionMap[sessionKey]) {
        this._sessionMap[sessionKey].session.close();
        delete this._sessionMap[sessionKey];
      }
    };
    Http2Adapter.prototype.execute = function(options2) {
      if (this._closed) {
        return Promise.reject(new faunaErrors.ClientClosed("The Client has already been closed", "No subsequent requests can be issued after the .close method is called. Consider creating a new Client instance"));
      }
      var self2 = this;
      var isStreaming = options2.streamConsumer != null;
      return new Promise(function(resolvePromise, rejectPromise) {
        var isPromiseSettled = false;
        var isCanceled = false;
        var resolve2 = function(value) {
          isPromiseSettled = true;
          resolvePromise(value);
        };
        var rejectOrOnError = function(error3) {
          var remapped = remapHttp2Error(error3);
          if (isPromiseSettled && isStreaming) {
            return options2.streamConsumer.onError(remapped);
          }
          isPromiseSettled = true;
          rejectPromise(remapped);
        };
        var onSettled = function() {
          sessionInterface.onRequestEnd();
          if (options2.signal) {
            options2.signal.removeEventListener("abort", onAbort);
          }
        };
        var onError = function(error3) {
          onSettled();
          rejectOrOnError(error3);
        };
        var onAbort = function() {
          isCanceled = true;
          onSettled();
          request.close(http2.constants.NGHTTP2_CANCEL);
          rejectOrOnError(new errors.AbortError());
        };
        var onTimeout = function() {
          isCanceled = true;
          onSettled();
          request.close(http2.constants.NGHTTP2_CANCEL);
          rejectOrOnError(new errors.TimeoutError());
        };
        var onResponse = function(responseHeaders) {
          var status = responseHeaders[http2.constants.HTTP2_HEADER_STATUS];
          var isOkStatus = status >= 200 && status < 400;
          var processStream = isOkStatus && isStreaming;
          var responseBody = "";
          var onData = function(chunk) {
            if (processStream) {
              return options2.streamConsumer.onData(chunk);
            }
            responseBody += chunk;
          };
          var onEnd = function() {
            if (!isCanceled) {
              onSettled();
            }
            if (!processStream) {
              return resolve2({
                body: responseBody,
                headers: responseHeaders,
                status
              });
            }
            if (!isCanceled && !self2._closed) {
              options2.streamConsumer.onError(new TypeError("network error"));
            }
          };
          if (processStream) {
            resolve2({
              body: "[stream]",
              headers: responseHeaders,
              status
            });
          }
          request.on("data", onData).on("end", onEnd);
        };
        try {
          var pathname = (options2.path[0] === "/" ? options2.path : "/" + options2.path) + util.querystringify(options2.query, "?");
          var requestHeaders = Object.assign({}, options2.headers, {
            [http2.constants.HTTP2_HEADER_PATH]: pathname,
            [http2.constants.HTTP2_HEADER_METHOD]: options2.method
          });
          var sessionInterface = self2._resolveSessionFor(options2.origin, isStreaming);
          var request = sessionInterface.session.request(requestHeaders).setEncoding("utf8").on("error", onError).on("response", onResponse);
          sessionInterface.onRequestStart();
          if (!options2.signal && options2.timeout) {
            request.setTimeout(options2.timeout, onTimeout);
          }
          if (options2.signal) {
            options2.signal.addEventListener("abort", onAbort);
          }
          if (options2.body != null) {
            request.write(options2.body);
          }
          request.end();
        } catch (error3) {
          self2._cleanupSessionFor(options2.origin, isStreaming);
          rejectOrOnError(error3);
        }
      });
    };
    Http2Adapter.prototype.close = function(opts) {
      opts = opts || {};
      this._closed = true;
      var noop3 = function() {
      };
      return Promise.all(Object.values(this._sessionMap).map(function(sessionInterface) {
        return sessionInterface.close(opts.force);
      })).then(noop3);
    };
    function remapHttp2Error(error3) {
      var shouldRemap = error3.code === "ERR_HTTP2_GOAWAY_SESSION" || error3.code === "ERR_HTTP2_STREAM_CANCEL";
      if (shouldRemap) {
        return new faunaErrors.ClientClosed("The request is aborted due to the Client#close call");
      }
      return error3;
    }
    module2.exports = Http2Adapter;
  }
});

// node_modules/event-target-shim/dist/event-target-shim.js
var require_event_target_shim = __commonJS({
  "node_modules/event-target-shim/dist/event-target-shim.js"(exports, module2) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var privateData = new WeakMap();
    var wrappers = new WeakMap();
    function pd(event) {
      const retv = privateData.get(event);
      console.assert(retv != null, "'this' is expected an Event object, but got", event);
      return retv;
    }
    function setCancelFlag(data) {
      if (data.passiveListener != null) {
        if (typeof console !== "undefined" && typeof console.error === "function") {
          console.error("Unable to preventDefault inside passive event listener invocation.", data.passiveListener);
        }
        return;
      }
      if (!data.event.cancelable) {
        return;
      }
      data.canceled = true;
      if (typeof data.event.preventDefault === "function") {
        data.event.preventDefault();
      }
    }
    function Event(eventTarget, event) {
      privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        immediateStopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now()
      });
      Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
      const keys = Object.keys(event);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
          Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
      }
    }
    Event.prototype = {
      get type() {
        return pd(this).event.type;
      },
      get target() {
        return pd(this).eventTarget;
      },
      get currentTarget() {
        return pd(this).currentTarget;
      },
      composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
          return [];
        }
        return [currentTarget];
      },
      get NONE() {
        return 0;
      },
      get CAPTURING_PHASE() {
        return 1;
      },
      get AT_TARGET() {
        return 2;
      },
      get BUBBLING_PHASE() {
        return 3;
      },
      get eventPhase() {
        return pd(this).eventPhase;
      },
      stopPropagation() {
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.stopPropagation === "function") {
          data.event.stopPropagation();
        }
      },
      stopImmediatePropagation() {
        const data = pd(this);
        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
          data.event.stopImmediatePropagation();
        }
      },
      get bubbles() {
        return Boolean(pd(this).event.bubbles);
      },
      get cancelable() {
        return Boolean(pd(this).event.cancelable);
      },
      preventDefault() {
        setCancelFlag(pd(this));
      },
      get defaultPrevented() {
        return pd(this).canceled;
      },
      get composed() {
        return Boolean(pd(this).event.composed);
      },
      get timeStamp() {
        return pd(this).timeStamp;
      },
      get srcElement() {
        return pd(this).eventTarget;
      },
      get cancelBubble() {
        return pd(this).stopped;
      },
      set cancelBubble(value) {
        if (!value) {
          return;
        }
        const data = pd(this);
        data.stopped = true;
        if (typeof data.event.cancelBubble === "boolean") {
          data.event.cancelBubble = true;
        }
      },
      get returnValue() {
        return !pd(this).canceled;
      },
      set returnValue(value) {
        if (!value) {
          setCancelFlag(pd(this));
        }
      },
      initEvent() {
      }
    };
    Object.defineProperty(Event.prototype, "constructor", {
      value: Event,
      configurable: true,
      writable: true
    });
    if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
      Object.setPrototypeOf(Event.prototype, window.Event.prototype);
      wrappers.set(window.Event.prototype, Event);
    }
    function defineRedirectDescriptor(key) {
      return {
        get() {
          return pd(this).event[key];
        },
        set(value) {
          pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true
      };
    }
    function defineCallDescriptor(key) {
      return {
        value() {
          const event = pd(this).event;
          return event[key].apply(event, arguments);
        },
        configurable: true,
        enumerable: true
      };
    }
    function defineWrapper(BaseEvent, proto) {
      const keys = Object.keys(proto);
      if (keys.length === 0) {
        return BaseEvent;
      }
      function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
      }
      CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true }
      });
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, key);
          const isFunc = typeof descriptor.value === "function";
          Object.defineProperty(CustomEvent.prototype, key, isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key));
        }
      }
      return CustomEvent;
    }
    function getWrapper(proto) {
      if (proto == null || proto === Object.prototype) {
        return Event;
      }
      let wrapper = wrappers.get(proto);
      if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
      }
      return wrapper;
    }
    function wrapEvent(eventTarget, event) {
      const Wrapper = getWrapper(Object.getPrototypeOf(event));
      return new Wrapper(eventTarget, event);
    }
    function isStopped(event) {
      return pd(event).immediateStopped;
    }
    function setEventPhase(event, eventPhase) {
      pd(event).eventPhase = eventPhase;
    }
    function setCurrentTarget(event, currentTarget) {
      pd(event).currentTarget = currentTarget;
    }
    function setPassiveListener(event, passiveListener) {
      pd(event).passiveListener = passiveListener;
    }
    var listenersMap = new WeakMap();
    var CAPTURE = 1;
    var BUBBLE = 2;
    var ATTRIBUTE = 3;
    function isObject(x) {
      return x !== null && typeof x === "object";
    }
    function getListeners(eventTarget) {
      const listeners = listenersMap.get(eventTarget);
      if (listeners == null) {
        throw new TypeError("'this' is expected an EventTarget object, but got another value.");
      }
      return listeners;
    }
    function defineEventAttributeDescriptor(eventName) {
      return {
        get() {
          const listeners = getListeners(this);
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              return node.listener;
            }
            node = node.next;
          }
          return null;
        },
        set(listener) {
          if (typeof listener !== "function" && !isObject(listener)) {
            listener = null;
          }
          const listeners = getListeners(this);
          let prev = null;
          let node = listeners.get(eventName);
          while (node != null) {
            if (node.listenerType === ATTRIBUTE) {
              if (prev !== null) {
                prev.next = node.next;
              } else if (node.next !== null) {
                listeners.set(eventName, node.next);
              } else {
                listeners.delete(eventName);
              }
            } else {
              prev = node;
            }
            node = node.next;
          }
          if (listener !== null) {
            const newNode = {
              listener,
              listenerType: ATTRIBUTE,
              passive: false,
              once: false,
              next: null
            };
            if (prev === null) {
              listeners.set(eventName, newNode);
            } else {
              prev.next = newNode;
            }
          }
        },
        configurable: true,
        enumerable: true
      };
    }
    function defineEventAttribute(eventTargetPrototype, eventName) {
      Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
    }
    function defineCustomEventTarget(eventNames) {
      function CustomEventTarget() {
        EventTarget.call(this);
      }
      CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: {
          value: CustomEventTarget,
          configurable: true,
          writable: true
        }
      });
      for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
      }
      return CustomEventTarget;
    }
    function EventTarget() {
      if (this instanceof EventTarget) {
        listenersMap.set(this, new Map());
        return;
      }
      if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0]);
      }
      if (arguments.length > 0) {
        const types2 = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
          types2[i] = arguments[i];
        }
        return defineCustomEventTarget(types2);
      }
      throw new TypeError("Cannot call a class as a function");
    }
    EventTarget.prototype = {
      addEventListener(eventName, listener, options2) {
        if (listener == null) {
          return;
        }
        if (typeof listener !== "function" && !isObject(listener)) {
          throw new TypeError("'listener' should be a function or an object.");
        }
        const listeners = getListeners(this);
        const optionsIsObj = isObject(options2);
        const capture = optionsIsObj ? Boolean(options2.capture) : Boolean(options2);
        const listenerType = capture ? CAPTURE : BUBBLE;
        const newNode = {
          listener,
          listenerType,
          passive: optionsIsObj && Boolean(options2.passive),
          once: optionsIsObj && Boolean(options2.once),
          next: null
        };
        let node = listeners.get(eventName);
        if (node === void 0) {
          listeners.set(eventName, newNode);
          return;
        }
        let prev = null;
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            return;
          }
          prev = node;
          node = node.next;
        }
        prev.next = newNode;
      },
      removeEventListener(eventName, listener, options2) {
        if (listener == null) {
          return;
        }
        const listeners = getListeners(this);
        const capture = isObject(options2) ? Boolean(options2.capture) : Boolean(options2);
        const listenerType = capture ? CAPTURE : BUBBLE;
        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listener === listener && node.listenerType === listenerType) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
            return;
          }
          prev = node;
          node = node.next;
        }
      },
      dispatchEvent(event) {
        if (event == null || typeof event.type !== "string") {
          throw new TypeError('"event.type" should be a string.');
        }
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
          return true;
        }
        const wrappedEvent = wrapEvent(this, event);
        let prev = null;
        while (node != null) {
          if (node.once) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
          } else {
            prev = node;
          }
          setPassiveListener(wrappedEvent, node.passive ? node.listener : null);
          if (typeof node.listener === "function") {
            try {
              node.listener.call(this, wrappedEvent);
            } catch (err) {
              if (typeof console !== "undefined" && typeof console.error === "function") {
                console.error(err);
              }
            }
          } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
            node.listener.handleEvent(wrappedEvent);
          }
          if (isStopped(wrappedEvent)) {
            break;
          }
          node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);
        return !wrappedEvent.defaultPrevented;
      }
    };
    Object.defineProperty(EventTarget.prototype, "constructor", {
      value: EventTarget,
      configurable: true,
      writable: true
    });
    if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
      Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
    }
    exports.defineEventAttribute = defineEventAttribute;
    exports.EventTarget = EventTarget;
    exports.default = EventTarget;
    module2.exports = EventTarget;
    module2.exports.EventTarget = module2.exports["default"] = EventTarget;
    module2.exports.defineEventAttribute = defineEventAttribute;
  }
});

// node_modules/abort-controller/dist/abort-controller.js
var require_abort_controller = __commonJS({
  "node_modules/abort-controller/dist/abort-controller.js"(exports, module2) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var eventTargetShim = require_event_target_shim();
    var AbortSignal = class extends eventTargetShim.EventTarget {
      constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
      }
      get aborted() {
        const aborted = abortedFlags.get(this);
        if (typeof aborted !== "boolean") {
          throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
        }
        return aborted;
      }
    };
    eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
    function createAbortSignal() {
      const signal = Object.create(AbortSignal.prototype);
      eventTargetShim.EventTarget.call(signal);
      abortedFlags.set(signal, false);
      return signal;
    }
    function abortSignal(signal) {
      if (abortedFlags.get(signal) !== false) {
        return;
      }
      abortedFlags.set(signal, true);
      signal.dispatchEvent({ type: "abort" });
    }
    var abortedFlags = new WeakMap();
    Object.defineProperties(AbortSignal.prototype, {
      aborted: { enumerable: true }
    });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
      Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortSignal"
      });
    }
    var AbortController2 = class {
      constructor() {
        signals.set(this, createAbortSignal());
      }
      get signal() {
        return getSignal(this);
      }
      abort() {
        abortSignal(getSignal(this));
      }
    };
    var signals = new WeakMap();
    function getSignal(controller) {
      const signal = signals.get(controller);
      if (signal == null) {
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
      }
      return signal;
    }
    Object.defineProperties(AbortController2.prototype, {
      signal: { enumerable: true },
      abort: { enumerable: true }
    });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
      Object.defineProperty(AbortController2.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortController"
      });
    }
    exports.AbortController = AbortController2;
    exports.AbortSignal = AbortSignal;
    exports.default = AbortController2;
    module2.exports = AbortController2;
    module2.exports.AbortController = module2.exports["default"] = AbortController2;
    module2.exports.AbortSignal = AbortSignal;
  }
});

// node_modules/abort-controller/polyfill.js
var require_polyfill = __commonJS({
  "node_modules/abort-controller/polyfill.js"() {
    init_shims();
    "use strict";
    var ac = require_abort_controller();
    var g = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : void 0;
    if (g) {
      if (typeof g.AbortController === "undefined") {
        g.AbortController = ac.AbortController;
      }
      if (typeof g.AbortSignal === "undefined") {
        g.AbortSignal = ac.AbortSignal;
      }
    }
  }
});

// node_modules/faunadb/src/_http/fetchAdapter.js
var require_fetchAdapter = __commonJS({
  "node_modules/faunadb/src/_http/fetchAdapter.js"(exports, module2) {
    init_shims();
    "use strict";
    require_polyfill();
    var util = require_util2();
    var faunaErrors = require_errors();
    var errors = require_errors2();
    function FetchAdapter(options2) {
      options2 = options2 || {};
      this.type = "fetch";
      this._closed = false;
      this._fetch = util.resolveFetch(options2.fetch);
      this._pendingRequests = new Map();
      if (util.isNodeEnv() && options2.keepAlive) {
        this._keepAliveEnabledAgent = new (options2.isHttps ? require("https") : require("http")).Agent({ keepAlive: true });
      }
    }
    FetchAdapter.prototype.execute = function(options2) {
      if (this._closed) {
        return Promise.reject(new faunaErrors.ClientClosed("The Client has already been closed", "No subsequent requests can be issued after the .close method is called. Consider creating a new Client instance"));
      }
      var self2 = this;
      var timerId = null;
      var isStreaming = options2.streamConsumer != null;
      var useTimeout = !options2.signal && !!options2.timeout;
      var ctrl = new AbortController();
      var pendingRequest = {
        isStreaming,
        isAbortedByClose: false,
        onComplete: null
      };
      self2._pendingRequests.set(ctrl, pendingRequest);
      var onComplete = function() {
        self2._pendingRequests.delete(ctrl);
        if (options2.signal) {
          options2.signal.removeEventListener("abort", onAbort);
        }
        if (pendingRequest.onComplete) {
          pendingRequest.onComplete();
        }
      };
      var onSettle = function() {
        if (timerId) {
          clearTimeout(timerId);
        }
      };
      var onResponse = function(response) {
        onSettle();
        var headers = responseHeadersAsObject(response.headers);
        var processStream = isStreaming && response.ok;
        if (!processStream) {
          onComplete();
          return response.text().then(function(content) {
            return {
              body: content,
              headers,
              status: response.status
            };
          });
        }
        attachStreamConsumer(response, options2.streamConsumer, onComplete);
        return {
          body: "[stream]",
          headers,
          status: response.status
        };
      };
      var onError = function(error3) {
        onSettle();
        onComplete();
        return Promise.reject(remapIfAbortError(error3, function() {
          if (!isStreaming && pendingRequest.isAbortedByClose) {
            return new faunaErrors.ClientClosed("The request is aborted due to the Client#close call with the force=true option");
          }
          return useTimeout ? new errors.TimeoutError() : new errors.AbortError();
        }));
      };
      var onAbort = function() {
        ctrl.abort();
      };
      if (useTimeout) {
        timerId = setTimeout(function() {
          timerId = null;
          ctrl.abort();
        }, options2.timeout);
      }
      if (options2.signal) {
        options2.signal.addEventListener("abort", onAbort);
      }
      return this._fetch(util.formatUrl(options2.origin, options2.path, options2.query), {
        method: options2.method,
        headers: options2.headers,
        body: options2.body,
        agent: this._keepAliveEnabledAgent,
        signal: ctrl.signal
      }).then(onResponse).catch(onError);
    };
    FetchAdapter.prototype.close = function(opts) {
      opts = opts || {};
      this._closed = true;
      var promises = [];
      var abortOrWait = function(pendingRequest, ctrl) {
        var shouldAbort = pendingRequest.isStreaming || opts.force;
        if (shouldAbort) {
          pendingRequest.isAbortedByClose = true;
          return ctrl.abort();
        }
        promises.push(new Promise(function(resolve2) {
          pendingRequest.onComplete = resolve2;
        }));
      };
      this._pendingRequests.forEach(abortOrWait);
      var noop3 = function() {
      };
      return Promise.all(promises).then(noop3);
    };
    function attachStreamConsumer(response, consumer, onComplete) {
      var onError = function(error3) {
        onComplete();
        consumer.onError(remapIfAbortError(error3));
      };
      if (util.isNodeEnv()) {
        response.body.on("error", onError).on("data", consumer.onData).on("end", function() {
          onComplete();
          consumer.onError(new TypeError("network error"));
        });
        return;
      }
      try {
        let pump = function() {
          return reader.read().then(function(msg) {
            if (!msg.done) {
              var chunk = decoder.decode(msg.value, { stream: true });
              consumer.onData(chunk);
              return pump();
            }
            onComplete();
            consumer.onError(new TypeError("network error"));
          });
        };
        var reader = response.body.getReader();
        var decoder = new TextDecoder("utf-8");
        pump().catch(onError);
      } catch (err) {
        throw new faunaErrors.StreamsNotSupported("Please, consider providing a Fetch API-compatible function with streamable response bodies. " + err);
      }
    }
    function remapIfAbortError(error3, errorFactory) {
      var isAbortError = error3 && error3.name === "AbortError";
      if (!isAbortError) {
        return error3;
      }
      if (errorFactory) {
        return errorFactory();
      }
      return new errors.AbortError();
    }
    function responseHeadersAsObject(headers) {
      var result = {};
      for (var header of headers.entries()) {
        var key = header[0];
        var value = header[1];
        result[key] = value;
      }
      return result;
    }
    module2.exports = FetchAdapter;
  }
});

// node_modules/faunadb/src/_http/index.js
var require_http = __commonJS({
  "node_modules/faunadb/src/_http/index.js"(exports, module2) {
    init_shims();
    "use strict";
    var packageJson = require_package();
    var { getBrowserOsDetails } = require_util2();
    var util = require_util2();
    var errors = require_errors2();
    function HttpClient(options2) {
      var isHttps = options2.scheme === "https";
      if (!options2.port) {
        options2.port = isHttps ? 443 : 80;
      }
      var useHttp2Adapter = !options2.fetch && util.isNodeEnv() && isHttp2Supported();
      this._adapter = useHttp2Adapter ? new (require_http2Adapter())({
        http2SessionIdleTime: options2.http2SessionIdleTime
      }) : new (require_fetchAdapter())({
        isHttps,
        fetch: options2.fetch,
        keepAlive: options2.keepAlive
      });
      this._baseUrl = options2.scheme + "://" + options2.domain + ":" + options2.port;
      this._secret = options2.secret;
      this._headers = Object.assign({}, options2.headers, getDefaultHeaders());
      this._queryTimeout = options2.queryTimeout;
      this._lastSeen = null;
      this._timeout = Math.floor(options2.timeout * 1e3);
    }
    HttpClient.prototype.getLastTxnTime = function() {
      return this._lastSeen;
    };
    HttpClient.prototype.syncLastTxnTime = function(time) {
      if (this._lastSeen == null || this._lastSeen < time) {
        this._lastSeen = time;
      }
    };
    HttpClient.prototype.close = function(opts) {
      return this._adapter.close(opts);
    };
    HttpClient.prototype.execute = function(options2) {
      options2 = options2 || {};
      var invalidStreamConsumer = options2.streamConsumer && (typeof options2.streamConsumer.onData !== "function" || typeof options2.streamConsumer.onError !== "function");
      if (invalidStreamConsumer) {
        return Promise.reject(new TypeError('Invalid "streamConsumer" provided'));
      }
      var secret = options2.secret || this._secret;
      var queryTimeout = options2.queryTimeout || this._queryTimeout;
      var headers = this._headers;
      headers["Authorization"] = secret && secretHeader(secret);
      headers["X-Last-Seen-Txn"] = this._lastSeen;
      headers["X-Query-Timeout"] = queryTimeout;
      return this._adapter.execute({
        origin: this._baseUrl,
        path: options2.path || "/",
        query: options2.query,
        method: options2.method || "GET",
        headers: util.removeNullAndUndefinedValues(headers),
        body: options2.body,
        signal: options2.signal,
        timeout: this._timeout,
        streamConsumer: options2.streamConsumer
      });
    };
    function secretHeader(secret) {
      return "Bearer " + secret;
    }
    function getDefaultHeaders() {
      var driverEnv = {
        driver: ["javascript", packageJson.version].join("-")
      };
      var isServiceWorker;
      try {
        isServiceWorker = global instanceof ServiceWorkerGlobalScope;
      } catch (error3) {
        isServiceWorker = false;
      }
      try {
        if (util.isNodeEnv()) {
          driverEnv.runtime = ["nodejs", process.version].join("-");
          driverEnv.env = util.getNodeRuntimeEnv();
          var os = require("os");
          driverEnv.os = [os.platform(), os.release()].join("-");
        } else if (isServiceWorker) {
          driverEnv.runtime = "Service Worker";
        } else {
          driverEnv.runtime = util.getBrowserDetails();
          driverEnv.env = "browser";
          driverEnv.os = getBrowserOsDetails();
        }
      } catch (_) {
      }
      var headers = {
        "X-FaunaDB-API-Version": packageJson.apiVersion
      };
      if (util.isNodeEnv()) {
        headers["X-Driver-Env"] = Object.keys(driverEnv).map((key) => [key, driverEnv[key].toLowerCase()].join("=")).join("; ");
      }
      return headers;
    }
    function isHttp2Supported() {
      try {
        require("http2");
        return true;
      } catch (_) {
        return false;
      }
    }
    module2.exports = {
      HttpClient,
      TimeoutError: errors.TimeoutError,
      AbortError: errors.AbortError
    };
  }
});

// node_modules/faunadb/src/stream.js
var require_stream = __commonJS({
  "node_modules/faunadb/src/stream.js"(exports, module2) {
    init_shims();
    "use strict";
    require_polyfill();
    var RequestResult = require_RequestResult();
    var errors = require_errors();
    var json = require_json();
    var http2 = require_http();
    var q2 = require_query();
    var util = require_util2();
    var DefaultEvents = ["start", "error", "version", "history_rewrite"];
    var DocumentStreamEvents = DefaultEvents.concat(["snapshot"]);
    function StreamClient(client2, expression, options2, onEvent) {
      options2 = util.applyDefaults(options2, {
        fields: null
      });
      this._client = client2;
      this._onEvent = onEvent;
      this._query = q2.wrap(expression);
      this._urlParams = options2.fields ? { fields: options2.fields.join(",") } : null;
      this._abort = new AbortController();
      this._state = "idle";
    }
    StreamClient.prototype.snapshot = function() {
      var self2 = this;
      self2._client.query(q2.Get(self2._query)).then(function(doc) {
        self2._onEvent({
          type: "snapshot",
          event: doc
        });
      }).catch(function(error3) {
        self2._onEvent({
          type: "error",
          event: error3
        });
      });
    };
    StreamClient.prototype.subscribe = function() {
      var self2 = this;
      if (self2._state === "idle") {
        self2._state = "open";
      } else {
        throw new Error("Subscription#start should not be called several times, consider instantiating a new stream instead.");
      }
      var body = JSON.stringify(self2._query);
      var startTime = Date.now();
      var buffer = "";
      function onResponse(response) {
        var endTime = Date.now();
        var parsed;
        try {
          parsed = json.parseJSON(response.body);
        } catch (_) {
          parsed = response.body;
        }
        var result = new RequestResult("POST", "stream", self2._urlParams, body, self2._query, response.body, parsed, response.status, response.headers, startTime, endTime);
        self2._client._handleRequestResult(response, result);
      }
      function onData(data) {
        var result = json.parseJSONStreaming(buffer + data);
        buffer = result.buffer;
        result.values.forEach(function(event) {
          if (event.txn !== void 0) {
            self2._client.syncLastTxnTime(event.txn);
          }
          if (event.event === "error") {
            onError(new errors.StreamErrorEvent(event));
          } else {
            self2._onEvent(event);
          }
        });
      }
      function onError(error3) {
        if (error3 instanceof http2.AbortError) {
          return;
        }
        self2._onEvent({
          type: "error",
          event: error3
        });
      }
      self2._client._http.execute({
        method: "POST",
        path: "stream",
        body,
        query: self2._urlParams,
        signal: this._abort.signal,
        streamConsumer: {
          onError,
          onData
        }
      }).then(onResponse).catch(onError);
    };
    StreamClient.prototype.close = function() {
      if (this._state !== "closed") {
        this._state = "closed";
        this._abort.abort();
      }
    };
    function EventDispatcher(allowedEvents) {
      this._allowedEvents = allowedEvents;
      this._listeners = {};
    }
    EventDispatcher.prototype.on = function(type, callback) {
      if (this._allowedEvents.indexOf(type) === -1) {
        throw new Error("Unknown event type: " + type);
      }
      if (this._listeners[type] === void 0) {
        this._listeners[type] = [];
      }
      this._listeners[type].push(callback);
    };
    EventDispatcher.prototype.dispatch = function(event) {
      var listeners = this._listeners[event.type];
      if (!listeners) {
        return;
      }
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].call(null, event.event, event);
      }
    };
    function Subscription(client2, dispatcher) {
      this._client = client2;
      this._dispatcher = dispatcher;
    }
    Subscription.prototype.on = function(type, callback) {
      this._dispatcher.on(type, callback);
      return this;
    };
    Subscription.prototype.start = function() {
      this._client.subscribe();
      return this;
    };
    Subscription.prototype.close = function() {
      this._client.close();
    };
    function StreamAPI(client2) {
      var api = function(expression, options2) {
        var dispatcher = new EventDispatcher(DefaultEvents);
        var streamClient = new StreamClient(client2, expression, options2, function(event) {
          dispatcher.dispatch(event);
        });
        return new Subscription(streamClient, dispatcher);
      };
      api.document = function(expression, options2) {
        var buffer = [];
        var buffering = true;
        var dispatcher = new EventDispatcher(DocumentStreamEvents);
        var streamClient = new StreamClient(client2, expression, options2, onEvent);
        function onEvent(event) {
          switch (event.type) {
            case "start":
              dispatcher.dispatch(event);
              streamClient.snapshot();
              break;
            case "snapshot":
              resume(event);
              break;
            case "error":
              dispatcher.dispatch(event);
              break;
            default:
              if (buffering) {
                buffer.push(event);
              } else {
                dispatcher.dispatch(event);
              }
          }
        }
        function resume(snapshotEvent) {
          dispatcher.dispatch(snapshotEvent);
          for (var i = 0; i < buffer.length; i++) {
            var bufferedEvent = buffer[i];
            if (bufferedEvent.txn > snapshotEvent.event.ts) {
              dispatcher.dispatch(bufferedEvent);
            }
          }
          buffering = false;
          buffer = null;
        }
        return new Subscription(streamClient, dispatcher);
      };
      return api;
    }
    module2.exports = {
      StreamAPI
    };
  }
});

// node_modules/faunadb/src/Client.js
var require_Client = __commonJS({
  "node_modules/faunadb/src/Client.js"(exports, module2) {
    init_shims();
    "use strict";
    var packageJson = require_package();
    var PageHelper = require_PageHelper();
    var RequestResult = require_RequestResult();
    var errors = require_errors();
    var http2 = require_http();
    var json = require_json();
    var query = require_query();
    var stream = require_stream();
    var util = require_util2();
    var values = require_values();
    function Client(options2) {
      var http2SessionIdleTime = getHttp2SessionIdleTime();
      options2 = util.applyDefaults(options2, {
        domain: "db.fauna.com",
        scheme: "https",
        port: null,
        secret: null,
        timeout: 60,
        observer: null,
        keepAlive: true,
        headers: {},
        fetch: void 0,
        queryTimeout: null,
        http2SessionIdleTime: http2SessionIdleTime.value
      });
      if (http2SessionIdleTime.shouldOverride) {
        options2.http2SessionIdleTime = http2SessionIdleTime.value;
      }
      this._observer = options2.observer;
      this._http = new http2.HttpClient(options2);
      this.stream = stream.StreamAPI(this);
    }
    Client.apiVersion = packageJson.apiVersion;
    Client.prototype.query = function(expression, options2) {
      return this._execute("POST", "", query.wrap(expression), null, options2);
    };
    Client.prototype.paginate = function(expression, params, options2) {
      params = util.defaults(params, {});
      options2 = util.defaults(options2, {});
      return new PageHelper(this, expression, params, options2);
    };
    Client.prototype.ping = function(scope, timeout) {
      return this._execute("GET", "ping", null, { scope, timeout });
    };
    Client.prototype.getLastTxnTime = function() {
      return this._http.getLastTxnTime();
    };
    Client.prototype.syncLastTxnTime = function(time) {
      this._http.syncLastTxnTime(time);
    };
    Client.prototype.close = function(opts) {
      return this._http.close(opts);
    };
    Client.prototype._execute = function(method, path, data, query2, options2) {
      query2 = util.defaults(query2, null);
      if (path instanceof values.Ref || util.checkInstanceHasProperty(path, "_isFaunaRef")) {
        path = path.value;
      }
      if (query2 !== null) {
        query2 = util.removeUndefinedValues(query2);
      }
      var startTime = Date.now();
      var self2 = this;
      var body = ["GET", "HEAD"].indexOf(method) >= 0 ? void 0 : JSON.stringify(data);
      return this._http.execute(Object.assign({}, options2, {
        path,
        query: query2,
        method,
        body
      })).then(function(response) {
        var endTime = Date.now();
        var responseObject = json.parseJSON(response.body);
        var result = new RequestResult(method, path, query2, body, data, response.body, responseObject, response.status, response.headers, startTime, endTime);
        self2._handleRequestResult(response, result, options2);
        return responseObject["resource"];
      });
    };
    Client.prototype._handleRequestResult = function(response, result, options2) {
      var txnTimeHeaderKey = "x-txn-time";
      if (response.headers[txnTimeHeaderKey] != null) {
        this.syncLastTxnTime(parseInt(response.headers[txnTimeHeaderKey], 10));
      }
      var observers = [this._observer, options2 && options2.observer];
      observers.forEach((observer) => {
        if (typeof observer == "function") {
          observer(result, this);
        }
      });
      errors.FaunaHTTPError.raiseForStatusCode(result);
    };
    function getHttp2SessionIdleTime() {
      var fromEnv = util.getEnvVariable("FAUNADB_HTTP2_SESSION_IDLE_TIME");
      var parsed = fromEnv === "Infinity" ? Infinity : parseInt(fromEnv, 10);
      var useEnvVar = !isNaN(parsed);
      return {
        shouldOverride: useEnvVar,
        value: useEnvVar ? parsed : 500
      };
    }
    module2.exports = Client;
  }
});

// node_modules/faunadb/src/clientLogger.js
var require_clientLogger = __commonJS({
  "node_modules/faunadb/src/clientLogger.js"(exports, module2) {
    init_shims();
    "use strict";
    var json = require_json();
    function logger(loggerFunction) {
      return function(requestResult, client2) {
        return loggerFunction(showRequestResult(requestResult), client2);
      };
    }
    function showRequestResult(requestResult) {
      var query = requestResult.query, method = requestResult.method, path = requestResult.path, requestContent = requestResult.requestContent, responseHeaders = requestResult.responseHeaders, responseContent = requestResult.responseContent, statusCode = requestResult.statusCode, timeTaken = requestResult.timeTaken;
      var out = "";
      function log(str) {
        out = out + str;
      }
      log("Fauna " + method + " /" + path + _queryString(query) + "\n");
      if (requestContent != null) {
        log("  Request JSON: " + _showJSON(requestContent) + "\n");
      }
      log("  Response headers: " + _showJSON(responseHeaders) + "\n");
      log("  Response JSON: " + _showJSON(responseContent) + "\n");
      log("  Response (" + statusCode + "): Network latency " + timeTaken + "ms\n");
      return out;
    }
    function _indent(str) {
      var indentStr = "  ";
      return str.split("\n").join("\n" + indentStr);
    }
    function _showJSON(object) {
      return _indent(json.toJSON(object, true));
    }
    function _queryString(query) {
      if (query == null) {
        return "";
      }
      var keys = Object.keys(query);
      if (keys.length === 0) {
        return "";
      }
      var pairs = keys.map(function(key) {
        return key + "=" + query[key];
      });
      return "?" + pairs.join("&");
    }
    module2.exports = {
      logger,
      showRequestResult
    };
  }
});

// node_modules/faunadb/index.js
var require_faunadb = __commonJS({
  "node_modules/faunadb/index.js"(exports, module2) {
    init_shims();
    var query = require_query();
    var util = require_util2();
    var parseJSON = require_json().parseJSON;
    module2.exports = util.mergeObjects({
      Client: require_Client(),
      Expr: require_Expr(),
      PageHelper: require_PageHelper(),
      RequestResult: require_RequestResult(),
      clientLogger: require_clientLogger(),
      errors: require_errors(),
      values: require_values(),
      query,
      parseJSON
    }, query);
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
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
  function subscribe2(run2, invalidate = noop) {
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
  return { set, update, subscribe: subscribe2 };
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
      const q2 = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q2 ? `?${q2}` : ""))
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
var import_faunadb = __toModule(require_faunadb());
function noop2() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal2(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
var css = {
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
  $$result.css.add(css);
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
      file: "/./_app/start-c9f507bf.js",
      css: ["/./_app/assets/start-a8cd1609.css"],
      js: ["/./_app/start-c9f507bf.js", "/./_app/chunks/vendor-91fe6b9c.js"]
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
  assets: [{ "file": "app.css", "size": 8521, "type": "text/css" }, { "file": "arrow.svg", "size": 185, "type": "image/svg+xml" }, { "file": "blueberries.jpg", "size": 318545, "type": "image/jpeg" }, { "file": "bread1.jpg", "size": 57729, "type": "image/jpeg" }, { "file": "Certified.svg", "size": 1801, "type": "image/svg+xml" }, { "file": "cucumber.jpg", "size": 626692, "type": "image/jpeg" }, { "file": "delete_black_24dp.svg", "size": 203, "type": "image/svg+xml" }, { "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "fruits.jpg", "size": 215927, "type": "image/jpeg" }, { "file": "Logo.svg", "size": 1696, "type": "image/svg+xml" }, { "file": "milk.jpg", "size": 29871, "type": "image/jpeg" }, { "file": "peas.jpg", "size": 379271, "type": "image/jpeg" }, { "file": "raspberries.jpg", "size": 418879, "type": "image/jpeg" }, { "file": "salami.jpg", "size": 669390, "type": "image/jpeg" }, { "file": "steak.jpg", "size": 600860, "type": "image/jpeg" }, { "file": "strawberries.jpg", "size": 102563, "type": "image/jpeg" }, { "file": "tomato.jpg", "size": 251370, "type": "image/jpeg" }, { "file": "watermelon.jpg", "size": 259580, "type": "image/jpeg" }],
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
    },
    {
      type: "endpoint",
      pattern: /^\/api\/hello-world\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return helloWorld;
      })
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
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-6d23c8d7.js", "css": [], "js": ["/./_app/pages/__layout.svelte-6d23c8d7.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-31675049.js", "css": [], "js": ["/./_app/error.svelte-31675049.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-169523ce.js", "css": [], "js": ["/./_app/pages/index.svelte-169523ce.js", "/./_app/chunks/vendor-91fe6b9c.js", "/./_app/chunks/productcard-f8e80c01.js", "/./_app/chunks/products-93807a47.js"], "styles": [] }, "src/routes/backstore/__layout.svelte": { "entry": "/./_app/pages/backstore/__layout.svelte-8b805fa6.js", "css": [], "js": ["/./_app/pages/backstore/__layout.svelte-8b805fa6.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/backstore/products/index.svelte": { "entry": "/./_app/pages/backstore/products/index.svelte-619c015c.js", "css": [], "js": ["/./_app/pages/backstore/products/index.svelte-619c015c.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/backstore/orders/index.svelte": { "entry": "/./_app/pages/backstore/orders/index.svelte-f4a14ab6.js", "css": [], "js": ["/./_app/pages/backstore/orders/index.svelte-f4a14ab6.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/backstore/users/index.svelte": { "entry": "/./_app/pages/backstore/users/index.svelte-fc96d827.js", "css": [], "js": ["/./_app/pages/backstore/users/index.svelte-fc96d827.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/products/index.svelte": { "entry": "/./_app/pages/products/index.svelte-ce325eb3.js", "css": [], "js": ["/./_app/pages/products/index.svelte-ce325eb3.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/products/[product].svelte": { "entry": "/./_app/pages/products/[product].svelte-1d1086af.js", "css": [], "js": ["/./_app/pages/products/[product].svelte-1d1086af.js", "/./_app/chunks/vendor-91fe6b9c.js", "/./_app/chunks/products-93807a47.js"], "styles": [] }, "src/routes/aisles/index.svelte": { "entry": "/./_app/pages/aisles/index.svelte-872246d8.js", "css": [], "js": ["/./_app/pages/aisles/index.svelte-872246d8.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/aisles/[aisle].svelte": { "entry": "/./_app/pages/aisles/[aisle].svelte-4fdc5cd0.js", "css": [], "js": ["/./_app/pages/aisles/[aisle].svelte-4fdc5cd0.js", "/./_app/chunks/vendor-91fe6b9c.js", "/./_app/chunks/products-93807a47.js", "/./_app/chunks/productcard-f8e80c01.js"], "styles": [] }, "src/routes/signup.svelte": { "entry": "/./_app/pages/signup.svelte-f3b5d64b.js", "css": [], "js": ["/./_app/pages/signup.svelte-f3b5d64b.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/login.svelte": { "entry": "/./_app/pages/login.svelte-ab76051d.js", "css": [], "js": ["/./_app/pages/login.svelte-ab76051d.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] }, "src/routes/cart.svelte": { "entry": "/./_app/pages/cart.svelte-84425300.js", "css": [], "js": ["/./_app/pages/cart.svelte-84425300.js", "/./_app/chunks/vendor-91fe6b9c.js"], "styles": [] } };
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
var q = import_faunadb.default.query;
var client = new import_faunadb.default.Client({
  secret: "fnAEPGcbctACRIQyJcww1pSFWkFEK6ooGuNwjkRN"
});
async function get({ params }) {
  const products = client.query(q.Paginate(q.Match(q.Index("all_products"))));
  if (products) {
    return {
      body: {
        products
      }
    };
  }
}
var helloWorld = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"header-wrapper"}"><div class="${"header"}"><a href="${"/"}"><svg class="${"logo"}" viewBox="${"0 0 87 59"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M43.2363 57.815C54.9844 57.815 65.643 54.6413 73.3792 49.4839C81.1118 44.3288 85.9726 37.1522 85.9726 29.1575C85.9726 21.1628 81.1118 13.9862 73.3792 8.83112C65.643 3.67369 54.9844 0.5 43.2363 0.5C31.4881 0.5 20.8295 3.67369 13.0934 8.83112C5.36071 13.9862 0.5 21.1628 0.5 29.1575C0.5 37.1522 5.36071 44.3288 13.0934 49.4839C20.8295 54.6413 31.4881 57.815 43.2363 57.815Z"}" fill="${"#912338"}" stroke="${"white"}"></path><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M63.1448 16.8022H69.1107C71.2613 16.8022 75.5623 18.311 74.5564 22.2338L67.862 41.5464H60.6127L63.2488 33.9019H59.3987L56.381 41.5464H49.4438L57.7337 19.7192C58.7743 17.3051 62.1735 16.8022 63.1448 16.8022ZM65.5034 27.5984H61.8267L63.2488 23.7426C64.1853 21.8315 67.4805 22.6027 66.9602 23.7426L65.5034 27.5984Z"}" fill="${"white"}"></path><path d="${"M52.9817 23.2062L55.4445 16.7686L41.2926 16.8357C39.0727 16.8357 38.2055 17.1375 37.4077 18.9815L30.8868 35.8465C29.6728 39.6688 31.5458 41.58 33.8004 41.58H46.2527L51.5596 27.8332H44.1368L42.125 32.896H44.6224C44.9346 32.896 45.0387 33.1307 44.9693 33.2984L44.1021 35.3436C43.9287 35.6454 43.8246 35.746 43.4778 35.746H40.0092C39.5929 35.746 38.8299 35.2766 39.1767 34.1701L42.9922 24.2456C43.1656 23.7426 43.9287 23.2732 44.7958 23.2732L52.9817 23.2062Z"}" fill="${"white"}"></path><path d="${"M32.5867 23.1726L35.0494 16.7351L20.8975 16.8022C18.6776 16.8022 17.8105 17.1039 17.0127 18.948L10.4917 35.813C9.27773 39.6353 11.1508 41.5464 13.4054 41.5464H25.8576L28.1784 35.2095H19.1976C18.7467 35.2095 18.2264 34.8407 18.4132 34.3377L22.5971 24.212C22.7706 23.7091 23.5337 23.2397 24.4008 23.2397L32.5867 23.1726Z"}" fill="${"white"}"></path></svg></a>
		<div class="${"nav"}"><a href="${"/signup"}"><p>Sign Up</p></a>
			<a href="${"/login"}"><p>Login</p></a>
			<a href="${"/aisles"}"><p>Aisles</p></a>
			<a href="${"/cart"}"><svg class="${"cart-icon"}" viewBox="${"0 0 39 28"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M20.3624 15.4C21.412 15.4 22.3357 14.826 22.8115 13.958L27.8217 4.872C28.3395 3.948 27.6677 2.8 26.6041 2.8H5.89181L4.5763 0H0V2.8H2.79896L7.83709 13.426L5.94779 16.842C4.92617 18.718 6.26967 21 8.39688 21H25.1906V18.2H8.39688L9.93631 15.4H20.3624ZM7.22132 5.6H24.225L20.3624 12.6H10.5381L7.22132 5.6ZM8.39688 22.4C6.85745 22.4 5.61192 23.66 5.61192 25.2C5.61192 26.74 6.85745 28 8.39688 28C9.93631 28 11.1958 26.74 11.1958 25.2C11.1958 23.66 9.93631 22.4 8.39688 22.4ZM22.3917 22.4C20.8523 22.4 19.6067 23.66 19.6067 25.2C19.6067 26.74 20.8523 28 22.3917 28C23.9311 28 25.1906 26.74 25.1906 25.2C25.1906 23.66 23.9311 22.4 22.3917 22.4Z"}" fill="${"white"}"></path><circle cx="${"30"}" cy="${"16"}" r="${"8.5"}" fill="${"#912338"}" stroke="${"white"}"></circle><text x="${"27"}" y="${"21"}" fill="${"white"}" style="${"font-size: 0.7rem;"}">1</text></svg></a></div></div>
</div>`;
});
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="${"footer"}"><a href="${"/backstore/products/"}">This is an incredibly underdesigned footer which links to the backstore</a>
</div>`;
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
var productList = [
  {
    name: "Strawberries",
    description: "Organic strawberries, 0.5kg",
    origin: "Ontario",
    price: 4.49,
    rebate: 0,
    quantity: 100,
    image: "strawberries.jpg",
    aisle: "Fruits"
  },
  {
    name: "Blueberries",
    description: "Organic blueberries, 0.5kg",
    origin: "Quebec",
    price: 3.49,
    rebate: 0,
    quantity: 100,
    image: "blueberries.jpg",
    aisle: "Fruits"
  },
  {
    name: "Raspberries",
    description: "Organic raspberries, 0.5kg",
    origin: "Quebec",
    price: 5.99,
    rebate: 1,
    image: "raspberries.jpg",
    quantity: 100,
    aisle: "Fruits"
  },
  {
    name: "Watermelon",
    description: "Organic watermelon, 1 unit",
    origin: "Ontario",
    price: 6.49,
    rebate: 0,
    quantity: 100,
    image: "watermelon.jpg",
    aisle: "Fruits"
  },
  {
    name: "Cucumber",
    description: "Organic cucumber, 1 unit",
    origin: "Quebec",
    price: 1.49,
    rebate: 0,
    quantity: 100,
    image: "cucumber.jpg",
    aisle: "Vegetables"
  },
  {
    name: "Tomato",
    description: "Organic tomato, 1 unit",
    origin: "Quebec",
    price: 2.49,
    rebate: 0,
    quantity: 100,
    image: "tomato.jpg",
    aisle: "Vegetables"
  },
  {
    name: "Peas",
    description: "Bag of peas, 1kg",
    origin: "Quebec",
    price: 3.49,
    rebate: 0,
    quantity: 100,
    image: "peas.jpg",
    aisle: "Vegetables"
  },
  {
    name: "Steak",
    description: "Uncooked, fresh cut steak. 2kg ",
    origin: "Quebec",
    price: 7.99,
    rebate: 0,
    quantity: 100,
    image: "steak.jpg",
    aisle: "Meat"
  },
  {
    name: "Salami",
    description: "A very very long salami. 10kg ",
    origin: "Quebec",
    price: 31.99,
    rebate: 0,
    quantity: 5,
    image: "salami.jpg",
    aisle: "Meat"
  },
  {
    name: "Milk",
    description: "Milky milky 2% milk. 2L",
    origin: "Quebec",
    price: 3.99,
    rebate: 0,
    quantity: 100,
    image: "milk.jpg",
    aisle: "Dairy"
  }
];
var productList$1 = {
  productList
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let products = productList$1.productList.slice(0, 3);
  let aisles = [
    {
      name: "Fruits",
      image: "strawberries.jpg"
    },
    {
      name: "Vegetables",
      image: "cucumber.jpg"
    },
    { name: "Meat", image: "steak.jpg" },
    { name: "Dairy", image: "milk.jpg" }
  ];
  return `<div class="${"home-wrapper"}"><div class="${"banner"}"><h1>Today\u2019s Featured Products</h1>
		<div class="${"products"}">${each(products, (product) => `${validate_component(Productcard, "ProductCard").$$render($$result, { product }, {}, {})}`)}</div></div>
	<div class="${"aisles-wrapper"}"><h1>Aisles</h1>
		<div class="${"aisles"}">${each(aisles, (aisle) => `<a${add_attribute("href", "/aisles/" + aisle.name, 0)}><img${add_attribute("src", aisle.image, 0)}${add_attribute("alt", aisle.name, 0)}>
					<h2>${escape2(aisle.name)}</h2>
				</a>`)}</div></div>
</div>`;
});
var index$5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Super Secret Backstore</h1>
<div class="${"backstore-nav-wrapper"}"><div class="${"nav"}"><a href="${"/backstore/products/"}">Product List</a>
    <a href="${"/backstore/users/"}">User List</a>
    <a class="${"orders"}" href="${"/backstore/orders/"}">Order List</a></div></div>

<div class="${"grey-bg"}">${slots.default ? slots.default({}) : ``}</div>`;
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
  let aisles = [
    {
      name: "Fruits",
      image: "strawberries.jpg"
    },
    {
      name: "Vegetables",
      image: "cucumber.jpg"
    },
    { name: "Meat", image: "steak.jpg" },
    { name: "Dairy", image: "milk.jpg" }
  ];
  return `<h1>Aisles</h1>
<div class="${"aisles-wrapper"}"><div class="${"aisles"}">${each(aisles, (aisle) => `<a${add_attribute("href", "/aisles/" + aisle.name, 0)}><img${add_attribute("src", aisle.image, 0)}${add_attribute("alt", aisle.name, 0)}>
        <h2>${escape2(aisle.name)}</h2>
      </a>`)}</div></div>`;
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
var Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>User Sign Up</h1>
<div class="${"form-wrapper"}"><form action="${""}"><label for="${"fname"}">First Name:</label>
		<input type="${"text"}" name="${"fname"}" id="${"fname"}">
		<label for="${"email"}">Email*:</label>
		<input type="${"text"}" name="${"email"}" id="${"email"}" required>
		<label for="${"password"}">Password*:</label>
		<input type="${"password"}" name="${"password"}" id="${"password"}" required>
		<label for="${"password2"}">Confirm Password*:</label>
		<input type="${"password"}" name="${"password2"}" id="${"password2 required"}">
		<button>Submit</button></form>
</div>`;
});
var signup = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signup
});
var Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>User Login</h1>
<div class="${"form-wrapper"}"><form action="${""}"><label for="${"email"}">Email*:</label>
		<input type="${"text"}" name="${"email"}" id="${"email"}" required>
		<label for="${"password"}">Password*:</label>
		<input type="${"password"}" name="${"password"}" id="${"password"}" required>
		<div class="${"buttons"}"><button>Submit</button>
			<button>Forget Password</button></div></form></div>`;
});
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Login
});
var subscriber_queue2 = [];
function writable2(value, start = noop2) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal2(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue2.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop2;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
var cart$1 = writable2([
  {
    "name": "Strawberries",
    "description": "Organic strawberries, 0.5kg",
    "origin": "Ontario",
    "price": 4.49,
    "rebate": 0,
    "quantity": 100,
    "image": "strawberries.jpg",
    "aisle": "Fruits",
    "amount": 1
  },
  {
    "name": "Blueberries",
    "description": "Organic blueberries, 0.5kg",
    "origin": "Ontario",
    "price": 4.49,
    "rebate": 1,
    "quantity": 100,
    "image": "blueberries.jpg",
    "aisle": "Fruits",
    "amount": 1
  }
]);
var Cart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $cart, $$unsubscribe_cart;
  $$unsubscribe_cart = subscribe(cart$1, (value) => $cart = value);
  let sum = 0;
  {
    {
      sum = 0;
      Object.values($cart).map((item) => {
        sum = sum + item.price;
      });
    }
  }
  $$unsubscribe_cart();
  return `<div class="${"cart-wrapper"}"><h1>Shopping Cart (${escape2($cart.length)})</h1>
	<div class="${"cart"}"><div class="${"items"}">${each($cart, (product) => `<div class="${"item"}"><img${add_attribute("src", "/" + product.image, 0)}${add_attribute("alt", product.name, 0)}>
					<div class="${"text"}"><p class="${"name"}">${escape2(product.name + " (" + product.amount + ")")}</p>
						${product.rebate != 0 ? `<p class="${"price"}">${escape2("$" + (product.price - product.rebate))}</p>` : `<p class="${"price"}">${escape2("$" + product.price)}</p>`}
						<div class="${"buttons"}"><span>+</span>
							<span>-</span>
							<svg viewBox="${"0 0 24 24"}" fill="${"var(--dark-text)"}"><path d="${"M0 0h24v24H0V0z"}" fill="${"none"}"></path><path d="${"M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"}"></path></svg>
						</div></div>
				</div>`)}</div>
		<div class="${"summary"}"><p><i>${escape2($cart.length)} Items - $${escape2(sum.toFixed(2))}</i></p>
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
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
