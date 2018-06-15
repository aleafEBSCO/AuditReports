import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Utilities from '../Utilities';
import Link from './Link';

class InfoTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let sortedData = this.props.data;
    sortedData.sort(function(a, b){
      if (a.completion.completion < b.completion.completion){
        return -1;
      } else if (a.completion.completion > b.completion.completion) {
        return 1
      }

      let aResponsible = [];
      let bResponsible = [];

      let aAccountable = [];
      let bAccountable = [];

      for (let i = 0; i < a.subscriptions.edges.length; i++){
        if (a.subscriptions.edges[i].node.type === "RESPONSIBLE") {
          aResponsible.push(a.subscriptions.edges[i].node.user.displayName);
        } else if (a.subscriptions.edges[i].node.type === "ACCOUNTABLE") {
          aAccountable.push(a.subscriptions.edges[i].node.user.displayName);
        }
      }

      for (let i = 0; i < b.subscriptions.edges.length; i++){
        if (b.subscriptions.edges[i].node.type === "RESPONSIBLE") {
          bResponsible.push(b.subscriptions.edges[i].node.type.displayName);
        } else if (b.subscriptions.edges[i].node.type === "ACCOUNTABLE") {
          bAccountable.push(b.subscriptions.edges[i].node.type.displayName);
        }
      }

      aResponsible.sort();
      bResponsible.sort();

      aAccountable.sort();
      bAccountable.sort();

      if (aResponsible.length === 0 && bResponsible.length !== 0) {
        return 1
      } else if (aResponsible.length !== 0 && bResponsible.length === 0) {
        return -1
      }

      if (aResponsible < bResponsible) {
        return -1;
      } else if (aResponsible > bResponsible) {
        return 1;
      }

      if (aAccountable.length === 0 && bAccountable.length !== 0) {
        return 1
      } else if (aAccountable.length !== 0 && bAccountable.length === 0) {
        return -1
      }

      if (aAccountable < bAccountable) {
        return -1;
      } else if (aAccountable > bAccountable) {
        return 1;
      }

      if (a.displayName < b.displayName) {
        return -1;
      } else if (a.displayName > b.displayName) {
        return 1;
      }

      return 0;
    });

    return (
      <table border='1'>
        <thead>
          <tr>
            <th>Fact Sheet</th>
            <th>Completion</th>
            <th>Responsible</th>
            <th>Accountable</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((fs, i) => {
            return this._renderRow(fs, i);
          })}
        </tbody>
      </table>
    );
  }

  _renderRow(fs, rowIndex) {
    // TODO: Don't hard code base URL
    return (
      <tr key={rowIndex}>
        <td key={fs.id} width='40%' align='center'>
          <Link link={`https://us.leanix.net/SBEIS/factsheet/${fs.type}/${fs.id}`} target='_blank' text={fs.displayName} />
        </td>
        <td key={fs.id + '-C'} width='10%' align='center'>
          {fs.completion.percentage + '%'}
        </td>
        <td key={fs.id + '-R'} width='25%' align='center'>
          {Utilities.getSubscriptionNamesOfType(fs, 'RESPONSIBLE')}
        </td>
        <td key={fs.id + '-A'} width='25%' align='center'>
          {Utilities.getSubscriptionNamesOfType(fs, 'ACCOUNTABLE')}
        </td>
      </tr>
    );
  }
}

InfoTable.propTypes = {
  data: PropTypes.array.isRequired
}

export default InfoTable;