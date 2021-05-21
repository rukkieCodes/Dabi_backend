const { db, bcrypt, jwt } = require("../../middleware/import_modules")

exports.login = (req, res) => {
    const {
        email,
        password
    } = req.body;
    db.select('email', 'password')
        .from('users')
        .where({
            email
        })
        .then((data) => {
            const is_valid = bcrypt.compareSync(password, data[0].password);
            if (is_valid) {
                const token = jwt.sign({
                        email: data[0].email,
                        userId: data[0].id,
                    },
                    'secret', {
                        expiresIn: '1h',
                    }
                );
                return db
                    .select('*')
                    .from('users')
                    .where({
                        email
                    })
                    .then((user) => {
                        console.log(user);
                        res.status(200).json({
                            message: 'loged in successfuly',
                            data: {
                                status: 200,
                                token,
                                data: user[0],
                            },
                        });
                    })
                    .catch((err) => {
                        res.status(400).json({
                            status: 400,
                            message: 'Unable to get user',
                            error: err,
                        });
                    });
            } else {
                res.status(400).json({
                    status: 400,
                    message: 'Wrong credentials',
                });
            }
        })
        .catch((err) => {
            res.status(400).json({
                status: 400,
                message: 'Wrong credentials. Review your input then try again.',
                error: err,
            });
        });
}