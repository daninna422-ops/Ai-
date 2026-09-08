require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Karanta Secret Key daga .env file
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Route 1: Duba Sunan Banki (Account Name Resolution)
app.post('/api/resolve-account', async (req, res) => {
    const { accountNumber, bankCode } = req.body;
    try {
        const response = await axios.get(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );
        res.json({ success: true, data: response.data.data });
    } catch (error) {
        res.status(400).json({ success: false, message: "Ba a samu asusun ba." });
    }
});

// Route 2: Kirkiro Transfer Recipient & Tura Kudi (Transfer)
app.post('/api/transfer', async (req, res) => {
    const { accountNumber, bankCode, accountName, amountInNaira } = req.body;
    try {
        // Step A: Yi Recipient Code a Paystack
        const recipientRes = await axios.post(
            'https://api.paystack.co/transferrecipient',
            {
                type: "nuban",
                name: accountName,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: "NGN"
            },
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );

        const recipientCode = recipientRes.data.data.recipient_code;

        // Step B: Tura Kudin
        const transferRes = await axios.post(
            'https://api.paystack.co/transfer',
            {
                source: "balance",
                amount: amountInNaira * 100, // Paystack yana amfani da Kobo
                recipient: recipientCode,
                reason: "Tura kudi daga App"
            },
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );

        res.json({ success: true, data: transferRes.data });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.message || "Tura kudin ba yiyi ba." 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server tana aiki a port ${PORT}`));
