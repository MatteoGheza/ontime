import { body, param, validationResult } from 'express-validator';

export const eventsPostValidator = [
  body('type').isString().exists().isIn(['event', 'delay', 'block']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  },
];

export const eventsPutValidator = [
  body('id').isString().exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  },
];

export const paramsMustHaveEventId = [
  param('eventId').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  },
];
