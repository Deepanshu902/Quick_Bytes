// utils/geocoder.js
import NodeGeocoder from 'node-geocoder';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  provider: "google", 
  apiKey: process.env.GEOCODER_API_KEY, // API key if required
};

const geocoder = NodeGeocoder(options);

export default geocoder;