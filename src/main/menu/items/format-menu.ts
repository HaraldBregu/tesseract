import i18next from "i18next";
import { MenuItem, MenuItemConstructorOptions } from "electron";
import { MenuItemId } from "../../types";
import { getMenuViewMode } from "../../shared/constants";
import { getKeyboardShortcut } from '../../shared/keyboard-shortcuts-utils';
import { getReferencesMenuCurrentContext } from "./references-menu";

let isTextFormattingEnabled = true;
let enableTocSettingsMenu = false;

export function setTextFormattingMenuEnabled(value: boolean): void {
  isTextFormattingEnabled = value;
}

export function setEnableTocSettingsMenu(enable: boolean): void {
  enableTocSettingsMenu = enable
}

export function getEnableTocSettingsMenu(): boolean {
  return enableTocSettingsMenu;
}

export function getTextFormattingMenuEnabled(): boolean {
  return isTextFormattingEnabled;
}

export function buildFormatMenu(
  onClick: (menuItem: MenuItem) => void
): MenuItemConstructorOptions {
  const viewMode = getMenuViewMode();
  const editorContext = getReferencesMenuCurrentContext();
  const isMainTextEditor = editorContext === "maintext_editor";

  const menu: MenuItemConstructorOptions = {};
  menu.label = i18next.t("menu.format.label");
  menu.submenu = [
    {
      label: i18next.t("menu.format.font.label"),
      enabled: viewMode === "critix_editor",
      submenu: [
        {
          id: MenuItemId.FONT_BOLD,
          label: i18next.t("menu.format.font.bold"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_BOLD),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()
        },
        {
          id: MenuItemId.FONT_ITALIC,
          label: i18next.t("menu.format.font.italic"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_ITALIC),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()
        },
        {
          id: MenuItemId.FONT_UNDERLINE,
          label: i18next.t("menu.format.font.underline"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_UNDERLINE),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()
        },
        {
          id: MenuItemId.FONT_STRIKETHROUGH,
          label: i18next.t("menu.format.font.strikethrough"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_STRIKETHROUGH),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()
        },
        {
          id: MenuItemId.FONT_SUPERSCRIPT,
          label: i18next.t("menu.format.font.superscript"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_SUPERSCRIPT),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()
        },
        {
          id: MenuItemId.FONT_SUBSCRIPT,
          label: i18next.t("menu.format.font.subscript"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_SUBSCRIPT),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()
        },
        {
          id: MenuItemId.FONT_NPC,
          label: i18next.t("menu.format.font.npc"),
          accelerator: getKeyboardShortcut(MenuItemId.FONT_NPC),
          click: (menuItem: MenuItem): void => onClick(menuItem),
        },
        { type: "separator" },
        {
          label: i18next.t("menu.format.font.characterSpacing.label"),
          submenu: [
            {
              id: MenuItemId.FONT_CHARACTER_SPACING_NORMAL,
              label: i18next.t("menu.format.font.characterSpacing.normal"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CHARACTER_SPACING_NORMAL),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_CHARACTER_SPACING_TIGHTEN,
              label: i18next.t("menu.format.font.characterSpacing.tighten"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CHARACTER_SPACING_TIGHTEN),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_CHARACTER_SPACING_LOOSEN,
              label: i18next.t("menu.format.font.characterSpacing.loosen"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CHARACTER_SPACING_LOOSEN),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
          ],
        },
        {
          label: i18next.t("menu.format.font.ligature.label"),
          submenu: [
            {
              id: MenuItemId.FONT_LIGATURE_DEFAULT,
              label: i18next.t("menu.format.font.ligature.default"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_LIGATURE_DEFAULT),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_LIGATURE_NONE,
              label: i18next.t("menu.format.font.ligature.none"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_LIGATURE_NONE),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_LIGATURE_ALL,
              label: i18next.t("menu.format.font.ligature.all"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_LIGATURE_ALL),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
          ],
        },
        {
          label: i18next.t("menu.format.font.capitalization.label"),
          submenu: [
            {
              id: MenuItemId.FONT_CAPTALIZATION_ALL_CAPS,
              label: i18next.t("menu.format.font.capitalization.allCaps"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CAPTALIZATION_ALL_CAPS),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_CAPTALIZATION_SMALL_CAPS,
              label: i18next.t("menu.format.font.capitalization.smallCaps"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CAPTALIZATION_SMALL_CAPS),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_CAPTALIZATION_TITLE_CASE,
              label: i18next.t("menu.format.font.capitalization.titleCase"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CAPTALIZATION_TITLE_CASE),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_CAPTALIZATION_START_CASE,
              label: i18next.t("menu.format.font.capitalization.startCase"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CAPTALIZATION_START_CASE),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
            {
              id: MenuItemId.FONT_CAPTALIZATION_NONE,
              label: i18next.t("menu.format.font.capitalization.none"),
              accelerator: getKeyboardShortcut(MenuItemId.FONT_CAPTALIZATION_NONE),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled(),
            },
          ],
        },
      ],
    },
    {
      label: i18next.t("menu.format.text.label"),
      enabled: viewMode === "critix_editor" && isMainTextEditor,
      submenu: [
        {
          id: MenuItemId.TEXT_ALIGN_LEFT,
          label: i18next.t("menu.format.text.alignLeft"),
          accelerator: getKeyboardShortcut(MenuItemId.TEXT_ALIGN_LEFT),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled() && isMainTextEditor,
        },
        {
          id: MenuItemId.TEXT_ALIGN_CENTER,
          label: i18next.t("menu.format.text.alignCenter"),
          accelerator: getKeyboardShortcut(MenuItemId.TEXT_ALIGN_CENTER),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
          registerAccelerator: true,
        },
        {
          id: MenuItemId.TEXT_ALIGN_RIGHT,
          label: i18next.t("menu.format.text.alignRight"),
          accelerator: getKeyboardShortcut(MenuItemId.TEXT_ALIGN_RIGHT),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.TEXT_ALIGN_JUSTIFY,
          label: i18next.t("menu.format.text.justify"),
          accelerator: getKeyboardShortcut(MenuItemId.TEXT_ALIGN_JUSTIFY),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.TEXT_INCREASE_INDENT,
          label: i18next.t("menu.format.text.increaseIndent"),
          accelerator: getKeyboardShortcut(MenuItemId.TEXT_INCREASE_INDENT),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.TEXT_DECREASE_INDENT,
          label: i18next.t("menu.format.text.decreaseIndent"),
          accelerator: getKeyboardShortcut(MenuItemId.TEXT_DECREASE_INDENT),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          label: i18next.t("menu.format.text.spacing.label"),
          submenu: [
            {
              id: MenuItemId.TEXT_SPACING_SINGLE,
              label: i18next.t("menu.format.text.spacing.single"),
              accelerator: getKeyboardShortcut(MenuItemId.TEXT_SPACING_SINGLE),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
            },
            {
              id: MenuItemId.TEXT_SPACING_1_15,
              label: i18next.t("menu.format.text.spacing.1_15"),
              accelerator: getKeyboardShortcut(MenuItemId.TEXT_SPACING_1_15),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
            },
            {
              id: MenuItemId.TEXT_SPACING_ONE_AND_HALF,
              label: i18next.t("menu.format.text.spacing.oneAndHalf"),
              accelerator: getKeyboardShortcut(MenuItemId.TEXT_SPACING_ONE_AND_HALF),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
            },
            {
              id: MenuItemId.TEXT_SPACING_DOUBLE,
              label: i18next.t("menu.format.text.spacing.double"),
              accelerator: getKeyboardShortcut(MenuItemId.TEXT_SPACING_DOUBLE),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
            },
            { type: "separator" },
            {
              id: MenuItemId.CUSTOM_SPACING,
              label: i18next.t("customSpacing.title"),
              accelerator: getKeyboardShortcut(MenuItemId.CUSTOM_SPACING),
              click: (menuItem: MenuItem): void => onClick(menuItem),
              enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
            },
          ],
        },
      ],
    },
    {
      label: i18next.t("menu.format.list.label"),
      enabled: viewMode === "critix_editor" && isMainTextEditor,
      submenu: [
        {
          id: MenuItemId.NUMBER_BULLET,
          label: i18next.t("menu.format.list.number"),
          accelerator: getKeyboardShortcut(MenuItemId.NUMBER_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.UPPER_LETTER_BULLET,
          label: i18next.t("menu.format.list.maxLetter"),
          accelerator: getKeyboardShortcut(MenuItemId.UPPER_LETTER_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.LOW_LETTER_BULLET,
          label: i18next.t("menu.format.list.lowerLetter"),
          accelerator: getKeyboardShortcut(MenuItemId.LOW_LETTER_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.UPPER_ROMAN_BULLET,
          label: i18next.t("menu.format.list.maxRoman"),
          accelerator: getKeyboardShortcut(MenuItemId.UPPER_ROMAN_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.LOW_ROMAN_BULLET,
          label: i18next.t("menu.format.list.lowerRoman"),
          accelerator: getKeyboardShortcut(MenuItemId.LOW_ROMAN_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.POINT_BULLET,
          label: i18next.t("menu.format.list.point"),
          accelerator: getKeyboardShortcut(MenuItemId.POINT_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.CIRCLE_BULLET,
          label: i18next.t("menu.format.list.emptyPoint"),
          accelerator: getKeyboardShortcut(MenuItemId.CIRCLE_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.SQUARE_BULLET,
          label: i18next.t("menu.format.list.square"),
          accelerator: getKeyboardShortcut(MenuItemId.SQUARE_BULLET),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.RESUME_NUMBERING,
          label: i18next.t("menu.format.list.resumeNumbering"),
          accelerator: getKeyboardShortcut(MenuItemId.RESUME_NUMBERING),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
        {
          id: MenuItemId.PREVIOUS_NUMBERING,
          label: i18next.t("menu.format.list.continuePreviousNumbering"),
          accelerator: getKeyboardShortcut(MenuItemId.PREVIOUS_NUMBERING),
          click: (menuItem: MenuItem): void => onClick(menuItem),
          enabled: getTextFormattingMenuEnabled()&& isMainTextEditor,
        },
      ],
    },
    {
      id: MenuItemId.PAGE_NUMBER,
      label: i18next.t("menu.format.pageNumber.label"),
      accelerator: getKeyboardShortcut(MenuItemId.PAGE_NUMBER),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor",
    },
    {
      id: MenuItemId.OPEN_LINE_NUMBER_SETTINGS,
      label: i18next.t("menu.format.lineNumber.label"),
      accelerator: getKeyboardShortcut(MenuItemId.OPEN_LINE_NUMBER_SETTINGS),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor",
    },
    {
      id: MenuItemId.SECTIONS_STYLE,
      label: i18next.t("menu.format.sectionsStyle"),
      accelerator: getKeyboardShortcut(MenuItemId.SECTIONS_STYLE),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor",
    },
    {
      id: MenuItemId.OPEN_FOOTER_SETTINGS,
      label: i18next.t("menu.format.headerFooter.label"),
      accelerator: getKeyboardShortcut(MenuItemId.OPEN_FOOTER_SETTINGS),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor",
    },
    {
      id: MenuItemId.OPEN_TOC_SETTINGS,
      label: i18next.t("menu.format.toc.label"),
      accelerator: getKeyboardShortcut(MenuItemId.OPEN_TOC_SETTINGS),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor" && enableTocSettingsMenu,
    },
    {
      id: MenuItemId.CHANGE_TEMPLATE,
      label: i18next.t("menu.format.changeTemplate"),
      accelerator: getKeyboardShortcut(MenuItemId.CHANGE_TEMPLATE),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor",
    },
    {
      id: MenuItemId.LAYOUT_PAGE_SETUP,
      label: i18next.t("menu.format.layout.label"),
      accelerator: getKeyboardShortcut(MenuItemId.LAYOUT_PAGE_SETUP),
      click: (menuItem: MenuItem): void => onClick(menuItem),
      enabled: viewMode === "critix_editor",
    },
  ];

  return menu;
}
