import React from "react";
export const createInverseContext = (initialValue) => {
    const Context = React.createContext(initialValue);
    class InverseConsumer extends React.Component {
        constructor(props) {
            super(props);
            this.state = { value: initialValue };
            Context._updateProviderValue = (value) => this.setState({ value });
        }
        render() {
            return (<Context.Provider value={this.state.value}>
          {this.props.children}
        </Context.Provider>);
        }
    }
    class InverseProvider extends React.Component {
        componentDidMount() {
            Context._updateProviderValue?.(this.props.value);
        }
        componentDidUpdate() {
            Context._updateProviderValue?.(this.props.value);
        }
        render() {
            return <Context.Consumer>{() => this.props.children}</Context.Consumer>;
        }
    }
    return {
        Context,
        Consumer: InverseConsumer,
        Provider: InverseProvider,
    };
};
