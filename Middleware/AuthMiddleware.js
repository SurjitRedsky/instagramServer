import jwt from "jsonwebtoken";
// const JWTKEY = "fe1a1925a379f3be5394b64d14794933";
const { JWTKEY } = process.env;

// dotenv.config();
// const secret = JWTKEY;
// console.log("secret: ", JWTKEY);
const authMiddleWare = async (req, res, next) => {
	try {
		const token = req.headers.authorization;
		console.log("token", token);

		if (token) {
			return jwt.verify(token, process.env.JWTKEY, function (err, decoded) {
				if (err) {
					return res.json({
						success: false,
						message: "Failed to authenticate token.",
					});
				}
				req.user = decoded;
				return next();
			});
		}
		return res.status(401).json({ success: false, message: "Unauthorized" });
	} catch (error) {
		res.status(500).json(error);
	}
};

export default authMiddleWare;
