
import * as THREE from '../../build/three.module.js';

import { Editor } from './js/Editor.js';
import { Viewport } from './js/Viewport.js';
import { Toolbar } from './js/Toolbar.js';
import { Script } from './js/Script.js';
import { Player } from './js/Player.js';
import { Sidebar } from './js/Sidebar.js';
import { Menubar } from './js/Menubar.js';
import { Resizer } from './js/Resizer.js';
import { VRButton } from '../examples/jsm/webxr/VRButton.js';
import { ViewSelection } from './js/ViewSelection.js';
import { LayerSelection } from './js/LayerSelection.js';
// import { Preview } from './js/Preview.js'

import { SetEditorInfo, Save, Move, Delete } from './js/API.js';
import { CreateID } from './js/libs/ID.js'

async function main() {

    // const urlParams = new URLSearchParams(window.location.search);
    // var editorURL = urlParams.get('editorURL');
    var queries = ["?editorURL=", "&username=", "&editorID=", "&editorName="];

    var urlVars = window.location.search.toString();
    var editorURL = urlVars.slice( urlVars.indexOf(queries[0]) + queries[0].length, urlVars.indexOf(queries[1]) );
    var username = urlVars.slice( urlVars.indexOf(queries[1]) + queries[1].length, urlVars.indexOf(queries[2]) );
    var editorID = urlVars.slice( urlVars.indexOf(queries[2]) + queries[2].length, urlVars.indexOf(queries[3]) );
    var editorName = urlVars.slice( urlVars.indexOf(queries[3]) + queries[3].length, urlVars.length );
    editorName = decodeURIComponent(editorName);  // Decode percent encoding
    console.log("URL:", editorURL, "Username:", username, "editorID:", editorID, "editorName:", editorName);


    

    window.URL = window.URL || window.webkitURL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

    Number.prototype.format = function () {

        return this.toString().replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' );

    };

    //

    var editor = new Editor();
    editor.username = username;
    editor.editorID = editorID;
    editor.oldID = editorID;  // for removing old editor once saving updates it


    // Editor info: contains the name and settings. 
    editor.editorInfo = {}
    await SetEditorInfo( editor )
    console.log(editor.editorInfo)

    editor.editorName = editor.editorInfo['name']

    // Update slice settings from editorInfo
    const { name, ...settingsInfo } = editor.editorInfo  // Exclude 'name'
    for ( var category in settingsInfo ) {
        for ( var setting in settingsInfo[category] ) {
            editor.settings.dict[category][setting] = settingsInfo[category][setting];
        }
    }

    window.editor = editor; // Expose editor to Console
    window.THREE = THREE; // Expose THREE to APP Scripts and Console
    window.VRButton = VRButton; // Expose VRButton to APP Scripts

    // dynamically block the screen
    addScreenBlocker(); 

    var viewport = new Viewport( editor, 235, 200 );
    document.body.appendChild( viewport.dom );

    var toolbar = new Toolbar( editor );
    document.body.appendChild( toolbar.dom );

    var script = new Script( editor );
    document.body.appendChild( script.dom );

    var player = new Player( editor );
    document.body.appendChild( player.dom );

    var sidebar = new Sidebar( editor );
    document.body.appendChild( sidebar.dom );

    var menubar = new Menubar( editor );
    document.body.appendChild( menubar.dom );

    var resizer = new Resizer( editor );
    document.body.appendChild( resizer.dom );

    var viewSelection = new ViewSelection( editor );
    document.body.appendChild( viewSelection.dom );

    var layerSelection = new LayerSelection( editor );
    document.body.appendChild( layerSelection.dom );

    console.log( layerSelection.selection );

    // Default to part view
    editor.signals.partView.dispatch();

    // var preview = new Preview( editor );
    // document.body.appendChild( preview.dom );

    //

    function addScreenBlocker() {

        var screenBlock = document.createElement("div");
        screenBlock.className = "screen-block";
        screenBlock.id = "screenBlock";
        screenBlock.style.display = "none"
        document.body.appendChild(screenBlock);

    }

    // Block screen while editor.json is being loaded
    document.getElementById("screenBlock").style.display = "block";

    // Load in editor from the cloud
    console.log("fetching URL:", editorURL);
    fetch(editorURL, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
    })
    .then(response => response.json())
    .then(data => {

        console.log("DATA:", data);

        editor.fromJSON( data );

        var timeout;

        async function saveState() {

            clearTimeout( timeout );

            timeout = setTimeout( function () {

                editor.signals.savingStarted.dispatch();

                timeout = setTimeout( async function () {

                    // Save to cloud
                    console.log("Saving to cloud.");

                    Save( editor, username, editorID )
                    .then( (response) => {

                        console.log(response);
                        setTimeout( function() { editor.signals.savingFinished.dispatch(); }, 2000);
                        
                    });

                }, 0.01 ); // 100

            }, 0.01 ); // 1000

        }

        var signals = editor.signals;

        // force save even if not autosaving when the home button is clicked
        // signals.homeButtonClicked.add( saveState );

        //

        document.addEventListener( 'dragover', function ( event ) {

            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';

        }, false );

        document.addEventListener( 'drop', function ( event ) {

            event.preventDefault();
            // console.log("file dropped.");

            if ( event.dataTransfer.types[ 0 ] === 'text/plain' ) return; // Outliner drop

            if ( editor.viewMode == 'Part' ) {

                if ( event.dataTransfer.items ) {

                    // DataTransferItemList supports folders
                    // This block is called when dropping in a random STL. 
                    editor.loader.loadItemList( event.dataTransfer.items );

                } else {

                    editor.loader.loadFiles( event.dataTransfer.files );

                }

            }
            
        }, false );

        function onWindowResize() {

            editor.signals.windowResize.dispatch();

        }

        window.addEventListener( 'resize', onWindowResize, false );

        onWindowResize();

        // Allow access to screen
        document.getElementById("screenBlock").style.display = "none";
        
        signals.save.add( function() {

            // Create new ID to update "timestamp"
            editor.editorID = CreateID();

            // Array of promises ( only execute delete once objects are successfully copied to new location )
            var copyPromises = [];

            // Move old info into new path
            let origin_path = 'Users/' + editor.username + '/projects/' + editor.oldID + '/info.json';
            let destination_path = 'Users/' + editor.username + '/projects/' + editor.editorID + '/info.json';
            copyPromises.push( Move( origin_path, destination_path, editor ) );

            // Move old gcode into new path
            origin_path = 'Users/' + editor.username + '/projects/' + editor.oldID + '/plate.gcode';
            destination_path = 'Users/' + editor.username + '/projects/' + editor.editorID + '/plate.gcode';
            copyPromises.push( Move( origin_path, destination_path, editor ) );

            console.log("copyPromises:", copyPromises);

            Promise.all( copyPromises ).then( () => {

                // Delete old info
                let old_folder_path = 'Users/' + editor.username + '/projects/' + editor.oldID + '/';
                console.log(old_folder_path)
                Delete( old_folder_path, editor ).then(
                    () => {
                        // Allow editor to be exited when Menubar.Home is ready
                        if (!editor.saveFulfilled) {
                            editor.delMoveFulfilled = true;
                        } else {
                            window.location='/';
                        }
                    }
                );

            } )

        })

    });

}

export { main }