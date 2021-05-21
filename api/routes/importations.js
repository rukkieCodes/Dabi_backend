const express = require("express");
const router = express.Router();
const db = require("../middleware/connection");
const CSVToJSON = require("csvtojson");
const excelToJson = require("convert-excel-to-json");
const multer = require("multer");

//MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//STORAGE INITALIZATION
const upload = multer({
  storage,
});

let extracted_email = []; //store extracted emails

const email_expression =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**#########################################################################
 * #########################################################################
 * ######################EXTRACT EMAIL FROM CSV ENDPOINT####################
 * #########################################################################
 * ######################################################################**/
router.post("/csv", upload.single("organisation_csv"), (req, res) => {
  const { id } = req.body;

  //READ CSV FILE AS JSON
  CSVToJSON()
    .fromFile(`uploads/${req.file.originalname}`)
    .then((data) => {
      //MAP THROUGH CSV JSON
      data.map((obj) => {
        //LOOP THROUGH ALL OBJECT KEYS
        Object.keys(obj).forEach((key) => {
          //CHECK IF EMAIL KEYS MATCH EMAIL REGULAR EXPRESION
          if (obj[key].match(email_expression)) {
            //PUSH EXTRACTED EMAIL TO ARRAY
            extracted_email.push(obj[key].match(email_expression).input);
          }
        });
      });

      //PUSH EMAIL WITH OUR REPEATING
      const unique_email = [...new Set(extracted_email)];

      //SELECT ALL DATA FROM organisation_data TABLE
      db.select("*")
        .from("organisation_data")
        .where({
          id,
        })
        .then((data) => {
          //CHECK IF SELECTED DATA EXSISTS THEN UPDATE ALREADY EXSISTING DATA
          if (data.length) {
            const old_email = []; //store initial data from server

            old_email.push(...data); //push splited server data to array

            const initial_email = []; //store initial email from server

            const unique_old_email = [...new Set(old_email)]; //filter out already exsiting data from already stored data

            //LOOP THROUGH FILTERD DATA ARRAY
            for (let i = 0; i < unique_old_email.length; i++) {
              initial_email.push(...unique_old_email[i].emails); //push initial email to filterd email data for refiltering
            }

            const unique_initial_email = [...new Set(initial_email)]; //filter out already exsisting email from email array

            const final_result = unique_initial_email.concat(unique_email); //merge filterd inital email array with filterd array from read CSV file

            const unique_final_result = [...new Set(final_result)]; //filter out repeated email from merged arrays just to be safe

            console.log(unique_final_result);

            //NOW UPDATE organisation_data WITH FINAL FILTED ARRAY
            db.select("*")
              .from("organisation_data")
              .where({
                id,
              })
              .update({
                emails: unique_final_result,
              })
              .then((data) => {
                db.select("*")
                  .from("organisation_data")
                  .where({
                    id,
                  })
                  .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                      console.log("data: ", data[i].emails.length);
                    }
                  });
                return data;
              })
              .catch((err) => {
                console.log("Error saving email: ", err);
              });
          } else {
            //IF DATA DOES NOT EXSIT THE WRITE IT TO THE TABLE
            db.insert({
              id,
              emails: unique_email,
            })
              .into("organisation_data")
              .then((data) => {
                console.log("SAVED DATA....", data);
              })
              .catch((error) => {
                console.log("ERROR SAVEING DATA.....", error);
              });

            console.log("organisation_data does not exsit: ");
          }
        })
        .catch((err) => {
          console.error("Error saving email: ", err);
        });
      return res.status(200).json({
        message: "email saved",
        data: {
          data: unique_email,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        status: 400,
        message: "Error extracting email",
        error: err,
      });
    });
});

/**#########################################################################
 * #########################################################################
 * ######################EXTRACT EMAIL FROM EXCEL ENDPOINT####################
 * #########################################################################
 * ######################################################################**/
router.post("/excel", upload.single("organisation_excel"), (req, res) => {
  const { id } = req.body;

  const result = excelToJson({
    sourceFile: `uploads/${req.file.originalname}`,
  });
  var test_array = [];
  for (let key in result) {
    result[key].filter((obj) => {
      Object.keys(obj).forEach((key) => {
        test_array.push(obj[key]);
      });
    });
  }
  const found = test_array.filter((value) => email_expression.test(value));
  // console.log(found)
  const unique_email = [...new Set(found)];
  // console.log(unique_email)

  //SELECT ALL DATA FROM organisation_data TABLE
  db.select("*")
    .from("organisation_data")
    .where({
      id,
    })
    .then((data) => {
      //CHECK IF SELECTED DATA EXSISTS THEN UPDATE ALREADY EXSISTING DATA
      if (data.length) {
        const old_email = []; //store initial data from server

        old_email.push(...data); //push splited server data to array

        const initial_email = []; //store initial email from server

        const unique_old_email = [...new Set(old_email)]; //filter out already exsiting data from already stored data

        //LOOP THROUGH FILTERD DATA ARRAY
        for (let i = 0; i < unique_old_email.length; i++) {
          initial_email.push(...unique_old_email[i].emails); //push initial email to filterd email data for refiltering
        }

        const unique_initial_email = [...new Set(initial_email)]; //filter out already exsisting email from email array

        const final_result = unique_initial_email.concat(unique_email); //merge filterd inital email array with filterd array from read CSV file

        const unique_final_result = [...new Set(final_result)]; //filter out repeated email from merged arrays just to be safe

        console.log(unique_final_result);

        //NOW UPDATE organisation_data WITH FINAL FILTED ARRAY
        db.select("*")
          .from("organisation_data")
          .where({
            id,
          })
          .update({
            email: unique_final_result,
          })
          .then((data) => {
            db.select("*")
              .from("organisation_data")
              .where({
                id,
              })
              .then((data) => {
                for (let i = 0; i < data.length; i++) {
                  console.log("data: ", data[i].emails.length);
                }
              });
            return data;
          })
          .catch((err) => {
            console.log("Error saving email: ", err);
          });
      } else {
        //IF DATA DOES NOT EXSIT THE WRITE IT TO THE TABLE
        db.insert({
          id,
          email: unique_email,
        })
          .into("organisation_data")
          .then((data) => {
            console.log("SAVED DATA....", data);
          })
          .catch((error) => {
            console.log("ERROR SAVEING DATA.....", error);
          });

        console.log("organisation_data does not exsit: ");
      }
    })
    .catch((err) => {
      console.error("Error saving email: ", err);
    });
  return res.status(200).json({
    message: "email saved",
    data: {
      data: unique_email,
    },
  });
});

/**#########################################################################
 * #########################################################################
 * ######################UPDATE EMAIL LIST #################################
 * #########################################################################
 * ######################################################################**/
router.post("/edit_email_list", (req, res) => {
  const { id, email } = req.body;
  db.select("*")
    .from("organisation_data")
    .where({
      id,
    })
    .then((data) => {
      if (data.length) {
        db.select("*")
          .from("organisation_data")
          .where({
            id,
          })
          .update({
            email,
          })
          .then((data) => {
            res.status(200).json({
              message: "List updated 😊😊",
              data: {
                status: 200,
                data,
              },
            });
          })
          .catch((err) => {
            res.status(400).json({
              status: 400,
              message: "Error updating list 😭😭",
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        status: 400,
        message: "Error updating list 😭😭",
        error: err,
      });
    });
});

router.post("/get_organisation_email", (req, res) => {
  const { id } = req.body;

  db.select("*")
    .from("organisation_data")
    .where({ id })
    .then((data) => {
      console.log("organisation_email: ", data);
      return res.status(200).json({
          status: 200,
          data
      })
    })
    .catch((err) => {
      console.log("Error fetchngemail: ", err);
      return res.status(500).json({
          status: 500,
          error: err
      })
    });
});

/**#########################################################################
 * #########################################################################
 * ######################DELETE EMAIL LIST #################################
 * #########################################################################
 * ######################################################################**/
router.delete("/delete_email_list", (req, res) => {
  const { id } = req.body;
  db.select("*")
    .from("organisation_data")
    .where({
      id,
    })
    .then((data) => {
      if (data.length) {
        db.delete("*")
          .from("organisation_data")
          .where({
            id,
          })
          .then((data) => {
            console.log(data);
            res.status(200).json({
              message: "Email list deleted",
              data,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json({
              status: 400,
              message: "Error deleting email list",
              error: err,
            });
          });
      } else {
        res.status(200).json({
          message: "Ooops. Nothing to delete here 😋😋",
        });
        console.log("Ooops. Nothing to delete here 😋😋");
      }
    });
});

module.exports = router;
