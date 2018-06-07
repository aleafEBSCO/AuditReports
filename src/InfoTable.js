import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Utilities from './Utilities';
import Link from './Link';

class InfoTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
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
          {this.props.data.map((fs, i) => {
            return this._renderRow(fs, i);
          })}
        </tbody>
      </table>
    );
  }

  _renderRow(fs, rowIndex) {
    // TODO: Don't hard code base URL

    //console.log(fs);
    console.log(fs);

    return (
      <tr key={rowIndex}>
        <td key={fs.id} width='40%' align='center'>
          <Link link={'https://us.leanix.net/SBEIS/factsheet/' + fs.type + '/' + fs.id} target='_blank' text={fs.displayName} />
        </td>
        <td key={fs.id + '-C'} width='10%' align='center'>
          {Math.round(fs.completion.completion * 1000) / 10 + '%'}
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