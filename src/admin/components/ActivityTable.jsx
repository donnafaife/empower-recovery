// Generic table for one "recent activity" feed. `columns` is
// [{ key, label, render? }] - `render(row)` lets a caller format a cell
// (e.g. a formatted date) instead of showing the raw field value.
function ActivityTable({ title, columns, rows, emptyMessage }) {
  return (
    <div className="admin-table-card">
      <h3 className="admin-table-title">{title}</h3>
      {rows.length === 0 ? (
        <p className="admin-table-empty">{emptyMessage}</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ActivityTable
