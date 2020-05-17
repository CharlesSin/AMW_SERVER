import Joi from "@hapi/joi";
import moment from "moment";
const since = moment().format("YYYY-MM-DD");
const maxDate = moment().add(150, 'days').calendar();

const schemas = {
    loginSchema: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^[\w]{6,30}$/).required()
    }),
    signUpSchema: Joi.object().keys({
        email: Joi.string().email().required(),
        name: Joi.string().min(2).max(20).required(),
        password: Joi.string().regex(/^[\w]{6,30}$/).required()
    }),
    basicInfoSchema: Joi.object().keys({
        token: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/).required(),
        projectid: Joi.string().min(2).max(100).required(),
        startDate: Joi.date().optional().min(`${since}`).required(),
        endDate: Joi.date().optional().max(`${maxDate}`).required(),
        eventAuthor: Joi.string().min(2).max(20).required(),
        eventLocation: Joi.string().min(2).max(200).required(),
        eventName: Joi.string().min(2).max(100).required(),
        event_deatils: Joi.string().max(1000).required(),
    })
};

export default schemas;