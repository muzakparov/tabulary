import React from "react"

const Thead = ({
  sorted,
  sortable,

  cols,
  groups,
  onToggleColSort
}) => {
  const groupsList = groups.map((group, i) => {
    const thList = group.map((labelObj, j) => {
      console.log(labelObj)
      return (
        <th
          key={labelObj.label}
          colSpan={labelObj.colSpan}
          className="thead-cell"
          title={labelObj.title ? labelObj.title : null}
        >
          {labelObj.label}
        </th>
      )
    })

    return <tr key={i}>{thList}</tr>
  })

  const thList = cols
    .filter(col => !col.isHidden)
    .map(col => {
      let _icon

      let _sortIconMap = {
        asc: <i className="fas fa-sort-amount-down sort-arrow" />,
        desc: <i className="fas fa-sort-amount-up sort-arrow" />
      }

      const _sortable =
        sortable && (typeof col.sortable === "undefined" || col.sortable)

      const sortedCol = sorted.filter(sort => {
        const isMatch = sort.name === col.name

        return isMatch && _sortable
      })

      if (sortedCol.length && sortable) {
        const sortOrder = sortedCol[0].desc ? "desc" : "asc"
        _icon = _sortIconMap[sortOrder]
      } else {
        // _icon=null
        _icon = <i className="fas fa-exchange-alt no-sort-arrow invisible" />
      }

      if (col.sortable) {
        return (
          <th
            key={col.name}
            className={"thead-cell sticky_header hoverLink"}
            title={col.title ? col.title : null}
          >
            <span>{col.label}</span>
          </th>
        )
      }

      if (!_sortable) {
        return (
          <th
            key={col.name}
            className={"thead-cell sticky_header hoverLink"}
            title={col.title ? col.title : null}
          >
            <span>
              {col.label}
              {_icon}
            </span>
          </th>
        )
      }

      return (
        <th
          key={col.name}
          className={"thead-cell sticky_header hoverLink"}
          onClick={e => {
            const isShiftKey = e.shiftKey
            onToggleColSort(e, col, isShiftKey)
          }}
          title={col.title ? col.title : null}
        >
          <span>
            {col.label}
            {_icon}
          </span>
        </th>
      )
    })

  return (
    <thead>
      {groupsList}
      <tr className="thead-row align-middle">{thList}</tr>
    </thead>
  )
}

export default Thead
