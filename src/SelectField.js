import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

class SelectField extends Component {

	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
		this.state = {
      selectedOption: this.props.value,
    }
	}

	_onChange(selectedOption) {
		this.setState({ selectedOption });
		this.props.onChange(selectedOption);
	}

	render() {
		const { selectedOption } = this.state;

		return (
			<div className={ 'form-group' + (this.props.useSmallerFontSize ? ' small' : '') }>
				<label htmlFor={this.props.id}>{this.props.label}</label>
				<Select
					name={'SelectField-' + this.props.id}
					inputProps={{
						id: this.props.id
					}}
					options={this.props.options}
					ignoreCase={true}
					clearable={false}
					searchable={false}
					disabled={this.props.options.length < 1}
					value={selectedOption}
					onChange={this._onChange} />
			</div>
		);
	}
}

SelectField.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired
		}).isRequired
	).isRequired,
	onChange: PropTypes.func,
	value: PropTypes.shape({
		value: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired
	}),
	useSmallerFontSize: PropTypes.bool
};

export default SelectField;