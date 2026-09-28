const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const DEFAULT_DB_PATH = path.join(__dirname, '../../database/db.json');
const DB_FILE_PATH = isVercel ? path.join('/tmp', 'db.json') : DEFAULT_DB_PATH;
let useMock = true;

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionhub';

let dbCache = null;
let dbCacheStamp = '';

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) return null;
    const stat = fs.statSync(DB_FILE_PATH);
    const stamp = `${stat.mtimeMs}:${stat.size}`;
    if (dbCache && dbCacheStamp === stamp) return dbCache;
    dbCache = JSON.parse(fs.readFileSync(DB_FILE_PATH, 'utf-8'));
    dbCacheStamp = stamp;
    return dbCache;
  } catch (err) {
    console.error('Error reading mock database file:', err);
    return null;
  }
}

function invalidateDbCache() {
  dbCache = null;
  dbCacheStamp = '';
}

function connectDB() {
  // If running on Vercel and using mock DB, ensure /tmp/db.json is initialized from DEFAULT_DB_PATH
  if (isVercel && !fs.existsSync(DB_FILE_PATH)) {
    try {
      if (fs.existsSync(DEFAULT_DB_PATH)) {
        fs.copyFileSync(DEFAULT_DB_PATH, DB_FILE_PATH);
      } else {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ users: [], products: [], orders: [], carts: [], reviews: [] }, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('[DB] Failed to seed /tmp/db.json on Vercel:', e);
    }
  }

  if (process.env.USE_MOCK_DB === 'true') {
    console.log('[DB] Using local JSON File Database (forced by USE_MOCK_DB env)');
    useMock = true;
    return;
  }
  
  console.log('[DB] Attempting connection to MongoDB...');
  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 2000 // fail fast if not running
  })
  .then(() => {
    console.log('[DB] Successfully connected to MongoDB.');
    useMock = false;
  })
  .catch((err) => {
    console.log('[DB] MongoDB connection failed. Falling back to JSON File Database.');
    useMock = true;
    
    // Ensure mock DB file exists
    if (!fs.existsSync(DB_FILE_PATH)) {
      const parentDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ users: [], products: [], orders: [], carts: [], reviews: [] }, null, 2), 'utf-8');
    }
  });
}


// Mock Model Class to replicate Mongoose query patterns
class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  _read() {
    const data = readDb();
    return data ? (data[this.collectionName] || []) : [];
  }

  _write(dataList) {
    try {
      const data = readDb() || {};
      data[this.collectionName] = dataList;
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
      invalidateDbCache();
    } catch (err) {
      console.error(`Error writing mock collection ${this.collectionName}:`, err);
    }
  }

  _match(item, filter = {}) {
    for (let key in filter) {
      let val = filter[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || 'i');
          if (!regex.test(item[key])) return false;
        } else if (val.$in) {
          if (!val.$in.includes(item[key])) return false;
        } else if (val.$gte !== undefined || val.$lte !== undefined) {
          const num = Number(item[key]);
          if (val.$gte !== undefined && num < Number(val.$gte)) return false;
          if (val.$lte !== undefined && num > Number(val.$lte)) return false;
        }
      } else {
        // Direct value match (handling both id and _id normalized check)
        const itemVal = (key === '_id' || key === 'id') ? (item.id || item._id) : item[key];
        const filterVal = (key === '_id' || key === 'id') ? val : val;
        if (itemVal !== filterVal) return false;
      }
    }
    return true;
  }

  async find(filter = {}) {
    const list = this._read();
    return list.filter(item => this._match(item, filter));
  }

  async findOne(filter = {}) {
    const list = this._read();
    return list.find(item => this._match(item, filter)) || null;
  }

  async findById(id) {
    const list = this._read();
    return list.find(item => item.id === id || item._id === id) || null;
  }

  async create(data) {
    const list = this._read();
    const idVal = `${this.collectionName.substring(0,3)}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const newItem = {
      id: idVal,
      _id: idVal,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newItem);
    this._write(list);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const list = this._read();
    const idx = list.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return null;
    
    let updatedItem = { ...list[idx], updatedAt: new Date().toISOString() };
    if (updateData.$set) {
      updatedItem = { ...updatedItem, ...updateData.$set };
    } else if (updateData.$push) {
      for (let key in updateData.$push) {
        if (!Array.isArray(updatedItem[key])) {
          updatedItem[key] = [];
        }
        updatedItem[key].push(updateData.$push[key]);
      }
    } else {
      updatedItem = { ...updatedItem, ...updateData };
    }
    
    list[idx] = updatedItem;
    this._write(list);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    const list = this._read();
    const idx = list.findIndex(item => item.id === id || item._id === id);
    if (idx === -1) return null;
    const deleted = list.splice(idx, 1)[0];
    this._write(list);
    return deleted;
  }

  async deleteOne(filter = {}) {
    const list = this._read();
    const idx = list.findIndex(item => this._match(item, filter));
    if (idx === -1) return { deletedCount: 0 };
    list.splice(idx, 1);
    this._write(list);
    return { deletedCount: 1 };
  }

  async deleteMany(filter = {}) {
    const list = this._read();
    const beforeCount = list.length;
    const newList = list.filter(item => !this._match(item, filter));
    this._write(newList);
    return { deletedCount: beforeCount - newList.length };
  }

  async updateOne(filter = {}, updateData = {}) {
    const list = this._read();
    const idx = list.findIndex(item => this._match(item, filter));
    if (idx === -1) return { nModified: 0 };
    
    let updatedItem = { ...list[idx], updatedAt: new Date().toISOString() };
    if (updateData.$set) {
      updatedItem = { ...updatedItem, ...updateData.$set };
    } else {
      updatedItem = { ...updatedItem, ...updateData };
    }
    list[idx] = updatedItem;
    this._write(list);
    return { nModified: 1 };
  }

  async countDocuments(filter = {}) {
    const list = this._read();
    return list.filter(item => this._match(item, filter)).length;
  }
}

function getModel(modelName, mongooseSchema, collectionName) {
  return {
    find: (filter) => useMock ? new MockModel(collectionName).find(filter) : mongoose.model(modelName).find(filter),
    findOne: (filter) => useMock ? new MockModel(collectionName).findOne(filter) : mongoose.model(modelName).findOne(filter),
    findById: (id) => useMock ? new MockModel(collectionName).findById(id) : mongoose.model(modelName).findById(id),
    create: (data) => useMock ? new MockModel(collectionName).create(data) : mongoose.model(modelName).create(data),
    findByIdAndUpdate: (id, update, opts) => useMock ? new MockModel(collectionName).findByIdAndUpdate(id, update, opts) : mongoose.model(modelName).findByIdAndUpdate(id, update, opts),
    findByIdAndDelete: (id) => useMock ? new MockModel(collectionName).findByIdAndDelete(id) : mongoose.model(modelName).findByIdAndDelete(id),
    deleteOne: (filter) => useMock ? new MockModel(collectionName).deleteOne(filter) : mongoose.model(modelName).deleteOne(filter),
    deleteMany: (filter) => useMock ? new MockModel(collectionName).deleteMany(filter) : mongoose.model(modelName).deleteMany(filter),
    updateOne: (filter, update) => useMock ? new MockModel(collectionName).updateOne(filter, update) : mongoose.model(modelName).updateOne(filter, update),
    countDocuments: (filter) => useMock ? new MockModel(collectionName).countDocuments(filter) : mongoose.model(modelName).countDocuments(filter)
  };
}

module.exports = {
  connectDB,
  getModel,
  isMock: () => useMock
};
