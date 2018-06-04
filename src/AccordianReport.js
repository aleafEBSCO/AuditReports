import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AccordianReport extends Component {

  // <AccordianReport title=String categories=List[String] data=List[List[FactSheet]]
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="panel-group" id="accordianReport">
      </div>
    );
  }
}

AccordianReport.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
}

export default AccordianReport;