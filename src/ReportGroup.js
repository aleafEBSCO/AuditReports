import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import Link from './Link';

class ReportGroup extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    var subID = uuid.v1();

    return (
      <div className="panel-group" id="accordianReport">
        {Object.keys(this.props.data).reduce((inner, subtitle) => {
          inner.push(this._renderCategory(this.props.title, subtitle, this.props.data[subtitle], subID));
          return inner;
        }, [])}
      </div>
    );
  }

  _renderCategory(title, subtitle, categoryData, subID) {
    let innerID = uuid.v1();

    let shownData = categoryData[0];
    let count = categoryData[1];

    return (
      <div className="panel panel-default" key={innerID}>
        <div className="panel-heading">
          <h4 className="panel-title">
            <a data-toggle="collapse" data-parent={"#" + subID} href={"#" + innerID}>{subtitle + " (" + count+ ")"}</a>
          </h4>
        </div>
        <div id={innerID} className="panel-collapse collapse">
          <div className="panel-body">
            {shownData}
          </div>
        </div>
      </div>
    );
  }

  _renderLink(fs, key) {
    return (
      <div key={key}>
        <Link link={"https://us.leanix.net/SBEIS/factsheet/" + fs.type + "/" + fs.id} target="_blank" text={fs.displayName} />
        <br />
      </div>
    );
  }
}

ReportGroup.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  overallID: PropTypes.string.isRequired
}

export default ReportGroup;