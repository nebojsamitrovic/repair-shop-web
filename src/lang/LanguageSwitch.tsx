import { GlobalOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import { useTranslation } from 'react-i18next'

import { currentLanguage, LANGUAGES, setLanguage, type Language } from '.'

/** Two languages, so a dropdown rather than a modal. The choice is remembered per browser. */
const LanguageSwitch = () => {
    const { t } = useTranslation()
    const active = currentLanguage()

    return (
        <Dropdown
            menu={{
                selectable: true,
                selectedKeys: [active],
                items: LANGUAGES.map((language) => ({ key: language, label: t(`language.${language}`) })),
                onClick: ({ key }) => setLanguage(key as Language),
            }}
        >
            <a
                onClick={(event) => event.preventDefault()}
                aria-label={t('actions.change_language')}
                style={{ color: 'inherit' }}
            >
                <GlobalOutlined /> {active.toUpperCase()}
            </a>
        </Dropdown>
    )
}

export default LanguageSwitch
