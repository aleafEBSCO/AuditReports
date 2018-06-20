import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import Utilities from '../Utilities';
import Link from './Link';

class InfoTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let formattedData = this.props.data.map(fs => {
      return [<Link link={`https://us.leanix.net/SBEIS/factsheet/${fs.type}/${fs.id}`} target='_blank' text={fs.displayName} />,
        fs.completion.percentage + '%',
        Utilities.getSubscriptionNamesOfType(fs, 'RESPONSIBLE'),
        Utilities.getSubscriptionNamesOfType(fs, 'ACCOUNTABLE')
      ];
    });

    return (
     <ReactTable
        data={formattedData}
        //the width of the infobox is 900px so I'm making width of table 857
        columns={[
          {
            Header: "Fact Sheet",
            accessor: "0",
            width: 340,//"40%"
            sortMethod: (a, b) => {
              if (a.props.text < b.props.text) {
                return -1;
              }else if (b.props.text < a.props.text) {
                return 1;
              }

              return 0;
            }
          },
          {
            Header: "Completion",
            accessor: "1",
            width: 87,//"10%"
            sortMethod: (a, b) => {
              let tempA = parseInt(a.slice(0, -1));
              let tempB = parseInt(b.slice(0, -1));

              if (tempA < tempB) {
                return -1;
              }else if (tempB < tempA) {
                return 1;
              }

              return 0;
            }
          },
          {
            Header: "Responsible",
            accessor: "2",
            width: 215,//"25%"
            sortMethod: (a, b) => {
              if (a.length === 0 && b.length !== 0) {
                return 1
              } else if (a.length !== 0 && b.length === 0) {
                return -1
              }
        
              if (a < b) {
                return -1;
              } else if (a > b) {
                return 1;
              }
            }
          },
          {
            Header: "Accountable",
            accessor: "3",
            width: 215,//"25%"
            sortMethod: (a, b) => {
              if (a.length === 0 && b.length !== 0) {
                return 1
              } else if (a.length !== 0 && b.length === 0) {
                return -1
              }
        
              if (a < b) {
                return -1;
              } else if (a > b) {
                return 1;
              }
            }
          }
        ]}
        defaultSorted={[
          {
            id: "1",
            desc: false
          },
          {
            id: "2",
            desc: false
          },
          {
            id: "3",
            desc: false
          },
          {
            id: "0",
            desc: false
          }
        ]}
        pageSize={formattedData.length}
        showPagination={false}
        style={
          {
            height: "375px"
          }
        }
        className="-striped -highlight"
        minRows = {0}
      />
    );
  }
}

InfoTable.propTypes = {
  data: PropTypes.array.isRequired
}

export default InfoTable;