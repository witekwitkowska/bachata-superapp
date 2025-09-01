import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"
import { Input } from "../ui/input"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "../ui/select"
import React from "react"

interface SelectorOption {
    name: string;
    values: string[];
    displayLabels?: Record<string, string>;
}

export interface RowSelectionInfo<TData> {
    selectedCount: number;
    selectedRows: TData[];
    selectedRowIds: string[];
    allSelected: boolean;
    someSelected: boolean;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    loading?: boolean;
    hasFilters?: boolean;
    hasPagination?: boolean;
    hasSorting?: boolean;
    filters?: string[];
    hasSelectors?: boolean;
    selectors?: SelectorOption[];
    onRowSelectionChange?: (selectionInfo: RowSelectionInfo<TData>) => void;
    enableRowSelection?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    loading = false,
    hasFilters = false,
    hasPagination = false,
    hasSorting = false,
    filters = [],
    hasSelectors = false,
    selectors = [],
    onRowSelectionChange,
    enableRowSelection = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

    // Filter data based on selections
    const filteredData = React.useMemo(() => {
        return data.filter((item: TData) => {
            const itemRecord = item as Record<string, unknown>;
            // Check each applied selector
            for (const [key, value] of Object.entries(selectedFilters)) {
                if (!value || value === "all") continue;

                if (key === "published") {
                    if (value === "active" && itemRecord.published !== true) return false;
                    if (value === "inactive" && itemRecord.published !== false) return false;
                }
                else if (key === "type" && value !== "all") {
                    if (itemRecord.type !== value) return false;
                }
                else if (key === "isPaid" && value !== "all") {
                    const isPaid = value === "paid";
                    if (itemRecord.isPaid !== isPaid) return false;
                }
            }

            // Global filter for search
            if (globalFilter) {
                const searchTerm = globalFilter.toLowerCase();
                let searchableText = '';

                // For events
                if (itemRecord.title || itemRecord.description) {
                    searchableText = `${itemRecord.title || ''} ${itemRecord.description || ''}`;
                }
                // For other data types, search in all text fields
                else {
                    searchableText = Object.values(itemRecord)
                        .filter(value => typeof value === 'string')
                        .join(' ');
                }

                if (!searchableText.toLowerCase().includes(searchTerm)) return false;
            }

            return true;
        });
    }, [data, selectedFilters, globalFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: hasPagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: hasSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: hasFilters ? getFilteredRowModel() : undefined,
        onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
        enableRowSelection: enableRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection: enableRowSelection ? rowSelection : {},
        },
    });

    // Effect to call the callback when row selection changes
    useEffect(() => {
        if (enableRowSelection && onRowSelectionChange) {
            const selectedRowIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
            const selectedRows = selectedRowIds.map(id => filteredData[Number.parseInt(id, 10)]).filter(Boolean);
            const selectedCount = selectedRows.length;
            const totalRows = filteredData.length;
            const allSelected = totalRows > 0 && selectedCount === totalRows;
            const someSelected = selectedCount > 0 && selectedCount < totalRows;

            const selectionInfo: RowSelectionInfo<TData> = {
                selectedCount,
                selectedRows,
                selectedRowIds,
                allSelected,
                someSelected,
            };

            onRowSelectionChange(selectionInfo);
        }
    }, [rowSelection, filteredData, enableRowSelection, onRowSelectionChange]);

    // Helper functions for row selection
    const getSelectedRowsCount = () => {
        const selectedRowIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
        return selectedRowIds.length;
    };

    const clearSelection = () => {
        if (enableRowSelection) {
            setRowSelection({});
        }
    };

    const selectAll = () => {
        if (enableRowSelection) {
            const allRowsSelection: Record<string, boolean> = {};
            filteredData.forEach((_, index) => {
                allRowsSelection[index.toString()] = true;
            });
            setRowSelection(allRowsSelection);
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            {hasFilters && (
                <div className="flex flex-col sm:flex-row sm:items-center py-4 gap-2">
                    <Input
                        placeholder="Search by title, description..."
                        value={globalFilter}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
                        className="max-w-sm"
                    />

                    {hasSelectors && selectors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectors.map((selector) => (
                                <Select
                                    key={selector.name}
                                    value={selectedFilters[selector.name] || "all"}
                                    onValueChange={(value: string) =>
                                        setSelectedFilters({ ...selectedFilters, [selector.name]: value })
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={getFilterLabelByName(selector.name)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {selector.values.map((value) => (
                                            <SelectItem key={value} value={value}>
                                                {selector.displayLabels?.[value] || value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, index) => (
                            <TableRow
                                className={index % 2 === 0 ? 'dark:bg-[#29292d] bg-muted' : 'dark:bg-[#443745] bg-primary'}
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="dark:text-muted-foreground text-[#374151]">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {hasPagination && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((pageNumber) => (
                            <Button
                                key={pageNumber}
                                variant={table.getState().pagination.pageIndex + 1 === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => table.setPageIndex(pageNumber - 1)}
                            >
                                {pageNumber}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

// Helper function to get descriptive labels for filters
function getFilterLabelByName(name: string): string {
    switch (name) {
        case "published": return "Publication Status";
        case "type": return "Event Type";
        case "isPaid": return "Payment Status";
        default: return name;
    }
}