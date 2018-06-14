import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import ReportData from './ReportView';
import Link from './Link';
import GraphTools from './GraphTools';

class ReportGroup extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let subID = uuid.v1();

    return (
      /*
      <div className="panel-group" id="accordianReport">
        {Object.keys(this.props.data).reduce((inner, subtitle) => {
          inner.push(this._renderCategory(this.props.title, subtitle, this.props.data[subtitle], subID));
          return inner;
        }, [])}
      </div>
      */
      <div className="panel-group" id="accordianReport">
        {Object.keys(this.props.data).reduce((inner, subtitle) => {
          inner.push(<ReportData title={this.props.title} subtitle={subtitle} subID={subID}
          categoryData={this.props.data[subtitle]} typeData={this.props.typeData} />);
          return inner;
        }, [])}
      </div>
    );
  }

  _renderCategory(title, subtitle, categoryData, subID) {
    let innerID = uuid.v1();

    let shouldBeGraphed = false;
    // add more if statements here to decide when graphs should replace text
    if (subtitle.indexOf("Overall Score") !== -1 || subtitle.indexOf("Lacking Accountable and Responsible") !== -1 
    || subtitle.indexOf("Quality Seal") !== -1 || subtitle.indexOf("Model Completion Status") !== -1) {
      shouldBeGraphed = true;
    }

    let shownData;

    if (shouldBeGraphed){
      // get the graph
      shownData = GraphTools.getGraph(title, subtitle, this.props.typeData);
    } else {
      shownData = categoryData.map((fs, i) => this._renderLink(fs, i));
    }

    return (
      <div className="panel panel-default" key={innerID}>
        <div className="panel-heading">
          <h4 className="panel-title">
            <a data-toggle="collapse" data-parent={"#" + subID} href={"#" + innerID}>{subtitle + " (" + categoryData.length + ")"}</a>
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
  overallID: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  typeData: PropTypes.array.isRequired
}

export default ReportGroup;