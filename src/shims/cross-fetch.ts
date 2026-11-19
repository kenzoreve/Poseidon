const nativeFetch: typeof globalThis.fetch = (...args) => globalThis.fetch(...args);
const NativeHeaders = globalThis.Headers;
const NativeRequest = globalThis.Request;
const NativeResponse = globalThis.Response;

export default nativeFetch;
export {
  nativeFetch as fetch,
  NativeHeaders as Headers,
  NativeRequest as Request,
  NativeResponse as Response,
};
