import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from './Link';
import uuid from 'uuid';

class AccordianReport extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    var overallID = uuid.v1();
    var subID = uuid.v1();

    return (
      <div className="panel-group" id="accordianReport">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h4 className="panel-title">
              <a data-toggle="collapse" data-parent="#accordianReport" href={"#" + overallID}>{this.props.title}</a>
            </h4>
          </div>

          <div id={overallID} className="panel-collapse collapse">
            <div className="panel-body">

              <div className="panel-group" id={subID}>
                {Object.keys(this.props.data).reduce((inner, subtitle) => {
                  inner.push(this._renderCategory(subtitle, this.props.data[subtitle], subID));
                  return inner;
                }, [])}
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  _renderCategory(subtitle, categoryData, subID) {
    var innerID = uuid.v1();

    return (
      <div className="panel panel-default" key={innerID}>
        <div className="panel-heading">
          <h4 className="panel-title">
            <a data-toggle="collapse" data-parent={"#" + subID} href={"#" + innerID}>{subtitle + " (" + categoryData.length + ")"}</a>
          </h4>
        </div>
        <div id={innerID} className="panel-collapse collapse">
          <div className="panel-body">
            {categoryData.map((fs, i) => this._renderLink(fs, i))}
          </div>
        </div>
      </div>
    );
  }

  _renderLink(fs, key) {
    return (
      <div key={key}>
        <Link link={"https://us.leanix.net/EISEA/factsheet/" + fs.type + "/" + fs.id} target="_blank" text={fs.displayName} />
        <br />
      </div>
    );
  }
}

AccordianReport.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
}

export default AccordianReport;