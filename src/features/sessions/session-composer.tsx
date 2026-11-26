import { Button } from '@base-ui/react/button'
import { Field } from '@base-ui/react/field'
import { Form } from '@base-ui/react/form'
import { Input } from '@base-ui/react/input'
import type { SessionComposerProps } from './session-composer.types'

export const SessionComposer = ({
  model, draft, canSubmit, onModelChange, onDraftChange, onSubmit,
}: SessionComposerProps) => (
  <Form className="grid max-w-xl gap-3" onFormSubmit={onSubmit}>
    <Field.Root className="grid gap-1">
      <Field.Label>Модель</Field.Label>
      <Input value={model} placeholder="По умолчанию"
        onValueChange={onModelChange} />
    </Field.Root>
    <Field.Root className="grid gap-1">
      <Field.Label>Сообщение</Field.Label>
      <Field.Control render={<textarea rows={3} />} value={draft}
        onValueChange={onDraftChange} />
    </Field.Root>
    <Button type="submit" className="justify-self-start" disabled={!canSubmit}>
      Добавить в очередь
    </Button>
  </Form>
)
