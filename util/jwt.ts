export function decodeJwt(jwt) {
  const base64WithUrlSafe = jwt.split(".")[1];
  const base64 = base64WithUrlSafe.replace(/-/g, "+").replace(/_/g, "/");
  const jsonStr = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );
  const payload = JSON.parse(jsonStr);
  return payload;
}

/**
 * Doesn't produce a valid (signed) JWT. But, we're not checking the signature here anyway.
 * We're just hacking around this to change the `exp` field to force a token refresh.
 *
 * @param jwt The JWT to create an updated version of.
 * @param newPayload The payload to drop in its place.
 * @returns {string} Updated JWT
 */
export function updateJwt(jwt: string, updates: object): string {
  const newPayload = decodeJwt(jwt);
  for (const [k, v] of Object.entries(updates)) {
    newPayload[k] = v;
  }
  const payloadJSON = JSON.stringify(newPayload);
  const payloadBase64 = btoa(payloadJSON);
  const payloadUrlSafeBaseBase64 = payloadBase64
    .replace(/\+/g, "-")
    .replace(/\\/g, "_");
  const jwtParts = jwt.split(".");
  jwtParts[1] = payloadUrlSafeBaseBase64;
  return jwtParts.join(".");
}
