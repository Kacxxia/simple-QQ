import React from 'react';
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Menu, Tab, Label, Card } from 'semantic-ui-react'

import RedPoint from './RedPoint'
import { goChatting } from '../actions/mainAction'

const Nav = ({
    friendList,
    groupList,
    messageIsReaded,
    friendMessageSum,
    groupMessageSum,
    onGoChatting
}) => {
    const panes = [
        {
            menuItem: 
                <Menu.Item key="friend">
                    好友
                    <RedPoint show={friendMessageSum !== 0} />
                </Menu.Item>,
            render: (() => (
                <Tab.Pane as={'div'}>
                    {friendList.map((info, i) => {
                        const onlineStatus = info.isOnline ? '在线' : '离线'
                        const show = messageIsReaded[info.userId] ? true : false 
                        console.log(info.userId)
                        console.log(messageIsReaded)
                            return <Card 
                                    fluid 
                                    key={`friend${i}`} 
                                    onClick={() => onGoChatting(info.userId)}
                                    >
                                        <Card.Content>
                                            <div className='d-flex align-items-center'>
                                                <div style={{flexGrow: 1}}>
                                                    <h3>{info.name}</h3>
                                                    <span>{onlineStatus}</span>
                                                </div>
                                                <div>
                                                    <RedPoint show={show} />
                                                </div>
                                            </div>
                                        </Card.Content>
                                    </Card>
                                    }
                                )
                    }
            </Tab.Pane>
            ))
        },
        {
            menuItem: 
            <Menu.Item key="group">
                群组
                <RedPoint show={groupMessageSum !== 0} />
            </Menu.Item>,
        render: (() => (
            <Tab.Pane as={'div'}>
                {groupList.map((info, i) => {
                    const show = messageIsReaded[info.groupId] ? true : false 
                        return <Card 
                                fluid 
                                key={`group${i}`} 
                                onClick={() => onGoChatting(info.groupId)}>
                                    <Card.Content>
                                        <div className='d-flex align-items-center'>
                                            <div style={{flexGrow: 1}}>
                                                <h3>{info.groupName}</h3>
                                            </div>
                                            <div>
                                                <RedPoint show={show} />
                                            </div>
                                        </div>
                                    </Card.Content>
                                </Card>
                                }
                            )
                }
            </Tab.Pane>
            ))
        },
        {
            menuItem: 
            <Menu.Item key="system">
                通知
                <RedPoint show={messageIsReaded.systemMessage} />
            </Menu.Item>,
            render: (() => (
                <Tab.Pane as={'div'}>
                    <Card fluid onClick={() => onGoChatting('systemMessage')}>
                        <Card.Content>
                            <div className='d-flex align-items-center'>
                                <div style={{ flexGrow: 1 }}>
                                    <h3>系统通知</h3>
                                </div>
                                <div>
                                    <RedPoint 
                                    show={messageIsReaded.systemMessage}
                                    />
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </Tab.Pane>
                ))
        }
    ]

    return (
        <Tab panes={panes} />
    )
}

const friendListObj = state => state.main.database.friend
const groupListObj = state => state.main.database.group

const friendListSelector = createSelector(
    [friendListObj],
    (flo) => Object.values(flo)
)
const groupListSelector = createSelector(
    [groupListObj],
    (glo) => Object.values(glo)
)


export default connect(state => {
    return {
        friendList: friendListSelector(state),
        groupList: groupListSelector(state),
        messageIsReaded: state.main.message.list,
        friendMessageSum: state.main.message.friendMessageSum,
        groupMessageSum: state.main.message.groupMessageSum
    }
}, dispatch => {
    return {
        onGoChatting: (id) => dispatch(goChatting(id))
    }
})(Nav);
