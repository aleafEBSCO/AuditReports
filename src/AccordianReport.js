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
      <div class="panel-group" id="accordianReport">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h4 class="panel-title">
              <a data-toggle="collapse" data-parent="#accordianReport" href={"#" + overallID}>{this.props.title}</a>
            </h4>
          </div>

          <div id={overallID} class="panel-collapse collapse">
            <div class="panel-body">

              <div class="panel-group" id={subID}>
                {this._renderCategoryList(this.props.data, subID)}
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  _renderCategoryList(data, subID) {
    for (const subtitle of Object.keys(data)) {
      this._renderCategory(subtitle, data[subtitle], subID);
    }
  }

  _renderCategory(subtitle, categoryData, subID) {
    var innerID = uuid.v1();

    return (
      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title">
            <a data-toggle="collapse" data-parent={"#" + subID} href={"#" + innerID}>{subtitle + " (" + categoryData.length + ")"}</a>
          </h4>
        </div>
        <div id={innerID} class="panel-collapse collapse">
          <div class="panel-body">
            {this._renderLinkList(categoryData)}
          </div>
        </div>
      </div>
    );
  }

  _renderLinkList(data) {
    return data.map(fs => {
      return this._renderLink(fs);
    });
  }

  _renderLink(fs) {
    return (<Link link={"https://us.leanix.net/EISEA/factsheet/" + fs["type"] + "/" + fs["id"]} target="_blank" text={fs["displayName"]} />);
  }
}

AccordianReport.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
}

export default AccordianReport;