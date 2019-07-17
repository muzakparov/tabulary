import React, { PureComponent } from "react"
import classNames from "classnames"

import { setClipboard } from "../../utils/clipboard"
import { UNIQ_INDEX } from "../../constants"

class Tbody extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      numToIdIsShows: [],
      currRowInd: null
    }
    this.w = null

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
  }

  componentDidMount() {
    const { rows } = this.props

    const numToIdIsShows = new Array(rows.length).fill(false)

    this.setState({
      numToIdIsShows
    })

    if (!this.w) {
      this.w = window
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { props } = this

    if (prevProps.rows.length !== props.rows.length) {
      const numToIdIsShows = new Array(props.rows.length).fill(false)

      this.setState({
        numToIdIsShows
      })
    }
  }

  handleMouseDown(e, currRowInd) {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    const numToIdIsShows = this.state.numToIdIsShows.slice()
    numToIdIsShows[currRowInd] = true

    this.setState({
      numToIdIsShows,
      currRowInd
    })
  }

  handleMouseLeave(e, rowInd) {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    const numToIdIsShows = this.state.numToIdIsShows.slice()
    numToIdIsShows[rowInd] = false

    this.setState({
      numToIdIsShows
    })
  }

  _copyID(e, text) {
    e.stopPropagation()
    setClipboard(window, text)
  }

  render() {
    const { numToIdIsShows } = this.state

    const {
      rows,
      cols,
      onRowSelect,
      selectedRow,
      onRowDoubleClick,

      idName,

      isShowIdsAsRowNum //new prop
    } = this.props
    //temp
    // return (
    // 	<tbody>
    // 		<tr>
    // 			<td>X</td>
    // 			<td>X</td>
    // 		</tr>
    // 		<tr>
    // 			<td>X</td>
    // 			<td>X</td>
    // 		</tr>
    // 	</tbody>
    // )

    const trList = rows.map((row, rowInd) => {
      let _rowClass = ""

      const tdList = cols
        .map((col, colInd) => {
          let _tdClass = ""

          if (col.isHidden) {
            if (col.getRowStyleClass) {
              _rowClass = col.getRowStyleClass(row, col)
            }

            return col
          }

          const isZero = row[col.name] === 0 || row[col.name] === "0"

          let tdCell

          if (col.getTdStyleClass) {
            _tdClass = col.getTdStyleClass(row, col)
          }

          if (col.name === "is_locked") {
            let iconEl

            if (row.is_locked) {
              iconEl = <i className="fas fa-lock" aria-hidden="true" />
            } else {
              iconEl = <i className="fas fa-edit" aria-hidden="true" />
            }

            return (
              <td className={`py-1 ${_tdClass}`} key={row[idName] + " icon"}>
                {iconEl}
              </td>
            )
          } else if (col.component) {
            const component = col.component(row, col)
            tdCell = component
          } else if (col.directValue) {
            tdCell = col.directValue(row, col)

            if (col.name === idName) {
              const rowId = row[idName]
              if (isShowIdsAsRowNum) {
                if (numToIdIsShows[rowInd]) {
                  tdCell = (
                    <div
                      onClick={e => {
                        // console.log('shortId')
                        e.preventDefault()
                        e.stopPropagation()
                        e.nativeEvent.stopImmediatePropagation()
                        this._copyID(e, rowId)
                        e.target.classList.add("bounceIn")
                      }}
                      className="id-cover-popup animated"
                    >
                      {rowId}
                    </div>
                  )
                }

                return (
                  <td
                    key={col.name}
                    className={`id-td py-1 ${_tdClass}`}
                    onMouseOver={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                      this.handleMouseDown(e, rowInd)
                    }}
                    onMouseLeave={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                      this.handleMouseLeave(e, rowInd)
                    }}
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                    }}
                  >
                    {tdCell}
                  </td>
                )
              } else {
                tdCell = (
                  <div
                    onClick={e => {
                      // console.log('shortId')
                      e.preventDefault()
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                      this._copyID(e, rowId)
                    }}
                  >
                    {row[idName]}
                  </div>
                )

                return (
                  <td
                    key={col.name}
                    className={`id-td py-1 ${_tdClass}`}
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                      this._copyID(e, rowId)
                    }}
                  >
                    {tdCell}
                  </td>
                )
              }
            }
          } else if (typeof row[col.name] === "boolean") {
            //"active", "core" cols
            const strVal =
              row[col.name] === undefined ? null : row[col.name].toString()
            tdCell = strVal
          } else if (col.name === idName) {
            const rowId = row[idName]
            if (isShowIdsAsRowNum) {
              if (isShowIdsAsRowNum && !numToIdIsShows[rowInd]) {
                tdCell = row[UNIQ_INDEX]
              } else {
                tdCell = (
                  <div
                    onClick={e => {
                      // console.log('shortId')
                      e.preventDefault()
                      e.stopPropagation()
                      e.nativeEvent.stopImmediatePropagation()
                      this._copyID(e, rowId)
                      e.target.classList.add("bounceIn")
                    }}
                    className="id-cover-popup animated"
                  >
                    {rowId}
                  </div>
                )
              }

              return (
                <td
                  key={col.name}
                  className={`id-td py-1 ${_tdClass}`}
                  onMouseOver={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    this.handleMouseDown(e, rowInd)
                  }}
                  onMouseLeave={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    this.handleMouseLeave(e, rowInd)
                  }}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                  }}
                >
                  {tdCell}
                </td>
              )
            } else {
              tdCell = (
                <div
                  onClick={e => {
                    // console.log('shortId')
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    this._copyID(e, rowId)
                  }}
                >
                  {row[idName]}
                </div>
              )

              return (
                <td
                  key={col.name}
                  className={`id-td py-1 ${_tdClass}`}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    this._copyID(e, rowId)
                  }}
                >
                  {tdCell}
                </td>
              )
            }
          } else if (isZero) {
            tdCell = null
          } else {
            tdCell = row[col.name]
          }

          if (col.getRowStyleClass) {
            _rowClass = col.getRowStyleClass(row, col)
          }

          return (
            <td className={`py-1  ${_tdClass}`} key={col.name}>
              {tdCell}
            </td>
          )
        })
        .filter(col => !col.isHidden)
      const _isSelectedClass =
        selectedRow === row
          ? "text-center selected hoverLink"
          : "text-center hoverLink"

      // const _isSelectedClass = "text-center hoverLink"
      return (
        <tr
          key={row[idName]}
          className={`${_isSelectedClass} ${_rowClass}`}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
            // console.log('ROW CLICK')
            onRowSelect(row)
          }}
          onDoubleClick={e => {
            e.stopPropagation()
            onRowDoubleClick(row)
          }}
        >
          {tdList}
        </tr>
      )
    })

    return <tbody>{trList}</tbody>
  }
}

export default Tbody
