const { db } = require("../../middleware/import_modules");

exports.update_profile = (req, res) => {
  const { id, name, email, phone_number } = req.body;

  db.select("*")
    .from("users")
    .where({
      id,
    })
    .then((data) => {
      if (data.length) {
        db.select("*")
          .from("users")
          .where({
            id,
          })
          .update({
            name,
            email,
            phone_number,
          })
          .then((data) => {
            console.log(data);
            db.select("*")
              .from("users")
              .where({ id })
              .then((user) => {
                console.log("User: ", user);
                return res.status(200).json({
                  message: "Profile Updated",
                  data: {
                    status: 200,
                    data: user,
                  },
                });
              })
              .catch((err) => {
                console.log("Error: ", err);
                return res.status(400).json({
                  status: 400,
                  message: "Error fetching profile profile",
                  error: err,
                });
              });
          })
          .catch((err) => {
            console.log(err);
            return res.status(400).json({
              status: 400,
              message: "Error updating profile",
              error: err,
            });
          });
      } else {
        console.log("nothing to update");
        return res.status(400).json({
          status: 400,
          message: "nothing to update",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        status: 400,
        message: "Error updating profile",
        error: err,
      });
    });
};
