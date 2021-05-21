const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../middleware/connection');
const {
    google
} = require('googleapis')

router.post('/send_mail', (req, res) => {
    const {
        id,
        from,
        to,
        subject,
        text,
        html
    } = req.body;

    // const gmail = [];
    // const gmail_result = to.filter(email => email.match(/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/g));
    // gmail.push(...gmail_result);

    // if (gmail[0].match(/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/g)) {
    // }
    const CLIENT_ID = process.env.CLIENT_ID
    const CLIENT_SECRET = process.env.CLIENT_SECRET
    const REDIRECT_URL = process.env.GMAIL_REDIRECT_URL
    const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN

    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

    oAuth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
    })

    async function sendMail() {

        try {
            const access_token = await oAuth2Client.getAccessToken()

            const transport = nodemailer.createTransport({
                service: `${process.env.SERVICE}`,
                auth: {
                    type: process.env.AUTH,
                    user: process.env.APP_EMAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: access_token
                }
            })

            const mail_options = {
                from,
                to,
                subject,
                text,
                html
            };

            const result = await transport.sendMail(mail_options)
            return result
        } catch (error) {
            return error
        }
    }

    sendMail().then(result => {
        console.log('Email sent...', result)
        res.status(250).json({
            message: "Your email has been sent",
            status: 250,
            data: result
        });

        db.insert({
                _id: id,
                sent_to: result.envelope.to,
                sent_from: result.envelope.from,
                subject,
                text,
                html,
                message_id: result.messageId,
                sent_on: new Date()
            }).into('sent_templates')
            .then(data => {
                console.log("SAVED DATA....", data)
            }).catch(error => {
                console.log("ERROR SAVEING DATA.....", error)
            })
    }).catch(err => {
        console.log('Error sending mail...', err);
        res.status(500).json({
            message: "Error sending mail...",
            status: 500,
            err: result
        })
    })
})

module.exports = router;