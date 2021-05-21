const { db, bcrypt } = require("../../middleware/import_modules");

exports.change_password = (req, res) => {
  const { id, password, new_password } = req.body;

  db.select("id", "password")
    .from("users")
    .where({
      id,
    })
    .then((user) => {
      const is_valid = bcrypt.compareSync(password, user[0].password);
      if (is_valid) {
        // console.log(user);
        // console.log(new_password);

        function send_res() {
          res.status(200).json({
            message: "Password is valid",
            status: 200,
            data: user,
          });
        }

        send_res();

        if (send_res >= 1)
          bcrypt.hash(new_password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                status: 500,
                error: err,
              });
            } else {
              const validat_passwords = bcrypt.compareSync(
                hash,
                user[0].password
              );

              if (validat_passwords) {
                console.log("old password: ", user[0].password);
                console.log("new password: ", hash);
              } else {
                console.log("hey");
                db.select("password")
                  .from("users")
                  .where({ password: user[0].password })
                  .update({
                    password: hash,
                  })
                  .then((data) => {
                    console.log(data);
                    //   return res.send(data)
                    return res.status(200).json({
                      message: "Password successfuly updated",
                      data,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    //   return res.send(err)
                    return res.status(400).json({
                      message: "Error updating password",
                      error: err,
                    });
                  });
              }
            }
          });
      } else {
        console.log("password does not match");
        return res.status(400).json({
          status: 400,
          message: "Password does not match",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        message: "Password does not match",
        error: err,
      });
    });
};
