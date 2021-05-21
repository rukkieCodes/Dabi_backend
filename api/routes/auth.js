const { router } = require("../middleware/import_modules")

const signup_controller = require("../controllers/auth/signup")
const user_profile_controller = require("../controllers/auth/user_profile")
const login_controller = require("../controllers/auth/login")
const google_auth_controller = require("../controllers/auth/google_auth")
const update_profile_controller = require("../controllers/auth/update_profile")
const change_password_controler = require("../controllers/auth/change_password")

router.post('/signup', signup_controller.signup)

router.post('/login', login_controller.login)

router.post('/google_auth', google_auth_controller.google_auth)

router.post('/update_profile', update_profile_controller.update_profile)

router.post('/user_profile', user_profile_controller.user_profile)

router.post('/user_profile', user_profile_controller.user_profile)

router.post('/change_password', change_password_controler.change_password)

module.exports = router;