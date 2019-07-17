import React from "react"
import classNames from "classnames"

import "../../styles/search.css"
import { noop } from "../../utils"

import Switch from "react-switch"

class SearchBox extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isShowColumner: false,
      hoveredIndex: -1
    }

    this.searchInput = React.createRef()
  }

  componentDidMount() {
    this.searchInput.current.focus()
  }

  render() {
    const { state } = this

    const {
      searchText,

      onResetSearch,
      onResetSearchAndSort,
      onInputChange,

      isPosAbs = true,

      cols,
      hiddenColIndexes = [],
      addIndexToHiddenCols
    } = this.props

    return (
      <div
        className={classNames("table-search input-group", { posAbs: isPosAbs })}
      >
        <div className="input-group-prepend pos-rel columner">
          <button
            className="btn btn-warning btn-sm "
            onMouseOver={noop}
            onMouseOut={noop}
          >
            <i className="fas fa-table" />
            <div className="columner__area">
              <div className="columner__area-overflow">
                {cols.map((col, i) => (
                  <div
                    onMouseOut={() => {
                      this.setState({ hoveredIndex: -1 })
                    }}
                    onMouseOver={() => {
                      this.setState({ hoveredIndex: i })
                    }}
                    key={col.name}
                    className="col-toggler-row"
                  >
                    <div>{state.hoveredIndex === i ? col.name : col.label}</div>
                    <div>
                      <Switch
                        onChange={() => {
                          addIndexToHiddenCols(i)
                        }}
                        checked={!hiddenColIndexes.includes(i)}
                        height={15}
                        width={32}
                        className="react-switch"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </button>
        </div>

        <input
          ref={this.searchInput}
          type="text"
          value={searchText}
          className="form-control form-control-sm no-box-shadow"
          placeholder="Search"
          onChange={onInputChange}
        />
        <div className="input-group-append">
          <button
            className="btn btn-primary btn-sm"
            onClick={onResetSearch}
            onDoubleClick={onResetSearchAndSort}
            title="Clear Filter/Default Sort"
          >
            <i className="fas fa-redo-alt" />
          </button>
        </div>
      </div>
    )
  }
}

export default SearchBox
