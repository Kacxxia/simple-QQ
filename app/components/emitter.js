// @flow
import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'
import { emitSth } from '../actions/counter'

type Props = {
    message: string,
    onEmitSth: func
};

const Emitter = ({ message, onEmitSth }: Props) => {
    return (
        <div>
            {message}
            <Button onClick={onEmitSth} > emit! </Button>
        </div>
    );
};

export default connect(state => {
    return {
        message: state.counter.message
    }
}, dispatch => {
    return {
        onEmitSth: () => dispatch(emitSth('test'))
    }
})(Emitter);
