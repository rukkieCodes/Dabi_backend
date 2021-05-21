const { db, bcrypt, jwt } = require("../../middleware/import_modules")

exports.signup = (req, res) => {
    const {
        email,
        name,
        password
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
                    name,
                    password: hash,
                    joined: new Date()
                })
                .into('users')
                .then((data) => {
                    console.log('DATA: ', data);
                    res.status(201).json({
                        data: {
                            message: 'User created',
                            status: 201,
                            data: {
                                id: data[0],
                                email,
                                name
                            }
                        },
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        status: 500,
                        message: 'User already exist. Check your email then try again',
                        error: err
                    })
                });
        }
    });
}