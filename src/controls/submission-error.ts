import type { UiMessageDescriptor } from '../i18n/types'

/** A public form failure, independent of the application's API response shape. */
export class UiFormSubmissionError extends Error {
  readonly stage: 'validate' | 'submit'
  readonly fields: Readonly<
    Record<string, readonly (string | UiMessageDescriptor)[]>
  >

  constructor(options: {
    stage: 'validate' | 'submit'
    message: string
    fields?: Readonly<Record<string, readonly (string | UiMessageDescriptor)[]>>
    cause?: unknown
  }) {
    super(options.message, { cause: options.cause })
    this.name = 'UiFormSubmissionError'
    this.stage = options.stage
    this.fields = Object.freeze(
      Object.fromEntries(
        Object.entries(options.fields ?? {}).map(([name, issues]) => [
          name,
          Object.freeze([...issues]),
        ]),
      ),
    )
  }
}

/** A submission cannot complete against the form's current lifecycle state. */
export class UiFormSubmissionStateError extends Error {
  constructor(
    readonly reason: 'pending' | 'obsolete' | 'disposed',
    options?: ErrorOptions,
  ) {
    super(
      {
        pending: 'A form submission is already pending.',
        obsolete:
          'The form submission no longer represents the current values.',
        disposed: 'The form submission belongs to a disposed control.',
      }[reason],
      options,
    )
    this.name = 'UiFormSubmissionStateError'
  }
}
