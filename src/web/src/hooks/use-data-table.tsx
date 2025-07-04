import { useMemo } from "react"

export type SortOrder = "asc" | "desc"

interface UseDataTableOptions<T> {
  data: T[] | undefined
  search: string
  searchFields: (keyof T)[]
  sortKey: keyof T
  sortOrder: SortOrder
  currentPage: number
  itemsPerPage: number
}

export function useDataTable<T extends Record<string, any>>(options: UseDataTableOptions<T>) {
  const {
    data,
    search,
    searchFields,
    sortKey,
    sortOrder,
    currentPage,
    itemsPerPage,
  } = options

  // Filter, sort, paginate
  const processedData = useMemo(() => {
    let filtered = (data ?? []).filter((item) =>
      searchFields.some((field) =>
        item[field]?.toString().toLowerCase().includes(search.toLowerCase())
      )
    )

    filtered.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [data, search, searchFields, sortKey, sortOrder])

  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage))

  const pagedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return { processedData, pagedData, totalPages }
}
