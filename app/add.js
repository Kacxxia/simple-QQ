import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer as ipc, remote } from 'electron'
import { Container, Button, Card, Tab, Input, Loader } from 'semantic-ui-react'


const remoteBrowserWindow = remote.BrowserWindow

class Add extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isWaiting: true,
            database: {
                friend: [
                    {
                        userId: 1111,
                        name: 'one'
                    },
                    {
                        userId: 2222,
                        name: 'two'
                    },
                ],
                group: [
                    {
                        groupId: 111,
                        groupName: 'groupone'
                    },
                    {
                        groupId: 222,
                        groupName: 'groupTwo'
                    }
                ]
            },
            directInput: {
                value: '',
                buttonActive: false
            }
        }
        this.addAction = this.props.addAction
    }
    render() {
        if (this.state.isWaiting) {
            return (
                <div className='d-flex align-items-center justify-content-center'>
                    <Loader size='large' inverted />
                </div>
            )
        }
        const panes = [
            {
                menuItem: '好友',
                render: () => (
                    <Tab.Pane>
                        <DirectAdd 
                            type='friend' 
                            action={(value) => this.addAction('addFriend', value)}
                            key='friend'
                    />
                        {this.state.database.friend.map((f, i) => {
                            return <SegmentButton 
                                        name={f.name}
                                        action={() => this.addAction('addFriend', f.userId)}
                                        key={`friend${i}`}
                                        type='friend'
                                    />
                        })}
                    </Tab.Pane>
                )
            },
            {
                menuItem: '群组',
                render: () => (
                    <Tab.Pane>
                        <DirectAdd 
                            type='group' 
                            action={(value) => this.addAction('joinGroup', value)} 
                            key='group'
                        />
                        {this.state.database.group.map((g, i) => {
                            return <SegmentButton 
                                        name={g.groupName}
                                        action={() => this.addAction('joinGroup', g.groupId)}
                                        key={`group${i}`}
                                        type='group'
                                    />
                        })}
                    </Tab.Pane>
                )
            }
        ]
        return (
            <div>
                <Tab panes={panes} />
            </div>
        )
    }
}

class DirectAdd extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            buttonActive: false
        }
        this.placeholder = this.props.type === 'friend' ? '直接输入对方的SSQPID' : '直接输入想添加的群ID'
    }
    render() {
        return (
            <Input
                placeholder={this.placeholder}
                fluid
                action={
                    <Button 
                        toggle
                        onClick={() => {
                            this.setState({
                                value: '',
                                buttonActive: true
                            })
                            this.props.action(this.state.value)
                        }}
                        active={!this.state.buttonActive}
                    >
                        添加
                    </Button>
                }
                value={this.state.value}
                onFocus={() => {
                    this.setState({
                            value: this.state.value,
                            buttonActive: false
                        })
                    }}
                onChange={(e) => this.setState({ value: e.target.value })}
            />
        )
    }
}

class SegmentButton extends Component {
    constructor() {
        super()
        this.state = {
            active: true
        }
    }
    chooseButtonContent(type, active) {
        if (type === 'friend') {
            if (active) {
                return '申请'
            }
                return '已申请'
        } else {
            if (active) {
                return '加入'
            }
                return '已加入'
        }
    } 
    render() {
        const buttonContent = this.chooseButtonContent(this.props.type, this.state.active)
        return (
            <div className='d-flex align-items-center justify-content-between' style={{width: '100%', marginTop: 14}}>
                <div>
                    {this.props.name}
                </div>
                <Button 
                    disabled={!this.state.active}
                    onClick={
                        () => {
                            this.setState({active: false})
                            this.props.action()
                        }
                    }
                    active={this.state.active}
                    primary
                >
                    {buttonContent}
                </Button>
            </div>
        )
    }
}

const add = ReactDOM.render(
    <Add addAction={sendMessage}/>,
    document.getElementById('root')
)

let parentId
let userSelf

ipc.on('initiate', (event, { winSelfId, userSelfId }) => {
    console.log('initiate')
    console.log(winSelfId, parentId)
    parentId = winSelfId
    userSelf = userSelfId
})

ipc.on('data', (e, data) => {
    console.log(data)
    add.setState({
        isWaiting: false,
        database: data
    })
})

function sendMessage(type, id) {
    console.log('send message')
    console.log(type, id)
    console.log(parentId)
    const parent = remoteBrowserWindow.fromId(parentId)
    console.log(parent)
    parent.webContents.send('eventFromAdd', { type, id, userSelf })
}
