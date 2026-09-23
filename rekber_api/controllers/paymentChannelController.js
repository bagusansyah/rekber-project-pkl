const crypto = require('crypto');

// Get payment channels from external API
async function getPaymentChannelsController(req, res) {
  try {
    const API_KEY = "a14934d87baa20d04fa589c31ce8cb066706296e949bad73e12dabab37d7d008";
    const PARTNER_ID = "8b0d8e8d-c3cc-4b3b-9694-29d3c26551b7";

    // Prepare request body
    const requestBody = {
      partner_id: PARTNER_ID
    };

    // Call external API
    const channelResponse = await fetch('https://gateway.ceklaporan.com/api/channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    const channelData = await channelResponse.json();
    
    if (!channelResponse.ok) {
      console.error('Channel API Error:', channelData);
      return res.status(channelResponse.status).json({ 
        error: "Failed to fetch payment channels",
        details: channelData
      });
    }

    return res.status(200).json({
      message: "Payment channels retrieved successfully",
      data: channelData
    });

  } catch (err) {
    console.error('Get Channels Error:', err);
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}

module.exports = {
  getPaymentChannelsController
};