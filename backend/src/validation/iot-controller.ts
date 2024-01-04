import { z } from "zod";

export const phaseValuesObj = z.object({
  0: z.number(),
  1: z.number(),
  2: z.number(),
  3: z.number(),
});

export type IPhaseValuesObj = z.infer<typeof phaseValuesObj>;

export const signalsDataSchema = z.object({
  phase_time: phaseValuesObj,
  cycle_time: z.number(),
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
    master: phaseValuesObj,
    slave: phaseValuesObj,
  }),
  smart_mode: z.object({
    master: phaseValuesObj,
    slave: phaseValuesObj,
  }),
});

export type ISignalsData = z.infer<typeof signalsDataSchema>;

export const holdStateDataSchema = z.object({
  master: z.number(),
  slave: z.number(),
});

export type IHoldStateData = z.infer<typeof holdStateDataSchema>;
