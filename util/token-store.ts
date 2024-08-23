import { KeyValueStorageInterface } from "aws-amplify/utils";
import { decodeJwt, updateJwt } from "./jwt";

/**
 * Using our own token storage mechanism so we can tamper with the data
 * and monitor interactions.
 */
export class TokenStorage implements KeyValueStorageInterface {
  storageObject: Record<string, string> = {};

  async setItem(key: string, value: string): Promise<void> {
    if (key.endsWith(".idToken") || key.endsWith(".accessToken"))
      console.log("setting", key);
    this.storageObject[key] = value;
  }

  async getItem(key: string): Promise<string | null> {
    if (key.endsWith(".idToken") || key.endsWith(".accessToken"))
      console.log("getting", key);
    return this.storageObject[key];
  }

  async removeItem(key: string): Promise<void> {
    delete this.storageObject[key];
  }

  async clear(): Promise<void> {
    this.storageObject = {};
  }

  /**
   * Finds `idToken` and `accessToken` entries and sets the expiration to **right now**.
   */
  async expireTokens() {
    console.log("expireTokens");
    for (const [key, value] of Object.entries(this.storageObject)) {
      // console.log("expireTokens checking key", key);
      if (key.endsWith(".idToken") || key.endsWith(".accessToken")) {
        console.log("expireTokens expiring key", key);
        const edited = updateJwt(value, {
          exp: Math.floor(Date.now() / 1000) - 1,
          // exp: 1234,
        });
        await this.setItem(key, edited);
      }
    }
  }
}
