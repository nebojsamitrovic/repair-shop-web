/**
 * Bridges an antd Table to the backend's paging contract — antd pages from 1 and sorts as
 * `{ field, order }`, the backend pages from 0 and wants `field,desc` — keeping it all in the URL so
 * a filtered list is a shareable link and filter state cannot drift from what is displayed.
 */
import type { TablePaginationConfig } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type FilterValue = string | string[] | number | undefined | null

interface Options {
    /** e.g. 'createdAt,desc' — must name a sortable property on the backend. */
    defaultSort?: string
    defaultSize?: number
    /** Query-string keys that carry filters rather than paging. */
    filterKeys: string[]
}

const PAGE = 'page'
const SIZE = 'size'
const SORT = 'sort'

const useTableQuery = <T>({ defaultSort = 'createdAt,desc', defaultSize = 20, filterKeys }: Options) => {
    const [searchParams, setSearchParams] = useSearchParams()

    const page = Number(searchParams.get(PAGE) ?? 0)
    const size = Number(searchParams.get(SIZE) ?? defaultSize)
    const sort = searchParams.get(SORT) ?? defaultSort

    const filters = useMemo(() => {
        const current: Record<string, FilterValue> = {}
        for (const key of filterKeys) {
            const values = searchParams.getAll(key)
            if (values.length > 1) current[key] = values
            else if (values.length === 1 && values[0] !== '') current[key] = values[0]
        }
        return current
    }, [searchParams, filterKeys])

    const params = useMemo(() => ({ page, size, sort, ...filters }), [page, size, sort, filters])

    /** Changing a filter resets to the first page — page 4 of the previous result means nothing. */
    const setFilters = useCallback(
        (next: Record<string, FilterValue>) => {
            setSearchParams((current) => {
                const updated = new URLSearchParams(current)
                updated.set(PAGE, '0')
                for (const [key, value] of Object.entries(next)) {
                    updated.delete(key)
                    if (value === undefined || value === null || value === '') continue
                    if (Array.isArray(value)) value.forEach((item) => updated.append(key, String(item)))
                    else updated.set(key, String(value))
                }
                return updated
            })
        },
        [setSearchParams]
    )

    const onTableChange = useCallback(
        (pagination: TablePaginationConfig, _filters: unknown, sorter: SorterResult<T> | SorterResult<T>[]) => {
            const active = Array.isArray(sorter) ? sorter[0] : sorter
            setSearchParams((current) => {
                const updated = new URLSearchParams(current)
                updated.set(PAGE, String((pagination.current ?? 1) - 1))
                updated.set(SIZE, String(pagination.pageSize ?? defaultSize))
                if (active?.order && active.field) {
                    updated.set(SORT, `${String(active.field)},${active.order === 'ascend' ? 'asc' : 'desc'}`)
                } else {
                    updated.set(SORT, defaultSort)
                }
                return updated
            })
        },
        [setSearchParams, defaultSize, defaultSort]
    )

    const paginationFor = useCallback(
        (totalElements = 0): TablePaginationConfig => ({
            current: page + 1,
            pageSize: size,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
        }),
        [page, size]
    )

    return { params, filters, setFilters, onTableChange, paginationFor }
}

export default useTableQuery
