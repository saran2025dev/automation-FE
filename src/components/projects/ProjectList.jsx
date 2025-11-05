import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import AssignUserDialog from "../ui/AssignUserDialog";

export default function ProjectList({
  projects = [],
  onViewSuites,
  onDeleteProject,
  user,
  userProjects
}) {
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "uniqueProjectId",
      },
      {
        Header: "Title",
        accessor: "name",
      },
      {
        Header: "Status",
        accessor: "isActive",
        Cell: ({ cell: { value } }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {value ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        Header: user?.role?.name?.toLowerCase() === "admin"? "Actions" : "Assigned on",
        Cell: ({ row }) => {
          const assignedInfo = userProjects?.find(
            (p) => p.project?.id === row.original.id
          );

          return user?.role?.name?.toLowerCase() === "admin" ? (
            <div className="flex gap-x-4">
              <AssignUserDialog
                project={row.original}
                trigger={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Assign
                  </button>
                }
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(row.original.id);
                }}
                className="btn btn-sm btn-outline-danger"
              >
                Delete
              </button>
            </div>
          ) : (
            <span className="text-gray-600 text-sm">
              {assignedInfo?.assignedAt
                ? new Date(assignedInfo.assignedAt)
                    .toLocaleString()
                    .split(",")[0]
                : "Not Assigned"}
            </span>
          );
        },
      },
    ],
    [onViewSuites, onDeleteProject]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: projects,
      },
      useSortBy
    );

  return (
    <div className="overflow-x-visible">
      <table
        {...getTableProps()}
        className="min-w-full bg-white border border-separate border-spacing-0"
      >
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key, ...headerProps } = headerGroup.getHeaderGroupProps();

            return (
              <tr
                key={key}
                {...headerProps}
                className="text-left bg-gray-100 border-b"
              >
                {headerGroup.headers.map((column) => {
                  const { key: columnKey, ...columnProps } =
                    column.getHeaderProps(column.getSortByToggleProps());

                  return (
                    <th
                      key={columnKey}
                      {...columnProps}
                      className="py-2 px-4 font-semibold text-gray-700 cursor-pointer"
                    >
                      {column.render("Header")}
                      <span className="inline-block ml-2">
                        <FiChevronUp
                          className={`${
                            column.isSorted && !column.isSortedDesc
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        />
                        <FiChevronDown
                          className={`${
                            column.isSorted && column.isSortedDesc
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        />
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const { key, ...rowProps } = row.getRowProps();

            return (
              <tr
                key={key}
                {...rowProps}
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onViewSuites(row.original.id)}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className="py-2 px-4 text-sm border-t text-gray-600"
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
