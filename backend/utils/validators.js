const Joi = require('joi');
const mongoose = require('mongoose');

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateTransaction = (data) => {
  const schema = Joi.object({
    type: Joi.string().valid('contribution', 'expense', 'repayment').required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    member: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    reference: Joi.string(),
    attachments: Joi.array().items(Joi.string()),
    status: Joi.string().valid('pending', 'completed', 'rejected').default('pending')
  });

  return schema.validate(data);
};

const validateLoan = (data) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    member: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    reference: Joi.string(),
    attachments: Joi.array().items(Joi.string()),
    status: Joi.string().valid('pending', 'active', 'completed', 'rejected').default('pending'),
    balance: Joi.number().positive().required(),
    interestRate: Joi.number().min(0).max(100).required(),
    repaymentSchedule: Joi.array().items(Joi.object({
      date: Joi.date().required(),
      amount: Joi.number().positive().required(),
      status: Joi.string().valid('pending', 'completed').default('pending')
    }))
  });

  return schema.validate(data);
};

module.exports = {
  validateObjectId,
  validateTransaction,
  validateLoan
}; 