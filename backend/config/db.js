const mongoose = require('mongoose');

let isConnected = false;
let dbConnectionError = null;

/**
 * Mask password and sensitive credentials in MongoDB connection string
 */
const sanitizeURI = (uri = '') => {
  return uri.replace(/\/\/(.*):(.*)@/, '//$1:****@');
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare_db';
  const sanitized = sanitizeURI(uri);
  const isAtlas = uri.includes('mongodb+srv') || uri.includes('.mongodb.net');

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'medicare_db',
      serverSelectionTimeoutMS: isAtlas ? 8000 : 3000,
    });
    isConnected = true;
    dbConnectionError = null;
    console.log(`\n======================================================`);
    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`   Type:     ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB Local'}`);
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port:     ${conn.connection.port || 'Default / SRV'}`);
    console.log(`======================================================\n`);
    return true;
  } catch (error) {
    isConnected = false;
    dbConnectionError = error;
    console.error(`\n======================================================================`);
    console.error(`❌ MONGODB CONNECTION ERROR:`);
    console.error(`   Failed to connect to MongoDB.`);
    console.error(`   Target URI     : ${sanitized}`);
    console.error(`   Error Code     : ${error.code || error.name || 'UNKNOWN'}`);
    console.error(`   Error Message  : ${error.message}`);
    console.error(`----------------------------------------------------------------------`);
    if (isAtlas) {
      console.error(`⚠️ MongoDB Atlas Cloud Connection Failed.`);
      console.error(`   1. Verify your current public IP is added to Atlas Network Access.`);
      console.error(`   2. Verify username (harshini2817_db_user) and password are correct in backend/.env.`);
      console.error(`   3. Verify the Atlas cluster address is correct.`);
    } else {
      console.error(`⚠️ Local MongoDB is UNAVAILABLE.`);
      console.error(`   Connection to local MongoDB daemon was refused.`);
      console.error(`   Please start MongoDB locally or configure a valid MONGODB_URI in backend/.env.`);
    }
    console.error(`======================================================================\n`);
    return false;
  }
};

const getDBStatus = () => isConnected;
const getDBError = () => dbConnectionError;

module.exports = { connectDB, getDBStatus, getDBError, sanitizeURI };

