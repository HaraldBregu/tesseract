// Default shortcuts mapping - separated to avoid circular dependencies
type ShortcutDefinition = Omit<KeyboardShortcut, 'locked'> & Partial<Pick<KeyboardShortcut, 'locked'>>;

export const getDefaultKeyboardShortcuts = (MenuItemId): KeyboardShortcut[] => {
    const shortcuts: ShortcutDefinition[] = [
    // ==================== CRITERION MENU ====================
    { menuItemId: MenuItemId.ABOUT, label: 'menu.help.about', shortcut: '', description: 'menu.help.aboutDescription', category: 'Criterion', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.PREFERENCES, label: 'menu.preferences', shortcut: 'CmdOrCtrl+Shift+O', description: 'menu.preferencesDescription', category: 'Criterion', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== FILE MENU ====================
    { menuItemId: MenuItemId.NEW_FILE, label: 'menu.file.new', shortcut: 'CmdOrCtrl+N', description: 'menu.file.newDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.OPEN_FILE, label: 'menu.file.open', shortcut: 'CmdOrCtrl+O', description: 'menu.file.openDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.CLOSE_FILE, label: 'menu.file.close', shortcut: 'CmdOrCtrl+W', description: 'menu.file.closeDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SAVE_FILE, label: 'menu.file.save', shortcut: 'CmdOrCtrl+S', description: 'menu.file.saveDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SAVE_FILE_AS, label: 'menu.file.saveAs', shortcut: 'CmdOrCtrl+Alt+S', description: 'menu.file.saveAsDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.RENAME_FILE, label: 'menu.file.rename', shortcut: '', description: 'menu.file.renameDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.MOVE_FILE, label: 'menu.file.moveTo', shortcut: '', description: 'menu.file.moveToDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.EXPORT_TO_PDF, label: 'menu.file.exportTo.pdf', shortcut: '', description: 'menu.file.exportTo.pdfDescription', category: 'File', firstParentLabel: 'menu.file.exportTo.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.EXPORT_TO_XML_TEI, label: 'menu.file.exportTo.xml', shortcut: '', description: 'menu.file.exportTo.xmlDescription', category: 'File', firstParentLabel: 'menu.file.exportTo.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SAVE_AS_TEMPLATE, label: 'menu.file.saveAsTemplate', shortcut: 'CmdOrCtrl+Shift+S', description: 'menu.file.saveAsTemplateDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.METADATA, label: 'menu.file.metadata', shortcut: 'CmdOrCtrl+M', description: 'menu.file.metadataDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.PAGE_SETUP, label: 'menu.file.pageSetup', shortcut: 'CmdOrCtrl+Shift+P', description: 'menu.file.pageSetupDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.PRINT, label: 'menu.file.print', shortcut: 'CmdOrCtrl+P', description: 'menu.file.printDescription', category: 'File', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== EDIT MENU ====================
    { menuItemId: MenuItemId.FIND_AND_REPLACE, label: 'menu.edit.find.label', shortcut: 'CmdOrCtrl+F', description: 'menu.edit.find.description', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.UNDO, label: 'menu.edit.undo', shortcut: 'CmdOrCtrl+Z', description: 'menu.edit.undoDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.REDO, label: 'menu.edit.redo', shortcut: 'CmdOrCtrl+Shift+Z', description: 'menu.edit.redoDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.CUT, label: 'menu.edit.cut', shortcut: 'CmdOrCtrl+X', description: 'menu.edit.cutDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.COPY, label: 'menu.edit.copy', shortcut: 'CmdOrCtrl+C', description: 'menu.edit.copyDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.PASTE, label: 'menu.edit.paste', shortcut: 'CmdOrCtrl+V', description: 'menu.edit.pasteDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.COPY_STYLE, label: 'menu.edit.copyStyle', shortcut: 'CmdOrCtrl+Alt+C', description: 'menu.edit.copyStyleDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.PASTE_STYLE, label: 'menu.edit.pasteStyle', shortcut: 'CmdOrCtrl+Alt+V', description: 'menu.edit.pasteStyleDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.PASTE_TEXT_WITHOUT_FORMATTING, label: 'menu.edit.pasteTextWithoutFormatting', shortcut: 'CmdOrCtrl+Shift+V', description: 'menu.edit.pasteTextWithoutFormattingDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.DELETE_SELECTION, label: 'menu.edit.delete', shortcut: '', description: 'menu.edit.deleteDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.SELECT_ALL, label: 'menu.edit.selectAll', shortcut: 'CmdOrCtrl+A', description: 'menu.edit.selectAllDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },
    { menuItemId: MenuItemId.DESELECT_ALL, label: 'menu.edit.deSelectAll', shortcut: 'CmdOrCtrl+Shift+A', description: 'menu.edit.deSelectAllDescription', category: 'Edit', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },

    // ==================== INSERT MENU ====================
    { menuItemId: MenuItemId.INSERT_COMMENT, label: 'menu.insert.comment', shortcut: 'CmdOrCtrl+Alt+K', description: 'menu.insert.commentDescription', category: 'Insert', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.INSERT_BOOKMARK, label: 'menu.insert.bookmark', shortcut: 'CmdOrCtrl+Alt+B', description: 'menu.insert.bookmarkDescription', category: 'Insert', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.INSERT_LINK, label: 'menu.insert.link', shortcut: 'CmdOrCtrl+K', description: 'menu.insert.linkDescription', category: 'Insert', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.REMOVE_LINK, label: 'menu.format.removeLink', shortcut: 'CmdOrCtrl+Shift+K', description: 'menu.format.removeLinkDescription', category: 'Insert', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.INSERT_SYMBOL, label: 'menu.insert.symbol', shortcut: 'CmdOrCtrl+Shift+Y', description: 'menu.insert.symbolDescription', category: 'Insert', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.INSERT_PAGE_BREAK, label: 'menu.insert.pageBreak', shortcut: 'CmdOrCtrl+Enter', description: 'menu.insert.pageBreakDescription', category: 'Insert', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== REFERENCES MENU ====================
    { menuItemId: MenuItemId.INSERT_NOTE, label: 'menu.references.addNote', shortcut: 'F5', description: 'menu.references.addNoteDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SWAP_MARGIN, label: 'menu.references.swapMargin', shortcut: '', description: 'menu.references.swapMarginDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.INSERT_READING_TYPE, label: 'menu.references.addReadingType', shortcut: 'F4', description: 'menu.references.addReadingTypeDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_READING_TYPE_ADD, label: 'menu.references.addReadingTypeAdd', shortcut: '', description: 'menu.references.addReadingTypeDescription', category: 'References', firstParentLabel: 'menu.references.addReading', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_READING_TYPE_OM, label: 'menu.references.addReadingTypeOm', shortcut: '', description: 'menu.references.addReadingTypeDescription', category: 'References', firstParentLabel: 'menu.references.addReading', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_READING_TYPE_TR, label: 'menu.references.addReadingTypeTr', shortcut: '', description: 'menu.references.addReadingTypeDescription', category: 'References', firstParentLabel: 'menu.references.addReading', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_READING_TYPE_DEL, label: 'menu.references.addReadingTypeDel', shortcut: '', description: 'menu.references.addReadingTypeDescription', category: 'References', firstParentLabel: 'menu.references.addReading', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_READING_TYPE_CUSTOM, label: 'menu.references.addReadingTypeCustom', shortcut: '', description: 'menu.references.addReadingTypeDescription', category: 'References', firstParentLabel: 'menu.references.addReading', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_READING_SEPARATOR, label: 'menu.references.addReadingSeparator', shortcut: 'F2', description: 'menu.references.addReadingSeparatorDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_SIGLUM, label: 'menu.references.addSiglum', shortcut: 'F3', description: 'menu.references.addSiglumDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SIGLA_SETUP, label: 'menu.references.siglaSetup', shortcut: 'F6', description: 'menu.references.siglaSetupDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_CITATION, label: 'menu.references.addCitation', shortcut: 'CmdOrCtrl+Shift+B', description: 'menu.references.addCitationDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.ADD_BIBLIOGRAPHY, label: 'menu.references.bibliography', shortcut: '', description: 'menu.references.bibliographyDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.REFERENCES_FORMAT, label: 'menu.references.referencesFormat', shortcut: '', description: 'menu.references.referencesFormatDescription', category: 'References', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== FORMAT MENU ====================
    // Font submenu
    { menuItemId: MenuItemId.FONT_BOLD, label: 'menu.format.font.bold', shortcut: 'CmdOrCtrl+B', description: 'menu.format.font.boldDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_ITALIC, label: 'menu.format.font.italic', shortcut: 'CmdOrCtrl+I', description: 'menu.format.font.italicDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_UNDERLINE, label: 'menu.format.font.underline', shortcut: 'CmdOrCtrl+U', description: 'menu.format.font.underlineDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_STRIKETHROUGH, label: 'menu.format.font.strikethrough', shortcut: 'CmdOrCtrl+T', description: 'menu.format.font.strikethroughDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_SUPERSCRIPT, label: 'menu.format.font.superscript', shortcut: 'CmdOrCtrl+.', description: 'menu.format.font.superscriptDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_SUBSCRIPT, label: 'menu.format.font.subscript', shortcut: 'CmdOrCtrl+,', description: 'menu.format.font.subscriptDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_NPC, label: 'menu.format.font.npc', shortcut: 'F7', description: 'menu.format.font.npcDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.FONT_CHARACTER_SPACING_NORMAL, label: 'menu.format.font.characterSpacing.normal', shortcut: '', description: 'menu.format.font.characterSpacing.normalDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.characterSpacing.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CHARACTER_SPACING_TIGHTEN, label: 'menu.format.font.characterSpacing.tighten', shortcut: '', description: 'menu.format.font.characterSpacing.tightenDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.characterSpacing.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CHARACTER_SPACING_LOOSEN, label: 'menu.format.font.characterSpacing.loosen', shortcut: '', description: 'menu.format.font.characterSpacing.loosenDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.characterSpacing.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_LIGATURE_DEFAULT, label: 'menu.format.font.ligature.default', shortcut: '', description: 'menu.format.font.ligature.defaultDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.ligature.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_LIGATURE_NONE, label: 'menu.format.font.ligature.none', shortcut: '', description: 'menu.format.font.ligature.noneDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.ligature.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_LIGATURE_ALL, label: 'menu.format.font.ligature.all', shortcut: '', description: 'menu.format.font.ligature.allDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.ligature.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CAPTALIZATION_ALL_CAPS, label: 'menu.format.font.capitalization.allCaps', shortcut: '', description: 'menu.format.font.capitalization.allCapsDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.capitalization.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CAPTALIZATION_SMALL_CAPS, label: 'menu.format.font.capitalization.smallCaps', shortcut: '', description: 'menu.format.font.capitalization.smallCapsDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.capitalization.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CAPTALIZATION_TITLE_CASE, label: 'menu.format.font.capitalization.titleCase', shortcut: '', description: 'menu.format.font.capitalization.titleCaseDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.capitalization.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CAPTALIZATION_START_CASE, label: 'menu.format.font.capitalization.startCase', shortcut: '', description: 'menu.format.font.capitalization.startCaseDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.capitalization.label', isCustom: false },
    { menuItemId: MenuItemId.FONT_CAPTALIZATION_NONE, label: 'menu.format.font.capitalization.none', shortcut: '', description: 'menu.format.font.capitalization.noneDescription', category: 'Format', firstParentLabel: 'menu.format.font.label', secondParentLabel: 'menu.format.font.capitalization.label', isCustom: false },

    // Text submenu
    { menuItemId: MenuItemId.TEXT_ALIGN_LEFT, label: 'menu.format.text.alignLeft', shortcut: 'CmdOrCtrl+L', description: 'menu.format.text.alignLeftDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TEXT_ALIGN_CENTER, label: 'menu.format.text.alignCenter', shortcut: 'CmdOrCtrl+E', description: 'menu.format.text.alignCenterDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TEXT_ALIGN_RIGHT, label: 'menu.format.text.alignRight', shortcut: 'CmdOrCtrl+R', description: 'menu.format.text.alignRightDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TEXT_ALIGN_JUSTIFY, label: 'menu.format.text.justify', shortcut: 'CmdOrCtrl+J', description: 'menu.format.text.justifyDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TEXT_INCREASE_INDENT, label: 'menu.format.text.increaseIndent', shortcut: 'CmdOrCtrl+_', description: 'menu.format.text.increaseIndentDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TEXT_DECREASE_INDENT, label: 'menu.format.text.decreaseIndent', shortcut: 'CmdOrCtrl+-', description: 'menu.format.text.decreaseIndentDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TEXT_SPACING_SINGLE, label: 'menu.format.text.spacing.single', shortcut: '', description: 'menu.format.text.spacing.singleDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: 'menu.format.text.spacing.label', isCustom: false },
    { menuItemId: MenuItemId.TEXT_SPACING_1_15, label: 'menu.format.text.spacing.1_15', shortcut: '', description: 'menu.format.text.spacing.1_15Description', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: 'menu.format.text.spacing.label', isCustom: false },
    { menuItemId: MenuItemId.TEXT_SPACING_ONE_AND_HALF, label: 'menu.format.text.spacing.oneAndHalf', shortcut: '', description: 'menu.format.text.spacing.oneAndHalfDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: 'menu.format.text.spacing.label', isCustom: false },
    { menuItemId: MenuItemId.TEXT_SPACING_DOUBLE, label: 'menu.format.text.spacing.double', shortcut: '', description: 'menu.format.text.spacing.doubleDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: 'menu.format.text.spacing.label', isCustom: false },
    { menuItemId: MenuItemId.CUSTOM_SPACING, label: 'customSpacing.title', shortcut: '', description: 'menu.format.text.spacing.customDescription', category: 'Format', firstParentLabel: 'menu.format.text.label', secondParentLabel: 'menu.format.text.spacing.label', isCustom: false },

    // List submenu
    { menuItemId: MenuItemId.NUMBER_BULLET, label: 'menu.format.list.number', shortcut: '', description: 'menu.format.list.numberDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.UPPER_LETTER_BULLET, label: 'menu.format.list.maxLetter', shortcut: '', description: 'menu.format.list.maxLetterDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.LOW_LETTER_BULLET, label: 'menu.format.list.lowerLetter', shortcut: '', description: 'menu.format.list.lowerLetterDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.UPPER_ROMAN_BULLET, label: 'menu.format.list.maxRoman', shortcut: '', description: 'menu.format.list.maxRomanDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.LOW_ROMAN_BULLET, label: 'menu.format.list.lowerRoman', shortcut: '', description: 'menu.format.list.lowerRomanDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.POINT_BULLET, label: 'menu.format.list.point', shortcut: '', description: 'menu.format.list.pointDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.CIRCLE_BULLET, label: 'menu.format.list.emptyPoint', shortcut: '', description: 'menu.format.list.emptyPointDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SQUARE_BULLET, label: 'menu.format.list.square', shortcut: '', description: 'menu.format.list.squareDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.RESUME_NUMBERING, label: 'menu.format.list.resumeNumbering', shortcut: '', description: 'menu.format.list.resumeNumberingDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.PREVIOUS_NUMBERING, label: 'menu.format.list.continuePreviousNumbering', shortcut: '', description: 'menu.format.list.continuePreviousNumberingDescription', category: 'Format', firstParentLabel: 'menu.format.list.label', secondParentLabel: '', isCustom: false },

    // Format - other items
    { menuItemId: MenuItemId.PAGE_NUMBER, label: 'menu.format.pageNumber.label', shortcut: '', description: 'menu.format.pageNumber.description', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.OPEN_LINE_NUMBER_SETTINGS, label: 'menu.format.lineNumber.label', shortcut: '', description: 'menu.format.lineNumber.description', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.SECTIONS_STYLE, label: 'menu.format.sectionsStyle', shortcut: '', description: 'menu.format.sectionsStyleDescription', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.OPEN_FOOTER_SETTINGS, label: 'menu.format.headerFooter.label', shortcut: '', description: 'menu.format.headerFooter.description', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.OPEN_TOC_SETTINGS, label: 'menu.format.toc.label', shortcut: '', description: 'menu.format.toc.description', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.CHANGE_TEMPLATE, label: 'menu.format.changeTemplate', shortcut: '', description: 'menu.format.changeTemplateDescription', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.LAYOUT_PAGE_SETUP, label: 'menu.format.layout.label', shortcut: 'CmdOrCtrl+Alt+P', description: 'menu.format.layout.description', category: 'Format', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== VIEW MENU ====================
    { menuItemId: MenuItemId.TABLE_OF_CONTENTS, label: 'menu.view.tableOfContents', shortcut: 'CmdOrCtrl+Alt+T', description: 'menu.view.tableOfContentsDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TOOLBAR, label: 'menu.view.toolbar', shortcut: 'CmdOrCtrl+Alt+R', description: 'menu.view.toolbarDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.CUSTOMIZE_TOOLBAR, label: 'menu.view.customizeToolbar', shortcut: '', description: 'menu.view.customizeToolbarDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.STATUS_BAR, label: 'menu.view.statusBar', shortcut: '', description: 'menu.view.statusBarDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.CUSTOMIZE_STATUS_BAR, label: 'menu.view.customizeStatusBar', shortcut: '', description: 'menu.view.customizeStatusBarDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.PRINT_PREVIEW, label: 'menu.view.printPreview', shortcut: '', description: 'menu.view.printPreviewDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.EXPAND_COLLAPSE, label: 'menu.view.expandCollapse', shortcut: '', description: 'menu.view.expandCollapseDescription', category: 'View', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== KEYBOARD MENU ====================
    { menuItemId: MenuItemId.CUSTOMIZE_SHORTCUTS, label: 'menu.keyboard.customizeShortcuts', shortcut: '', description: 'menu.keyboard.customizeShortcutsDescription', category: 'Keyboard', firstParentLabel: '', secondParentLabel: '', isCustom: false, locked: true },

    // ==================== SETTINGS MENU ====================
    // (Windows/Linux only - on macOS Preferences is in Criterion menu)
    { menuItemId: MenuItemId.PREFERENCES, label: 'menu.preferences', shortcut: 'CmdOrCtrl+Shift+O', description: 'menu.preferencesDescription', category: 'Settings', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== HELP MENU ====================
    { menuItemId: MenuItemId.HELP, label: 'menu.help.criterionHelp', shortcut: 'F1', description: 'menu.help.criterionHelpDescription', category: 'Help', firstParentLabel: '', secondParentLabel: '', isCustom: false },

    // ==================== DEVELOPER MENU ====================
    // (Excluded from UI)
    { menuItemId: MenuItemId.RELOAD, label: 'menu.developer.reload', shortcut: 'CmdOrCtrl+Shift+R', description: 'Reload', category: 'Developer', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    { menuItemId: MenuItemId.TOGGLE_DEV_TOOLS, label: 'menu.developer.toggleDevTools', shortcut: 'CmdOrCtrl+Alt+I', description: 'Toggle dev tools', category: 'Developer', firstParentLabel: '', secondParentLabel: '', isCustom: false },
    ];

    return shortcuts.map((shortcut) => ({
        ...shortcut,
        locked: shortcut.locked ?? false,
    }));
};
