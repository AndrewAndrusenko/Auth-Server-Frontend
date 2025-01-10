import { DBConfig } from "ngx-indexed-db";

export const IndexDBConfig: DBConfig  = {
  name: 'ssngrx',
  version: 1,
  objectStoresMeta: [{
    store: 'auth',
    storeConfig: { keyPath: 'code', autoIncrement: false },
    storeSchema: [
      { name: 'code', keypath: 'code', options: { unique: true } },
      { name: 'data', keypath: 'data', options: { unique: true } },
    ]
  }]
};