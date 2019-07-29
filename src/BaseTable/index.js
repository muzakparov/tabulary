import React, { Component } from "react"
import classNames from "classnames"

import "../../styles/baseTable.css"

import propTypes from "./propTypes"
import defaultProps from "./defaultProps"

import { UNIQ_INDEX, COEFF_MAP } from "../../constants"

import Thead from "./Thead"
import Tbody from "./Tbody"
import SearchBox from "./SearchBox"
import { getLabelsOnTheSameLevel } from "./utils"

class BaseTable extends Component {
  constructor(props) {
    super(props)

    this.firstTableChild = null
    this.baseTableRef = React.createRef()
    // this.updateCount = 0
    // this.renderCount = 0
    this.toggleSearchShortCut = null
    // this.clickOutsideSearch=null

    this.shouldSortInRender = true
    this.hasRowsChanged = false

    const compareByMethodsMap = {}
    const colsWithCmp = props.cols.filter(
      col => col.compareByMethod !== undefined
    )
    //name:compareByMethod
    colsWithCmp.forEach(col => {
      compareByMethodsMap[col.name] = col.compareByMethod
    })

    this.compareByMethodsMap = compareByMethodsMap

    this.state = {
      sorted: props.defaultSorted,
      sortOrder: props.defaultSortOrderDesc ? "desc" : "asc",
      sortedAndIndexed_Rows: [],

      selectedCol: props.defaultSelectedCol,

      searchText: "",
      isShowSearch: true,

      currPageIndex: 0,
      startPageIndex: 0,

      hiddenColIndexes: []
    }

    this.addIndexToHiddenCols = this.addIndexToHiddenCols.bind(this)

    this.toggleColSort = this.toggleColSort.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.resetSearchAndSort = this.resetSearchAndSort.bind(this)
    this.resetSearch = this.resetSearch.bind(this)

    this._filter = this._filter.bind(this)
    this._findTrueMatch = this._findTrueMatch.bind(this)

    this.handlePageClick = this.handlePageClick.bind(this)
    this.jumpUpPage = this.jumpUpPage.bind(this)
    this.jumpDownPage = this.jumpDownPage.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.prevPage = this.prevPage.bind(this)
    this.goFirstPage = this.goFirstPage.bind(this)
    this.goLastPage = this.goLastPage.bind(this)

    // generalize compare(s)
    this._getCompare = this._getCompare.bind(this)
    this._cmp = props.defaultCompareByMethod || this._cmp.bind(this)
  }

  componentDidMount() {
    const { props, state } = this

    this.toggleSearchShortCut = e => {
      if (e.ctrlKey && (e.key === " " || e.key === "Spacebar")) {
        console.log("Ctrl+Spacebar to show Search Component")

        this.setState(prevState => ({
          isShowSearch: !prevState.isShowSearch
        }))
      }
      // else if(e.key==='Escape' || e.keyCode===27){
      // 	this.setState({
      // 		isShowSearch: false
      // 	})
      // }
    }

    window.addEventListener("keydown", this.toggleSearchShortCut)

    // this.clickOutsideSearch=(e) => {
    // 	if (!state.searchText.length &&
    // 		(
    // 			e.target.parentNode !== window.document.querySelector('.table-search') &&
    // 			e.target.parentNode !== window.document.querySelector('.table-search button')
    // 		)
    // 	) {

    // 		console.log('click', e.target.parentNode)

    // 		this.setState({
    // 			isShowSearch: false,
    // 		})
    // 	}
    // }

    // window.addEventListener('click', this.clickOutsideSearch)
    this.firstTableChild = this.baseTableRef.current.firstChild

    this._checkStyle(1)

    let sortedAndIndexed_Rows = props.rows.slice()

    if (state.sorted.length > 0 && props.sortable) {
      sortedAndIndexed_Rows = sortedAndIndexed_Rows.sort(
        this._getCompare(state.sorted[0], 0)
      )
    }

    if (props.isShowIdsAsRowNum) {
      sortedAndIndexed_Rows = sortedAndIndexed_Rows.map((row, i) => {
        return {
          ...row,
          [UNIQ_INDEX]: i
        }
      })
    }

    this.shouldSortInRender = false

    this.setState({
      sortedAndIndexed_Rows
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { idName, rows, cols, selectedRow } = this.props
    // console.log("selectedRow", selectedRow)
    // console.log("selectedRow", nextProps.selectedRow)
    /*
			when to index:
				- during first load

			what if row is added(1) or subtracted(2): 
				- (1) reindex by default sort
				- (2) reindex by default sort
			
			what if one of row key values change:
				- dont reindex just [swap] values 
				- could be many	keys that changed

			what if row ordering changes
				- compare after default sorting both

			//hasRowValuesChanged?	if it is not return false
			
		*/

    if (
      cols.length !== nextProps.cols.length ||
      selectedRow !== nextProps.selectedRow
    ) {
      return true
    }

    if (
      rows.length !== nextProps.rows.length ||
      this.state.sortedAndIndexed_Rows.length !=
        nextState.sortedAndIndexed_Rows.length
    ) {
      return true
    }

    if (this.state !== nextState) return true

    //TODO later
    // const isSameCols = cols.reduce((colsAcc, col, i) => {
    // 	const isSameRowVals = Object.keys(row).reduce((rowAcc, key) => {
    // 		const isSameRowVal = (row[key] === nextProps.rows[i][key])
    // 		return isSameRowVal && rowAcc
    // 	}, true)

    // 	return isSameRowVals && rowsAcc
    // 	//didnt change
    // }, true)

    const isColsNameSame = cols.reduce((colsAcc, col, i) => {
      const isSameColName = cols[i].name === nextProps.cols[i].name

      return isSameColName && colsAcc
      //didnt change
    }, true)

    const isSameRows = rows.reduce((rowsAcc, row, i) => {
      const isSameRowVals = Object.keys(row).reduce((rowAcc, key) => {
        const isSameRowVal = row[key] === nextProps.rows[i][key]
        return isSameRowVal && rowAcc
      }, true)

      return isSameRowVals && rowsAcc
      //didnt change
    }, true)

    if (
      isColsNameSame &&
      isSameRows &&
      this.props.tableFixedClass === nextProps.tableFixedClass
    ) {
      // console.log('SAME ROWS BT', isSameRows)
      return false
    }

    this.hasRowsChanged = true

    // if (nextState.sortedAndIndexed_Rows !== this.state.sortedAndIndexed_Rows) {
    // 	console.log('shouldComponentUpdate nextState.sortedAndIndexed_Rows !== this.state.sortedAndIndexed_Rows', nextState.sortedAndIndexed_Rows !== this.state.sortedAndIndexed_Rows)

    // 	return true
    // }

    return true
  }

  componentDidUpdate(prevProps, prevState) {
    const { props, state } = this
    const { selectedCol } = this.state

    const { idName, rows, cols, selectedRow } = this.props
    this._checkStyle(2)

    // this.updateCount++
    // console.log('\n\nUPDATE COUNT\n\n', this.updateCount)

    // console.log('checks in componentDidUpdate', prevState.sortOrder, this.state.sortOrder)

    // console.log('componentDidUpdate after check', prevProps.rows.length !== rows.length, rows[0] ? rows[0].name : null, prevProps.rows[0] ? prevProps.rows[0].name : null, '\n\n')
    // console.log('componentDidUpdate after check Conditions', prevProps.rows.length !== rows.length, prevState.sortedAndIndexed_Rows !== state.sortedAndIndexed_Rows, '\n\n')

    if (prevProps.rows.length !== rows.length || this.hasRowsChanged) {
      // console.log('INSIDE', rows[0])

      let sortedAndIndexed_Rows = props.rows.slice()

      if (state.sorted.length > 0 && props.sortable) {
        sortedAndIndexed_Rows = sortedAndIndexed_Rows
          .sort(this._getCompare(state.sorted[0], 0))
          .map((row, i) => {
            return {
              ...row,
              [UNIQ_INDEX]: i
            }
          })
      }

      if (props.isShowIdsAsRowNum && !this.hasRowsChanged) {
        sortedAndIndexed_Rows = sortedAndIndexed_Rows.map((row, i) => {
          return {
            ...row,
            [UNIQ_INDEX]: i
          }
        })
      }

      this.shouldSortInRender = false
      this.hasRowsChanged = false

      this.setState({
        sortedAndIndexed_Rows
      })
    } else {
      this.shouldSortInRender = true
    }
  }

  componentWillUnmount() {
    // console.log("BaseTable componentWillUnmount")
    window.addEventListener("keydown", this.toggleSearchShortCut)

    // window.addEventListener('click', this.clickOutsideSearch)
  }

  _checkStyle = () => {
    if (this.firstTableChild.className.includes("table-search")) {

      if (
        this.baseTableRef.current.previousSibling &&
        parseFloat(this.baseTableRef.current.previousSibling.offsetHeight) >= 16
      ) {
        // console.log('DONE 2')
        if (this.baseTableRef.current.style.marginTop !== "0px") {
          // console.log(this.baseTableRef.current.style.marginTop)

          this.baseTableRef.current.style.marginTop = "0px"
          // console.log('isnide')
        }
      } else if (this.baseTableRef.current.style.marginTop !== "16px") {
        // console.log('DONE 3')
        this.baseTableRef.current.style.marginTop = "16px"
      }
      // console.log('EXT', this.baseTableRef.current.style.marginTop)
    } else if (this.baseTableRef.current.style.marginTop !== "0px") {
      this.baseTableRef.current.style.marginTop = "0px"
      // console.log('DONE *')
    }
  }

  toggleColSort(e, selectedCol, isShiftKey) {
    e.preventDefault()

    const { props, state } = this

    if (!props.sortable) {
      return
    }

    let sorted

    if (!props.rows.length) return

    const sortOrders = ["asc", "desc"]
    // const ind = sortOrders.indexOf(state.sortOrder) ? 0 : 1
    // const sortOrder = sortOrders[ind]

    let initDesc
    if (selectedCol.defaultSortOrderDesc !== undefined) {
      initDesc = selectedCol.defaultSortOrderDesc
    } else {
      initDesc = props.defaultSortOrderDesc
    }

    if (state.sorted.length) {
      const selColSorted = state.sorted.filter(
        sort => sort.name === selectedCol.name
      )

      if (isShiftKey && props.isMultiSort) {
        console.log("%c         ", "height:1000px;background:red;")

        // state.sorted.concat
        if (selColSorted.length === 1) {
          sorted = state.sorted
            .map(sort => {
              if (sort.name === selectedCol.name) {
                if (sort.desc === initDesc) {
                  return { ...sort, desc: !initDesc }
                } else if (sort.desc === !initDesc) {
                  return { ...sort, desc: "none" }
                }
              }

              return sort
            })
            .filter(sort => sort.desc !== "none")
        } else {
          const sort = {
            name: selectedCol.name,
            desc: initDesc
          }
          sorted = state.sorted.concat(sort)
          // console.log(state.sorted, sorted)
          // throw "stop"
        }
      } else if (isShiftKey) {
        sorted = state.sorted
          .map(sort => {
            if (sort.name === selectedCol.name) {
              if (sort.desc === initDesc) {
                return { ...sort, desc: !initDesc }
              } else if (sort.desc === !initDesc) {
                return { ...sort, desc: "none" }
              }
            }
            return sort
          })
          .filter(sort => sort.desc !== "none")
      } else {
        let desc
        if (selColSorted.length === 1) {
          desc = !selColSorted[0].desc
        } else if (selColSorted.length === 0) {
          desc = initDesc
        } else {
          throw new Error("sorted matched with more than 1 column name")
        }

        sorted = [
          {
            name: selectedCol.name,
            desc: desc
          }
        ]

        if (selectedCol.sortedWith) {
          let prependSorted
          let nextSortedWith
          const { sortedWith } = selectedCol
          const sortedWithLen = selectedCol.sortedWith.length
          for (let i = 0; i < sortedWithLen; i++) {
            nextSortedWith = sortedWith[i]
            if (nextSortedWith.isSameSortOrder) {
              prependSorted = {
                name: nextSortedWith.name,
                desc: desc
              }
            } else {
              prependSorted = {
                name: nextSortedWith.name,
                desc: !desc
              }
            }

            sorted.push(prependSorted)
          }
        }
      }
    } else {
      sorted = [
        {
          name: selectedCol.name,
          desc: initDesc
        }
      ]
    }

    props.onSortedChange(e, sorted, selectedCol, isShiftKey)

    this.setState({
      // sortOrder,
      selectedCol,
      sorted
    })
  }

  handleInputChange(e) {
    const _searchText = e.target.value

    this.setState({
      searchText: _searchText
    })
  }

  resetSearchAndSort() {
    const { props, state } = this

    this.setState({
      searchText: "",
      sorted: props.defaultSorted,
      selectedCol: {}
    })
  }

  resetSearch() {
    const { props, state } = this

    this.setState({
      searchText: ""
    })
  }

  addIndexToHiddenCols(ind) {
    const { state } = this

    let hiddenColIndexes
    if (state.hiddenColIndexes.indexOf(ind) > -1) {
      hiddenColIndexes = state.hiddenColIndexes.filter(i => !(i === ind))
    } else {
      hiddenColIndexes = state.hiddenColIndexes.concat(ind)
    }
    this.setState({ hiddenColIndexes })
  }

  handlePageClick(e) {
    e.preventDefault()

    const currPageIndex = parseInt(e.target.innerText) - 1 || 0

    this.setState({
      currPageIndex
    })
  }

  jumpUpPage(e) {
    e.preventDefault()
    const { state, props } = this

    this.setState(prevState => ({
      startPageIndex: prevState.startPageIndex + props.shownPageCount,
      currPageIndex: prevState.startPageIndex + props.shownPageCount
    }))
  }

  jumpDownPage(e) {
    e.preventDefault()
    const { state, props } = this

    this.setState(prevState => ({
      startPageIndex: prevState.startPageIndex - props.shownPageCount,
      currPageIndex: prevState.startPageIndex - props.shownPageCount
    }))
  }

  nextPage() {
    const { state, props } = this

    const maxPage = Math.ceil(
      state.sortedAndIndexed_Rows.length / props.rowSize
    )

    if (state.currPageIndex === maxPage - 1) return

    this.setState(prevState => {
      const startPageIndex =
        (prevState.currPageIndex + 1) % props.shownPageCount
          ? prevState.startPageIndex
          : prevState.currPageIndex + 1

      return {
        startPageIndex,
        currPageIndex: prevState.currPageIndex + 1
      }
    })
  }

  prevPage() {
    const { props, state } = this

    if (state.currPageIndex === 0) return

    this.setState(prevState => {
      let startPageIndex = prevState.startPageIndex
      const updatedCurrPageIndex = prevState.currPageIndex - 1
      if (updatedCurrPageIndex < prevState.startPageIndex) {
        startPageIndex = prevState.startPageIndex - props.shownPageCount
      }

      return {
        startPageIndex,
        currPageIndex: prevState.currPageIndex - 1
      }
    })
  }

  goFirstPage() {
    this.setState({
      startPageIndex: 0,
      currPageIndex: 0
    })
  }

  goLastPage() {
    const { state, props } = this

    this.setState({
      currPageIndex:
        Math.ceil(state.sortedAndIndexed_Rows.length / props.rowSize) - 1
    })
  }

  /* HELPER(s) */
  /* _cmp(el, nextEl, selColName, _index) */
  _cmp(el, nextEl, selectedColName) {
    const { props } = this

    let a = el[selectedColName]
    let b = nextEl[selectedColName]

    a = a === null || a === undefined ? "" : a
    b = b === null || b === undefined ? "" : b
    // force any string values to lowercase
    a = typeof a === "string" ? a.toLowerCase() : a
    b = typeof b === "string" ? b.toLowerCase() : b

    //unique ID check
    const idName = props.idName
    if (idName === selectedColName) {
      const isIDclash = el[idName] === nextEl[idName]

      if (isIDclash) {
        throw new Error("Duplicate IDs")
      }

      a = el[UNIQ_INDEX]
      b = nextEl[UNIQ_INDEX]
    }

    if (a > b) {
      return 1
    } else if (a < b) {
      return -1
    }
    return 0
  }

  /* */
  //assumes sortPriorities.length>0, otherwise no sorting needed[no use Array.prototype.sort]
  _getCompare(selectedCol, i) {
    // return (a,b)=>1
    // return undefined

    const { props, state } = this

    // console.log("BREAK", state.sorted, i)

    const sortOrder = state.sorted[i].desc ? "desc" : "asc"
    const coeff = COEFF_MAP[sortOrder]

    let selectedColName = selectedCol.name

    return (el, nextEl) => {
      let cmpRes

      if (this.compareByMethodsMap[selectedColName] !== undefined) {
        cmpRes = this.compareByMethodsMap[selectedColName](
          el,
          nextEl,
          selectedColName
        )
      } else {
        cmpRes = this._cmp(el, nextEl, selectedColName)
      }

      if (cmpRes === 0 && i <= state.sorted.length - 2) {
        return this._getCompare(state.sorted[i + 1], i + 1)(
          el,
          nextEl,
          state.sorted[i + 1].name
        )
      }

      return cmpRes * coeff
    }

    // if (this._compareByMethod === null) {
    // 	if (props.isShowIdsAsRowNum && selectedCol.name === props.idName) {
    // 		selectedColName = UNIQ_INDEX//index it
    // 	}
    // 	return ((el, nextEl) => {
    // 		return this._cmp(el, nextEl, selectedColName) * coeff
    // 	})
    // } else {
    // 	return ((el, nextEl) => {
    // 		return this._compareByMethod(el, nextEl, selectedColName) * coeff
    // 	})
    // }
  }

  _filter(row) {
    const { searchCols } = this.props

    let isEqStr

    if (searchCols) {
      for (let col of searchCols) {
        isEqStr = this._findTrueMatch(row, col)

        if (isEqStr) return true
      }
    } else {
      for (let key in row) {
        isEqStr = this._findTrueMatch(row, key)

        if (isEqStr) return true
      }
    }

    return false
  }

  _findTrueMatch(row, key) {
    const { state } = this

    const { idName } = this.props

    let isEqStr

    const searchText = state.searchText.trim()

    // if(searchText.match(/(^in:)|( in)/i)){
    // }

    if (key === idName) {
      isEqStr = row[key] === searchText
    } else if (!isNaN(searchText) && !isNaN(row[key])) {
      isEqStr = Number(row[key]) === Number(searchText)
    } else if (typeof row[key] === "string") {
      const lwSearchText = searchText.toLowerCase()
      const lwRowName = row[key].toLowerCase()
      isEqStr = lwRowName.includes(lwSearchText)
    }

    if (isEqStr) return true
  }

  /* RENDER */

  render() {
    // return "table"
    // this.renderCount++
    // console.clear()
    // console.count('Render BT')
    const { state, props } = this
    const LoadingComponent = props.LoadingComponent

    const {
      sortOrder,
      selectedCol,
      searchText,
      sortedAndIndexed_Rows,
      currPageIndex,
      startPageIndex
    } = this.state

    const {
      cols,
      rows,
      idName,

      onRowSelect,
      selectedRow,

      onRowDoubleClick,

      isShowIdsAsRowNum,
      isShowSearch,

      withPagination,

      defaultSelectedCol
    } = this.props

    let filteredElements, sortedRows

    if (searchText.length) {
      filteredElements = sortedAndIndexed_Rows.filter(this._filter)
    } else {
      filteredElements = [...sortedAndIndexed_Rows]
    }

    if (this.shouldSortInRender && state.sorted.length > 0 && props.sortable) {
      sortedRows = filteredElements.sort(this._getCompare(state.sorted[0], 0))
    } else {
      sortedRows = filteredElements
    }
    const groupedRow = sortedRows.reduce((acc, row, i) => {
      const ind = Math.floor(i / props.rowSize)
      let accArr = acc[ind]
      if (!accArr) {
        acc[ind] = []
        accArr = acc[ind]
      }

      accArr.push(row)

      return acc
    }, [])

    const isShowPagination = filteredElements.length > props.rowSize

    let paginationList = null

    if (isShowPagination && withPagination) {
      paginationList = groupedRow
        .map((page, i) => {
          return (
            <li
              className={classNames("page-item", {
                active: currPageIndex === i
              })}
              key={i}
            >
              <a
                className="page-link"
                /* href="#" */ onClick={this.handlePageClick}
              >
                {i + 1}
              </a>
            </li>
          )
        })
        .filter((page, i, arr) => {
          const len = arr.length
          if (len === 1) return true

          return (
            (i >= startPageIndex &&
              i < startPageIndex + props.shownPageCount) ||
            (i >= len - props.shownPageCount && i < len)
          )
        })

      //dot link function
      const dotLink = (key, jump) => (
        <li className={"page-item"} key={key + "jump"}>
          <a className="page-link" /* href="#" */ onClick={jump}>
            {"...."}
          </a>
        </li>
      )

      //if the total number of pages less than shownPageCount sum then don't include "..."

      //1st case
      if (groupedRow.length >= props.shownPageCount + props.shownPageCount) {
        //2nd case
        if (
          groupedRow.length - startPageIndex - props.shownPageCount >
          props.shownPageCount
        ) {
          paginationList.splice(
            props.shownPageCount,
            0,
            dotLink(props.shownPageCount, this.jumpUpPage)
          )
        }
        //3rd case
        if (startPageIndex >= props.shownPageCount) {
          paginationList.splice(0, 0, dotLink(0, this.jumpDownPage))
        }

        // if (startPageIndex) {
        // 	paginationList.splice(currPageIndex, 0, dotLink(currPageIndex, this.jumpDownPage))
        // }
      }

      sortedRows = groupedRow[currPageIndex] || []
    }

    let { initialArr: _headers, flattenedArr: _cols } = getLabelsOnTheSameLevel(
      cols,
      [],
      0,
      [],
      null
    )

    const filteredCols = _cols.filter(
      (_, i) => !state.hiddenColIndexes.includes(i)
    )
    return (
      <div className="base-table-wrap" ref={this.baseTableRef}>
        {isShowSearch && state.isShowSearch && (
          <SearchBox
            cols={cols.map(col => ({ name: col.name, label: col.label }))}
            hiddenColIndexes={state.hiddenColIndexes}
            addIndexToHiddenCols={this.addIndexToHiddenCols}
            searchText={this.state.searchText}
            onResetSearchAndSort={this.resetSearchAndSort}
            onResetSearch={this.resetSearch}
            onInputChange={this.handleInputChange}
          />
        )}
        <table
          className={classNames(
            "table table-hover ",
            { "table-striped": props.tableStriped },
            props.tableFixedClass
          )}
        >
          <Thead
            sorted={state.sorted}
            sortable={props.sortable}
            title={props.title}
            cols={filteredCols}
            groups={_headers}
            onToggleColSort={this.toggleColSort}
          />
          <Tbody
            cols={filteredCols}
            rows={sortedRows}
            selectedRow={selectedRow}
            onRowSelect={onRowSelect}
            onRowDoubleClick={onRowDoubleClick}
            idName={idName}
            isShowIdsAsRowNum={isShowIdsAsRowNum}
          />
        </table>
        {isShowPagination && withPagination && (
          <nav aria-label="BaseTable pagination">
            <ul className="pagination justify-content-center">
              <li className={`page-item`}>
                <a
                  className={classNames("page-link", "bg-info", {
                    disabled: !currPageIndex
                  })}
                  onClick={this.goFirstPage}
                >
                  &lt;&lt;
                </a>
              </li>
              <li className={`page-item`}>
                <a
                  className={classNames("page-link", "bg-primary", {
                    disabled: !currPageIndex
                  })}
                  onClick={this.prevPage}
                >
                  &lt;
                </a>
              </li>
              {paginationList}
              <li className="page-item">
                <a
                  className={classNames("page-link", "bg-primary", {
                    disabled: currPageIndex === sortedAndIndexed_Rows.length - 1
                  })}
                  onClick={this.nextPage}
                >
                  &gt;
                </a>
              </li>
              <li className="page-item">
                <a
                  className={classNames("page-link", "bg-info", {
                    disabled: currPageIndex === sortedAndIndexed_Rows.length - 1
                  })}
                  onClick={this.goLastPage}
                >
                  &gt;&gt;
                </a>
              </li>
            </ul>
          </nav>
        )}

        <LoadingComponent loading={props.loading} />
      </div>
    )
  }
}

BaseTable.defaultProps = defaultProps

BaseTable.propTypes = propTypes

export default BaseTable
