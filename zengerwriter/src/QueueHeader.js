import React from 'react';
import './App.css';
import { SetEditorURL } from './API.js';
import { CreateID } from './ID.js';
// import { NewEditorButton } from './NewEditorButton.js';
import { QueueList } from './QueueList.js';

class QueueHeader extends React.Component {

    constructor (props) {

        // Initialize
        super(props);
        this.IP = props.IP;
        this.username = props.username;

        this.editorName = "Untitled Plate"

        this.setURL = function( editorURL ) {
            this.editorURL = editorURL;
        }

        var username = this.username;
        var IP = this.IP;

        // Contains all queue data
        // this.queueList = props.queueList;
        console.log("QU", this.queueList)

        this.state = {

            newQueue: () => { console.log("old") }

        }

    }

    componentDidMount() {

        this.setState({

            numbersList: this.listItems,
            mounted: true

        });

    }

    /* 
        Function to be passed into QueueList. 
        QueueList uses it to set a function in QueueHeader 
        and thus form an API between the elements for communication. 
    */
    setQueueList ( queueList ) {

        this.queueList = queueList;
        console.log("SETTTTttyt", this.queueList)

        // New, blank queue
        // console.log("S:", document.getElementsByClassName( "newqueuebutton" )[0]);
        // console.log("QUQUQU:", document.getElementById( "newqueuebutton" ))
        // document.getElementById( "newqueuebutton" ).addEventListener("click", function() {
                
        //     console.log("NEW FUNC")
        //     this.queueList.addQueue("Ryan");

        // })
        // console.log(document.getElementById( "newqueuebutton" ))

        this.setState({

            newQueue: () => { 
                console.log("new function");
                // console.log(this.queueList.addQueue);
                this.queueList.addQueue("Ryan"); }

        })

        console.log(this.state.newQueue)

    }

    render () {

        return (

            <div>

                <div id="QueueHeader">

                <div className="newqueuelabel">
                    <p className="noselect">
                        Build Sequence
                    </p>
                </div>
                <div id="newqueuebutton" className="newqueuebutton" onClick={this.state.newQueue}>
                    <p className="noselect">
                        +
                    </p>
                </div>

                </div>

                <QueueList IP={this.IP} username={this.username} setQueueList={this.setQueueList.bind(this)} />

            </div>
            
        );

    }
  
}

export { QueueHeader };