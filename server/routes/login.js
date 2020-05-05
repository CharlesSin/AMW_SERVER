import express from 'express';
import jwt from 'jsonwebtoken';
import findUser from '../utils/findUser';

const router = express.Router();

router.post("/login", (req, res, next) => {
    var users = findUser(req.body.name, req.body.password);

    if (users) {
        jwt.sign({ users }, "secretkey", { expiresIn: "60m" }, (err, token) => {
            res.status(200).json({
                msg: "Login Successfully",
                token
            });
        });
    }
    else {
        res.status(403).json({ error: "Forbidden" })
    }
});

export default router;