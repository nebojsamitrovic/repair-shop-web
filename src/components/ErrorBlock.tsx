import { Alert } from 'antd'
import { useTranslation } from 'react-i18next'

import { toAppError } from 'api/errors'

/**
 * Renders whatever went wrong. The message comes from the error code where we have wording for it
 * and from the backend otherwise — the code is what we branch on, never the text.
 */
const ErrorBlock = ({ error }: { error: unknown }) => {
    const { t } = useTranslation()
    if (!error) return null

    const appError = toAppError(error)
    const key = `errors.${appError.code}`
    const translated = t(key)

    return (
        <Alert
            type={'error'}
            showIcon
            message={translated === key ? appError.message : translated}
            description={
                appError.violations.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {appError.violations.map((violation) => (
                            <li key={`${violation.field}-${violation.message}`}>
                                <strong>{violation.field}</strong>: {violation.message}
                            </li>
                        ))}
                    </ul>
                ) : null
            }
        />
    )
}

export default ErrorBlock
