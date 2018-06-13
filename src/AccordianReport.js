import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import ReportGroup from './ReportGroup';

class AccordianReport extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    //console.log(this.props.all);
    //let filteredAll = 

    return this.props.data.map((obj, i) => {
      let overallID = uuid.v1();
      //console.log(obj);

      let filteredAll = null;

      switch (obj.title) {
        case "All Fact Sheets":
          filteredAll = this.props.all;
          break;
        case "Domain":
          filteredAll = this.props.all.filter(fs => {return (fs.type === "BusinessCapability")});
          break;
        case "Use Case":
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "Process")});
          break;
        case "Persona":
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "UserGroup")});
          break;
        case "Epic":
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "Project")});
          break;
        case "Bounded Context":
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "Application")});
          break;
        case "Behavior":
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "Interface")});
          break;
        case "Data Object":
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "DataObject")});
          break;
        default:
          filteredAll = this.props.all.filter(fs => {return (fs["type"] === "ITComponent")});
          break;
      }

      // TODO: Investigate what key and filteredAll do and see if they are actually necessary
      return <ReportGroup title={obj.title} overallID={overallID}  key={i} data={obj.data} typeData={filteredAll}/>;
    });
  }
}

AccordianReport.propTypes = {
  data: PropTypes.array.isRequired,
  all: PropTypes.array.isRequired
}

export default AccordianReport;