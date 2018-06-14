import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GraphTools from './GraphTools';
import Link from './Link';

class ReportView extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let shouldBeGraphed = false;
    // add more if statements here to decide when graphs should replace text
    if (this.props.subtitle.indexOf("Overall Score") !== -1 || this.props.subtitle.indexOf("Lacking Accountable and Responsible") !== -1 
    || this.props.subtitle.indexOf("Quality Seal") !== -1 || this.props.subtitle.indexOf("Model Completion Status") !== -1) {
      shouldBeGraphed = true;
    }

    let shownData;

    if (shouldBeGraphed) {
      // get the graph
      shownData = GraphTools.getGraph(this.props.title, this.props.subtitle, this.props.typeData);
    } else {
      shownData = this.props.categoryData.map((fs, i) => this._renderLink(fs, i));
    }

    return shownData;
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

ReportView.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  categoryData: PropTypes.array.isRequired
}

export default ReportView;