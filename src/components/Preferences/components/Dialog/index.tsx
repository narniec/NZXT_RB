import React from 'react'

import { IDialogActions, IDialogProps } from './types'

import { AiOutlineClose as CloseIcon } from 'react-icons/ai'

import { Container } from './styles'

export const Dialog = React.forwardRef<IDialogActions, IDialogProps>((props, ref) => {
  const localRef = React.useRef<HTMLDialogElement>(null)

  const [isOpen, setIsOpen] = React.useState(props.open ?? false)

  React.useLayoutEffect(() => {
    isOpen ? localRef.current?.showModal() : localRef.current?.close?.()
  }, [isOpen])

  const handleConfirm = () => {
    if (props.onConfirm) props.onConfirm()
    handleOnClose()
  }

  const handleCancel = () => {
    if (props.onCancel) props.onCancel()
    handleOnClose()
  }

  const handleOnOpen = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleOnClose = () => {
    setIsOpen(false)
  }

  React.useImperativeHandle(
    ref,
    () => ({
      open: () => handleOnOpen(),
      close: () => handleOnClose(),
    }),
    [handleOnOpen],
  )

  return (
    <Container>
      <dialog ref={localRef} onClose={handleOnClose} onCancel={handleOnClose}>
        <div className="dialog-header">
          <div className="dialog-headerTitle">{props.title}</div>
          <CloseIcon onClick={handleCancel} />
        </div>

        <div className="dialog-content">{props.children}</div>

        <div className="dialog-panel">
          <button data-secondary onClick={handleCancel}>
            {props.cancelLabel ?? 'Cancel'}
          </button>
          <button onClick={handleConfirm}>{props.confirmLabel ?? 'Confirm'}</button>
        </div>
      </dialog>
    </Container>
  )
})

Dialog.displayName = 'Dialog'
