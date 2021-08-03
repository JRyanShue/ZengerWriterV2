
import React from 'react';
import { GetEditorData, GetEditorURL } from './API.js';

class Preview extends React.Component {

    /*
        Returns a component with a preview of an editor.
    */

    constructor( props ) {
        
        super( props );
        this.key = props.key;
        this.backgroundImage = props.backgroundImage;
        console.log(this.backgroundImage)

        this.id = props.id;
        this.name = props.name;

        this.className="preview-img";

        this.gcodelist = props.gcodelist;

        this.handleClick = function () {

            // Callback is within function
            GetEditorURL( this.gcodelist, this.id );

        };
        
    }

    render() {

        return( 

            <div className="preview-img-box">
                <div 
                    className={this.className}
                    key={this.key}
                    style={{background: this.backgroundImage, backgroundRepeat: "no-repeat", backgroundPosition: "50% 50%", backgroundSize: "500px"}}
                    onClick={this.handleClick.bind(this)}
                >
                    {this.name}
                </div>
            </div>
            
        )

    }

}

export { Preview }