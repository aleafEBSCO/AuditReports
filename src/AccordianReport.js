import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import ReportGroup from './ReportGroup';
import Link from './Link';

class AccordianReport extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return this.props.data.map((obj, i) => {
      let overallID = uuid.v1();
      return <ReportGroup title={obj.title} data={obj.data} overallID={overallID} key={i} />;
    });
  }
}

AccordianReport.propTypes = {
  data: PropTypes.array.isRequired
}

export default AccordianReport;