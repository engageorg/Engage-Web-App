import React, { Fragment, Component } from "react";
export class EditableText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            edit: false
        };
    }
    UNSAFE_componentWillReceiveProps(props) {
        this.setState({ value: props.value });
    }
    handleEdit(e) {
        this.setState({ value: e.target.value });
    }
    handleBlur() {
        const { value } = this.state;
        if (!value) {
            this.setState({ value: this.props.value, edit: false });
            return;
        }
        this.props.onChange(value);
        this.setState({ edit: false });
    }
    render() {
        const { value, edit } = this.state;
        return (<Fragment>
        {edit ? (<input className="project-name-input" name="name" maxLength={25} value={value} onChange={e => this.handleEdit(e)} onBlur={() => this.handleBlur()} onKeyDown={e => {
            if (e.key === "Enter") {
                this.handleBlur();
            }
        }} autoFocus/>) : (<span onClick={() => this.setState({ edit: true })} className="project-name">
            {value}
          </span>)}
      </Fragment>);
    }
}
