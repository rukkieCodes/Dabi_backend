const {
    db,
    bcrypt
} = require("../../middleware/import_modules")

exports.google_auth = (req, res) => {
    //varss
    const {
        displayName,
        email,
        phoneNumber,
        photoURL,
        providerId,
        uid
    } = req.body

    db.select("*").from("users").where({
        email
    }).then(user => {
        if (user.length) {
            for (let i = 0; i < user.length; i++) {
                if (user[i].email == `${email}`) {
                    db.select("*").from("users").where({
                            email
                        })
                        .then(data => {
                            if (data.length) {
                                db.select("*").from("users").where({
                                    email
                                }).update({
                                    name: displayName,
                                    email,
                                    display_name: displayName,
                                    social_email: email,
                                    phone_number: phoneNumber,
                                    photo_url: photoURL,
                                    provider_id: providerId,
                                    uid
                                }).then(data => {
                                    db.select("*").from("users").where({
                                            email
                                        })
                                        .then(user => {
                                            console.log(user)
                                            return res.status(200).json({
                                                message: "Profile fetched",
                                                data: {
                                                    status: 200,
                                                    data: user
                                                }
                                            })
                                        }).catch(err => {
                                            return res.status(400).json({
                                                status: 400,
                                                message: 'Error fetching profile',
                                                error: err
                                            })
                                        })
                                }).catch(err => {
                                    console.log(err)
                                    return res.status(400).json({
                                        status: 400,
                                        message: 'Error updating profile',
                                        error: err
                                    })
                                })
                            } else {
                                console.log("nothing to update")
                                return res.status(400).json({
                                    status: 400,
                                    message: 'nothing to update',
                                })
                            }
                        })
                        .catch(err => {
                            return res.status(400).json({
                                status: 400,
                                message: 'Error updating profile',
                                error: err
                            })
                        })
                }
            }
        } else {
            console.log("you need to try again")
            const {
                email,
                password,
                displayName,
                phoneNumber,
                photoURL,
                providerId,
                uid
            } = req.body;

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        error: err,
                    });
                } else {
                    db.insert({
                            email,
                            name: displayName,
                            password: hash,
                            joined: new Date(),
                            display_name: displayName,
                            social_email: email,
                            phone_number: phoneNumber,
                            photo_url: photoURL,
                            provider_id: providerId,
                            uid
                        })
                        .into('users')
                        .then((data) => {
                            console.log('DATA: ', data);
                            return res.status(201).json({
                                data: {
                                    message: 'User created',
                                    status: 201,
                                    data: {
                                        id: data[0],
                                        email,
                                        displayName
                                    }
                                },
                            });
                        })
                        .catch((err) => {
                            return res.status(500).json({
                                status: 500,
                                message: 'User already exist. Check your email then try again',
                                error: err
                            })
                        });
                }
            });
        }
    }).catch(err => {
        console.log(err)
        res.send(err)
    })
}