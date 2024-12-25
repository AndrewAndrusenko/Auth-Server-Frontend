import { DBConfig } from "ngx-indexed-db";

export const IndexDBConfig: DBConfig  = {
  name: 'ssngrx',
  version: 1,
  objectStoresMeta: [{
    store: 'auth',
    storeConfig: { keyPath: 'userID', autoIncrement: false },
    storeSchema: [
      { name: 'userID', keypath: 'userID', options: { unique: true } },
      { name: 'jwt', keypath: 'jwt', options: { unique: true } },
      { name: 'active', keypath: 'active', options: { unique: true } },
    ]
  }]
};