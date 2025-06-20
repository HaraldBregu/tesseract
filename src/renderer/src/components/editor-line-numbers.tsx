import { useEffect, useRef, useState } from 'react'

const LineNumbers = ({ editor }) => {
  const [lineNumbers, setLineNumbers] = useState<JSX.Element[]>([])
  const [options, setOptions] = useState({
    show: false,
    frequency: 5,
    type: 'arabic'
  })
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const toRoman = (num: number): string => {
    const roman: Record<string, number> = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1
    }
    let str = ''
    for (const i of Object.keys(roman)) {
      const q = Math.floor(num / roman[i])
      num -= q * roman[i]
      str += i.repeat(q)
    }
    return str
  }

  useEffect(() => {
    if (!editor) return

    const syncOptions = () => {
      const editorOptions = editor.storage.lineNumbers?.options
      if (editorOptions) {
        setOptions({
          show: editorOptions.show,
          frequency: editorOptions.frequency || 5,
          type: editorOptions.type || 'arabic'
        })
      }
    }

    syncOptions()

    const onOptionsChanged = () => {
      syncOptions()
    }

    editor.on('lineNumberOptionsChanged', onOptionsChanged)

    return () => {
      editor.off('lineNumberOptionsChanged', onOptionsChanged)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateLineNumbers = () => {
      if (!options.show) {
        setLineNumbers([])
        return
      }

      const frequency = options.frequency
      const type = options.type

      const editorElement = editor.view.dom
      if (!editorElement) return

      // Funzione per determinare l'offset verticale in base al tipo di tag
      const getOffsetForTag = (tagName: string): number => {
        switch (tagName.toLowerCase()) {
          case 'p':
            return 4
          case 'h1':
            return 6
          case 'h2':
            return 5
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return 4
          case 'pre':
            return 5
          case 'blockquote':
            return 4
          case 'ul':
          case 'ol':
            return 2
          default:
            return 4
        }
      }

      // Individua gli elementi di blocco nell'editor
      const blockElements = editorElement.querySelectorAll(
        'p, h1, h2, h3, h4, h5, h6, pre, blockquote, ul, ol'
      )

      // Genera i numeri di riga basati sulle righe fisiche effettive
      const numbers: JSX.Element[] = []

      let physicalLineIndex = 0

      blockElements.forEach((element) => {
        // Ottieni lo stile computato specifico di questo elemento
        const elementStyle = window.getComputedStyle(element)

        // Calcola l'altezza effettiva della riga per questo elemento specifico
        const elementLineHeight =
          parseInt(elementStyle.lineHeight) || parseInt(elementStyle.fontSize) * 1.5

        // Considera margini e padding dell'elemento
        const paddingTop = parseInt(elementStyle.paddingTop) || 0
        const paddingBottom = parseInt(elementStyle.paddingBottom) || 0

        // Calcola quante righe fisiche occupa questo elemento (contenuto effettivo)
        const elementContentHeight =
          element.getBoundingClientRect().height - paddingTop - paddingBottom
        const linesInElement = Math.max(1, Math.ceil(elementContentHeight / elementLineHeight))

        // Per ogni riga fisica nell'elemento
        for (let i = 0; i < linesInElement; i++) {
          physicalLineIndex++

          // Mostra solo i numeri che corrispondono alla frequenza impostata
          if (physicalLineIndex % frequency === 0 || physicalLineIndex === 1) {
            // Calcola la posizione esatta che tiene conto anche del margine superiore
            // offsetTop già include i margini degli elementi precedenti
            const topPosition = element.offsetTop + paddingTop + i * elementLineHeight

            // Aggiungi un offset per allineare il numero con la linea di testo
            // Aggiungi anche un correttivo basato sul tipo di elemento
            const offsetY = getOffsetForTag(element.tagName)

            const displayNumber =
              type === 'arabic' ? physicalLineIndex.toString() : toRoman(physicalLineIndex)

            numbers.push(
              <div
                key={`line-${physicalLineIndex}`}
                className="absolute right-2 text-[10px] text-gray-500 select-none font-medium"
                style={{ top: `${topPosition + offsetY}px` }}
              >
                {displayNumber}
              </div>
            )
          }
        }
      })

      // Aggiungi un elemento alla fine per garantire lo scroll completo
      if (blockElements.length > 0) {
        const lastElement = blockElements[blockElements.length - 1]
        const lastElementStyle = window.getComputedStyle(lastElement)
        const lastElementMarginBottom = parseInt(lastElementStyle.marginBottom) || 0
        const lastElementBottom =
          lastElement.offsetTop + lastElement.offsetHeight + lastElementMarginBottom

        numbers.push(
          <div
            key="bottom-spacer"
            className="absolute right-0 w-full"
            style={{
              top: `${lastElementBottom + 10}px`,
              height: '1px'
            }}
          />
        )
      }

      setLineNumbers(numbers)
    }

    // Configurare lo scroll con IntersectionObserver
    const setupScrollSync = () => {
      const editorElement = editor.view.dom
      if (!editorElement || !lineNumbersRef.current) return

      // Funzione per sincronizzare lo scroll con bassa latenza
      const syncScroll = () => {
        if (lineNumbersRef.current) {
          // Usa requestAnimationFrame per evitare aggiornamenti troppo frequenti
          requestAnimationFrame(() => {
            if (lineNumbersRef.current) {
              lineNumbersRef.current.scrollTop = editorElement.scrollTop
            }
          })
        }
      }

      // Aggiungi gli event listener
      editorElement.addEventListener('scroll', syncScroll, { passive: true })
      editorElement.addEventListener('mousewheel', syncScroll, { passive: true })

      // Aggiungiamo anche l'evento di scroll dell'elemento padre
      const parentElement = editorElement.parentElement
      if (parentElement) {
        parentElement.addEventListener('scroll', syncScroll, { passive: true })
      }

      // Sincronizza subito
      syncScroll()

      // Funzione di pulizia
      return () => {
        editorElement.removeEventListener('scroll', syncScroll)
        editorElement.removeEventListener('mousewheel', syncScroll)
        if (parentElement) {
          parentElement.removeEventListener('scroll', syncScroll)
        }
      }
    }

    // Observer per rilevare cambiamenti al contenuto
    const setupMutationObserver = () => {
      const editorElement = editor.view.dom
      if (!editorElement) return

      const observer = new MutationObserver(() => {
        // Aggiorna con un piccolo ritardo per consentire il rendering
        requestAnimationFrame(updateLineNumbers)
      })

      observer.observe(editorElement, {
        childList: true,
        subtree: true,
        characterData: true
      })

      return () => observer.disconnect()
    }

    // Observer per rilevare cambiamenti di dimensione
    const setupResizeObserver = () => {
      const editorElement = editor.view.dom
      if (!editorElement) return

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateLineNumbers)
      })

      resizeObserver.observe(editorElement)

      // Osserva anche il documento per catturare i cambiamenti di font o layout
      resizeObserver.observe(document.documentElement)

      return () => resizeObserver.disconnect()
    }

    // Editor events
    const setupEditorListeners = () => {
      const handleUpdate = () => {
        requestAnimationFrame(updateLineNumbers)
      }

      editor.on('update', handleUpdate)
      window.addEventListener('resize', handleUpdate)

      return () => {
        editor.off('update', handleUpdate)
        window.removeEventListener('resize', handleUpdate)
      }
    }

    // Inizializza tutto
    updateLineNumbers()
    const cleanupScrollSync = setupScrollSync()
    const cleanupMutationObserver = setupMutationObserver()
    const cleanupResizeObserver = setupResizeObserver()
    const cleanupEditorListeners = setupEditorListeners()

    // Cleanup
    return () => {
      cleanupScrollSync?.()
      cleanupMutationObserver?.()
      cleanupResizeObserver?.()
      cleanupEditorListeners?.()
    }
  }, [editor, options])

  if (!editor || !options.show) {
    return null
  }

  return (
    <div
      ref={lineNumbersRef}
      className="relative w-10 min-w-[40px] bg-white dark:bg-gray-900 overflow-auto h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="relative min-h-full">{lineNumbers}</div>
    </div>
  )
}

export default LineNumbers
