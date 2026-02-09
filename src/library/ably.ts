import Ably from "ably";
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const ABLY_API_KEY = process.env.ABLY_API_KEY;

// Instantiate the Ably Rest client with your full API key on the server
const ably = new Ably.Rest({ key: ABLY_API_KEY });

// Function to create a TokenRequest
export async function createAblyTokenRequest(clientId:string) {
  try {
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: clientId || 'some-unique-client-id', // Use a specific client ID if known
      // Add other options like capabilities, timestamp, etc. if needed
    });
    console.log("Token Request created:", tokenRequest);
    return tokenRequest;
  } catch (error) {
    console.error("Error creating Ably Token Request:", error);
    throw error;
  }
}