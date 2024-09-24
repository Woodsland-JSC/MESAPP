
const [colDefs, setColDefs] = useState([
  {
      headerName: "Tổ sản xuất",
      field: "resource",
      rowGroup: true,
      hide: true,
      sort: 'asc'
  },
  {
      headerName: "Tên chi tiết",
      field: "itemname",
      width: 350,
      suppressHeaderMenuButton: true,
      filter: true,
  },
  {
      headerName: "Số lượng",
      field: "quantity",
      width: 100,
      suppressHeaderMenuButton: true,
      aggFunc: 'sum',
      headerComponentParams: { displayName: "Số lượng" }
  },
  { headerName: "M3", field: "m3", width: 120, aggFunc: 'sum', headerComponentParams: { displayName: "M3" }  },
])
const groupDisplayType = 'groupRows';

<AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            groupDisplayType={groupDisplayType}
                                            getRowStyle={getRowStyle}
                                            // showOpenedGroup={true}
                                            // autoGroupColumnDef={{
                                            //   headerName: "Tổ sản xuất",
                                            //   minWidth: 320,
                                            //   cellRendererParams: {
                                            //     suppressCount: true,
                                            //     innerRenderer: (params) => {
                                            //       if (params.node.group) {
                                            //         return `${params.value} (${params.node.allLeafChildren.length})`;
                                            //       }
                                            //       return params.value;
                                            //     },
                                            //   },
                                            // }}
                                            groupIncludeFooter={true}
                                            groupIncludeTotalFooter={true}
                                        />