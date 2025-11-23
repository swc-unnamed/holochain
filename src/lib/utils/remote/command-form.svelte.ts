/* eslint-disable @typescript-eslint/no-explicit-any */
import { isHttpError } from '@sveltejs/kit';
import { transformIssues } from '../validation/validation-issues';
import type { CommandFormErrors, CommandFormOptions } from './command-form.types';
import z, { ZodError, ZodObject, type ZodRawShape } from 'zod';
import { invalidate, invalidateAll } from '$app/navigation';

/**
 * A command form utility for managing form state, validation, and submission to a remote command.
 * @template Shape - The Zod raw shape for the schema
 * @template TOut - Output type from the command
 * @param schema - Zod schema for validating the form data
 * @param options - Options for configuring the command form behavior
 * @returns Form state, errors, submission status, result, and helper methods
 */
function commandForm<Shape extends ZodRawShape, TOut>(
  schema: ZodObject<Shape>,
  options: CommandFormOptions<z.infer<typeof schema>, TOut>
) {
  type TIn = z.infer<typeof schema>;

  const base: Partial<TIn> = {};
  const shape = schema.shape;

  for (const key of Object.keys(shape) as (keyof TIn)[]) {
    if (options.initial && key in options.initial) {
      base[key] = options.initial[key]!;
    } else {
      delete (base as any)[key];
    }
  }

  const form = $state<Partial<TIn>>(base);
  const errors = $state<CommandFormErrors<TIn>>({});
  let _submitting = $state(false);
  let _result = $state<TOut | null>(null);

  function reset() {
    for (const key in form) {
      delete (form as any)[key];
    }

    if (options.initial) {
      for (const key of Object.keys(options.initial) as (keyof TIn)[]) {
        (form as any)[key] = options.initial[key]!;
      }
    }
  }

  function setInitial(values: Partial<TIn>, clearIfExists = false) {
    if (clearIfExists) {
      for (const key in form) delete (form as any)[key];
    }

    Object.assign(form, values);

    const shape = schema.shape;
    for (const key of Object.keys(shape)) {
      if (!(key in form)) {
        (form as any)[key] = null;
      }
    }
    return form;
  }

  async function submit() {
    _submitting = true;
    for (const key in errors) delete errors[key];
    _result = null;

    try {
      const parsed = schema.parse(form);
      await options.onSubmit?.(parsed);
      const res = await options.command(parsed);
      _result = res;
      await options.onSuccess?.(res);

      if (options.invalidate) {
        if (Array.isArray(options.invalidate)) {
          for (const inv of options.invalidate) await invalidate(inv);
        } else if (options.invalidate === 'all') {
          await invalidateAll();
        } else {
          await invalidate(options.invalidate);
        }
      }
      if (options.reset === 'onSuccess') reset();
      return res;
    } catch (err) {
      if (options.reset === 'onError') reset();
      if (err instanceof ZodError) {
        const transformed = transformIssues(err.issues);
        for (const [key, val] of Object.entries(transformed)) {
          (errors as any)[key] = val;
        }
      }

      if (isHttpError(err)) {
        const transformed = err.body.issues;
        if (transformed) {
          for (const [key, val] of Object.entries(transformed)) {
            (errors as any)[key] = val;
          }
        }
      }

      await options.onError?.(err);
      return null;
    } finally {
      _submitting = false;
      if (options.reset === 'always') reset();
    }
  }

  return {
    form,
    get errors() {
      return errors;
    },
    get submitting() {
      return _submitting;
    },
    get result() {
      return _result;
    },
    submit,
    reset,
    set: setInitial
  };
}

export { commandForm };