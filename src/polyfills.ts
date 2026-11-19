if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as Record<string, unknown>).Buffer = {
    from(input: string | Uint8Array | ArrayLike<number>) {
      const bytes =
        typeof input === 'string'
          ? new TextEncoder().encode(input)
          : input instanceof Uint8Array
            ? input
            : new Uint8Array(input);
      return Object.assign(bytes, {
        toString(encoding?: string) {
          if (encoding === 'base64') {
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
          }
          return new TextDecoder().decode(bytes);
        },
      });
    },
    isBuffer(obj: unknown) {
      return obj instanceof Uint8Array;
    },
  };
}
