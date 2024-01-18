"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
function validateRequest(opts) {
    return async (req, res, next) => {
        var _a, _b, _c, _d, _e, _f;
        if ((_a = opts === null || opts === void 0 ? void 0 : opts.validate) === null || _a === void 0 ? void 0 : _a.body) {
            const parsedBody = await ((_b = opts === null || opts === void 0 ? void 0 : opts.validate.body) === null || _b === void 0 ? void 0 : _b.safeParseAsync(req.body));
            if (!parsedBody.success) {
                return res.send({
                    succeed: false,
                    reason: "BAD_REQUEST",
                });
            }
            req.body = parsedBody.data;
        }
        if ((_c = opts === null || opts === void 0 ? void 0 : opts.validate) === null || _c === void 0 ? void 0 : _c.query) {
            const parsedQuery = await ((_d = opts === null || opts === void 0 ? void 0 : opts.validate.query) === null || _d === void 0 ? void 0 : _d.safeParseAsync(req.query));
            if (!parsedQuery.success) {
                return res.send({
                    succeed: false,
                    reason: "BAD_REQUEST",
                });
            }
            req.query = parsedQuery.data;
        }
        if ((_e = opts === null || opts === void 0 ? void 0 : opts.validate) === null || _e === void 0 ? void 0 : _e.params) {
            const parsedParams = await ((_f = opts === null || opts === void 0 ? void 0 : opts.validate.params) === null || _f === void 0 ? void 0 : _f.safeParseAsync(req.params));
            if (!parsedParams.success) {
                return res.send({
                    succeed: false,
                    reason: "BAD_REQUEST",
                });
            }
            req.params = parsedParams.data;
        }
        next();
    };
}
exports.validateRequest = validateRequest;
