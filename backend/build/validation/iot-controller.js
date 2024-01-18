"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holdStateDataSchema = exports.signalsDataSchema = exports.phaseValuesObj = void 0;
const zod_1 = require("zod");
exports.phaseValuesObj = zod_1.z.object({
    0: zod_1.z.number(),
    1: zod_1.z.number(),
    2: zod_1.z.number(),
    3: zod_1.z.number(),
});
exports.signalsDataSchema = zod_1.z.object({
    phase_time: zod_1.z.object({
        master: exports.phaseValuesObj,
        slave: exports.phaseValuesObj,
    }),
    cycle_time: zod_1.z.object({
        master: zod_1.z.number(),
        slave: zod_1.z.number(),
    }),
    transition: zod_1.z.object({
        master: zod_1.z.boolean().optional(),
        slave: zod_1.z.boolean().optional(),
    }),
    yellow: zod_1.z.object({
        master: zod_1.z.number().optional(),
        slave: zod_1.z.number().optional(),
    }),
    green: zod_1.z.object({
        master: zod_1.z.number().optional(),
        slave: zod_1.z.number().optional(),
    }),
    elapsed_time: zod_1.z.object({
        master: exports.phaseValuesObj,
        slave: exports.phaseValuesObj,
    }),
    current_green: zod_1.z.object({
        master: zod_1.z.number().nullable().default(0),
        slave: zod_1.z.number().nullable().default(0),
    }),
    hold: zod_1.z.object({
        master: zod_1.z.boolean(),
        slave: zod_1.z.boolean(),
    }),
});
exports.holdStateDataSchema = zod_1.z.object({
    master: zod_1.z.boolean(),
    slave: zod_1.z.boolean(),
});
