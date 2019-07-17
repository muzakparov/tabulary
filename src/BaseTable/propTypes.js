import PropTypes from "prop-types"

export default {
  cols: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      component: PropTypes.func,
      directValue: PropTypes.func,
      isHidden: PropTypes.bool,

      sortable: PropTypes.bool,
      title: PropTypes.string,
      compareByMethod: PropTypes.func,
      defaultSortOrderDesc: PropTypes.bool,
      sortedWith: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          isSameSortOrder: PropTypes.bool
        })
      ), //make more detailed in future

      //new
      resizable: PropTypes.bool,
      filterable: PropTypes.bool,
      minWidth: PropTypes.number,
      className: PropTypes.string,
      style: PropTypes.object,
      getProp: PropTypes.func,
      filterMethod: PropTypes.func
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // sortPriorities: PropTypes.arrayOf(PropTypes.string).isRequired,
  idName: PropTypes.string.isRequired,

  onRowSelect: PropTypes.func,
  isShowIdsAsRowNum: PropTypes.bool,
  isShowSearch: PropTypes.bool,
  onRowDoubleClick: PropTypes.func,

  // sortOrder: PropTypes.oneOf(["asc", "desc"]),
  sortable: PropTypes.bool,
  isMultiSort: PropTypes.bool, //todo
  sorted: PropTypes.array,
  defaultSorted: PropTypes.array,
  defaultSortOrderDesc: PropTypes.bool,
  defaultCompareByMethod: PropTypes.func,
  defaultSelectedCol: PropTypes.object, //improve
  //cbs
  onSortedChange: PropTypes.func, //todo
  //

  withPagination: PropTypes.bool,
  rowSize: PropTypes.number,
  shownPageCount: PropTypes.number,

  //NEW
  loading: PropTypes.bool,
  resizable: PropTypes.bool,
  filterable: PropTypes.bool,
  defaultFiltered: PropTypes.array,
  defaultFilterMethod: PropTypes.func,

  filtered: PropTypes.array,

  onFilteredChange: PropTypes.func,
  onResizedChange: PropTypes.func,

  loading: PropTypes.bool,
  LoadingComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  tableFixedClass: PropTypes.string,
  tableStriped: PropTypes.bool

  // percents: PropTypes.arrayOf(PropTypes.string),//should be name from cols, change later. also validation
  // dates: function (props, propName, componentName) {

  // 	if (!props.cols) return

  // 	const colNames = props.cols.map(p => p.name)

  // 	let text = ""
  // 	if (props.dates) {
  // 		text = props.dates.reduce((acc, d, i) => {
  // 			if (!colNames.includes(d)) {
  // 				return acc + `, index {i} value ${d} on dates is not name from cols`
  // 			}
  // 			return acc
  // 		}, "")
  // 	}

  // 	if (text.length) return new Error("Dates: " + text)
  // },

  //here
  // PropTypes.arrayOf(function (propValue, key, componentName, location, propFullName) {
  // 	return new Error("SSS")
  // 	// if (!/matchme/.test(propValue[key])) {
  // 	// 	return new Error(
  // 	// 		'Invalid prop `' + propFullName + '` supplied to' +
  // 	// 		' `' + componentName + '`. Validation failed.'
  // 	// 	);
  // 	// }
  // })
}
