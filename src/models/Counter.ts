import { Schema, models, model } from "mongoose";

export interface ICounter {
  _id: string; // sequence name, e.g. "transaction"
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = models.Counter || model<ICounter>("Counter", CounterSchema);

/** Atomically increment and return the next value for a named sequence. */
export async function nextSequence(name: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean<{ seq: number }>();
  return doc!.seq;
}

/** e.g. nextRef("TXN") -> "NB-TXN-000001" (never repeats; atomic). */
export async function nextRef(prefix: string, pad = 6): Promise<string> {
  const n = await nextSequence(prefix.toLowerCase());
  return `NB-${prefix}-${String(n).padStart(pad, "0")}`;
}
