import React from "react"
import { noop } from "../../utils"

export default {
  cols: [
    //active comment, dont delete
    // {
    // 	name: "name",
    // 	label: "label",
    // 	component: (<span>component</span>),
    // 	directValue: () => "directValue",
    // 	isHidden: false,
    // 	sortable: undefined,
    // 	compareByMethod:(by)=>(a,b)=>(a-b)*by,
    //  defaultSortOrderDesc: undefined,
    //  sortOrder:"asc",//ovr
    //  sortedWith:undefined,
    // },
  ],
  rows: [],
  // sortPriorities: [],
  idName: "",

  sortable: true,
  title: "",
  isMultiSort: true, //todo
  sorted: [], //todo
  defaultSorted: [], //todo
  defaultSortOrderDesc: false,
  defaultCompareByMethod: undefined,
  defaultSelectedCol: {},
  onSortedChange: () => {
    console.log("onSortedChange")
  },

  onRowSelect: () => {
    console.warn("%conRowSelect not specified", "color:blue;")
  },
  isShowIdsAsRowNum: false,
  isShowSearch: true,
  onRowDoubleClick: noop,

  // percents: [],
  // dates: [],
  withPagination: false,
  rowSize: 2,
  shownPageCount: 5,

  //NEW
  loading: false,
  resizable: true,
  filterable: true,
  defaultFiltered: [],
  defaultFilterMethod: undefined,
  filtered: [],

  onFilteredChange: undefined,
  onResizedChange: undefined,

  loading: false,
  LoadingComponent: () => null,

  tableFixedClass: "", //sticky header does not work with overflow
  tableStriped: false
}
