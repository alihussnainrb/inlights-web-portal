import { z } from "zod";

export const phaseValuesObj = z.object({
  0: z.number(),
  1: z.number(),
  2: z.number(),
  3: z.number(),
});

export type IPhaseValuesObj = z.infer<typeof phaseValuesObj>;

export enum ControllerMode {
  manual = "manual",
  smart = "smart",
  blink = "blink",
  testing = "testing",
}

export const signalsDataSchema = z.object({
  phase_time: z.object({
    master: phaseValuesObj,
    slave: phaseValuesObj,
  }),
  cycle_time: z.object({
    master: z.number(),
    slave: z.number(),
  }),
  transition: z.object({
    master: z.boolean().optional(),
    slave: z.boolean().optional(),
  }),
  yellow: z.object({
    master: z.number().optional(),
    slave: z.number().optional(),
  }),
  green: z.object({
    master: z.number().optional(),
    slave: z.number().optional(),
  }),
  elapsed_time: z.object({
    master: phaseValuesObj,
    slave: phaseValuesObj,
  }),
  current_green: z.object({
    master: z.number().nullable().default(0),
    slave: z.number().nullable().default(0),
  }),
  hold: z.object({
    master: z.boolean(),
    slave: z.boolean(),
  }),
  mode: z.nativeEnum(ControllerMode).optional().default(ControllerMode.manual),
});

export type ISignalsData = z.infer<typeof signalsDataSchema>;

export const holdStateDataSchema = z.object({
  master: z.boolean(),
  slave: z.boolean(),
});

export type IHoldStateData = z.infer<typeof holdStateDataSchema>;
