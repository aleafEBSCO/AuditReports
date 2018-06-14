import { Component } from 'react';
import PropTypes from 'prop-types';


class ReportView extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let shownData = this.props.categoryData[0];
    //let count = this.props.categoryData[1];
    return shownData
  }
}

ReportView.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  categoryData: PropTypes.array.isRequired
}

export default ReportView;