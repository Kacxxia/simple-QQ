import React from 'react';
import { Card } from 'semantic-ui-react'

const emojiList = '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 😗 😙 😚 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🤠 🤡 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖 💩 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(" ")

function EmojiPanel({onAddEmoji}){
    return (
        <div style={{width: 666}}>
            {renderEmoji(16, emojiList, onAddEmoji)}
        </div>
    );
};


export default EmojiPanel;


function renderEmoji(cols, emojiList, onAddEmoji) {
    return Array(Math.ceil(emojiList.length / cols)).fill(0).map((t, row) => {
        return (
            <div className='d-flex' key={`row${row}`}>
                {emojiList.slice(row * cols, (row + 1) * cols).map((emoji, i) => {
                    return (<div 
                                className='emoji align-items-center justify-content-center' 
                                onClick={() => onAddEmoji(emoji)}
                                key={i}
                                style={{display: 'flex', fontSize: 24, margin: 2, height: 36, width: 36,cursor: 'pointer'}}
                            >
                                {emoji}
                            </div>
                    )
                })}
            </div>
        )
    })
}
