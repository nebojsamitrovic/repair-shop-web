import type { ThemeConfig } from 'antd'

/** System typography, hairline borders, generous radii, almost no shadow — set once so screens inherit it. */
export const palette = {
    canvas: '#f4f5f9',
    surface: '#ffffff',
    surfaceMuted: '#f7f8fb',
    surfaceGlass: 'rgba(255, 255, 255, 0.72)',
    surfaceGlassStrong: 'rgba(255, 255, 255, 0.86)',

    accent: '#0071e3',
    accentSoft: 'rgba(0, 113, 227, 0.1)',

    text: '#1d1d1f',
    textSecondary: '#6e6e73',
    textTertiary: '#86868b',

    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.14)',
    borderGlass: 'rgba(255, 255, 255, 0.55)',

    success: '#248a3d',
    warning: '#b25000',
    danger: '#d70015',

    sidebar: '#1c1c1e',
    sidebarText: 'rgba(255, 255, 255, 0.78)',
    sidebarTextStrong: 'rgba(255, 255, 255, 0.95)',
    sidebarTextMuted: 'rgba(255, 255, 255, 0.42)',
    sidebarHoverBg: 'rgba(255, 255, 255, 0.08)',
    sidebarAccent: '#0a84ff',
    sidebarSelectedBg: 'rgba(255, 255, 255, 0.15)',
} as const

const fontStack =
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", Roboto, sans-serif'

export const theme: ThemeConfig = {
    token: {
        colorPrimary: palette.accent,
        colorInfo: palette.accent,
        colorSuccess: palette.success,
        colorWarning: palette.warning,
        colorError: palette.danger,

        colorText: palette.text,
        colorTextSecondary: palette.textSecondary,
        colorTextTertiary: palette.textTertiary,
        colorBgLayout: palette.canvas,
        colorBgContainer: palette.surface,
        colorBorder: palette.border,
        colorBorderSecondary: palette.border,

        fontFamily: fontStack,
        fontSize: 14,
        fontSizeHeading2: 30,
        fontSizeHeading3: 24,
        fontSizeHeading4: 19,
        lineHeight: 1.47,

        borderRadius: 10,
        borderRadiusLG: 14,
        borderRadiusSM: 7,

        controlHeight: 36,
        controlHeightLG: 44,
        controlHeightSM: 28,

        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)',
        boxShadowSecondary: '0 4px 24px rgba(0, 0, 0, 0.08)',
        boxShadowTertiary: '0 1px 2px rgba(0, 0, 0, 0.04)',

        wireframe: false,
    },
    components: {
        Layout: {
            headerBg: 'transparent',
            headerHeight: 52,
            headerPadding: '0 20px',
            siderBg: 'transparent',
            bodyBg: 'transparent',
        },
        Menu: {
            itemBg: 'transparent',
            subMenuItemBg: 'transparent',
            itemSelectedBg: palette.accentSoft,
            itemSelectedColor: palette.accent,
            itemHoverBg: 'rgba(0, 0, 0, 0.04)',
            itemColor: palette.text,
            itemHeight: 40,
            itemMarginInline: 8,
            itemMarginBlock: 2,
            itemBorderRadius: 10,
            groupTitleColor: palette.textTertiary,
            groupTitleFontSize: 13,
            iconSize: 22,
            iconMarginInlineEnd: 18,
            collapsedIconSize: 22,

            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemColor: palette.sidebarText,
            darkItemHoverBg: palette.sidebarHoverBg,
            darkItemHoverColor: palette.sidebarTextStrong,
            darkItemSelectedBg: palette.sidebarSelectedBg,
            darkItemSelectedColor: palette.sidebarTextStrong,
            darkGroupTitleColor: palette.sidebarTextMuted,
            darkPopupBg: 'rgba(40, 40, 44, 0.86)',
        },
        Card: {
            paddingLG: 22,
            headerFontSize: 15,
            headerHeight: 50,
            colorBorderSecondary: palette.border,
        },
        Table: {
            headerBg: 'transparent',
            headerColor: palette.textSecondary,
            headerSplitColor: 'transparent',
            borderColor: palette.border,
            cellPaddingBlock: 14,
            rowHoverBg: 'rgba(0, 0, 0, 0.02)',
        },
        Button: { fontWeight: 500, primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none' },
        Input: { paddingBlock: 6 },
        Select: { optionSelectedBg: palette.accentSoft },
        Tag: { defaultBg: 'rgba(0, 0, 0, 0.05)', defaultColor: palette.textSecondary },
        Statistic: { titleFontSize: 13, contentFontSize: 26 },
        Descriptions: { labelBg: palette.surfaceMuted },
        Segmented: { itemSelectedBg: palette.surface, trackBg: 'rgba(0, 0, 0, 0.05)' },
        Modal: { borderRadiusLG: 16 },
        Tooltip: { colorBgSpotlight: 'rgba(30, 30, 32, 0.92)' },
    },
}
