/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly TRIPCOM_ALLIANCE_ID?: string;
  readonly TRIPCOM_SID?: string;
  readonly AGODA_CID?: string;
  readonly KLOOK_AID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
