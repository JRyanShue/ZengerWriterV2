

async function Slice( editor, IP, saveString ) {

    // Use to ensure changes register
    console.log( "\(v1.1\) Slicing STL..." );

    // Generate STL blob from build plate
    var { STLExporter } = await import( '../../examples/jsm/exporters/STLExporter.js' );
    var exporter = new STLExporter();
    var buffer = exporter.parse( editor.scene, { binary: true } );
    var blob = new Blob( [ buffer ], { type: 'application/octet-stream' } );

    // Build FormData object
    let formData = new FormData();
    await buildFormData ( editor, formData, blob );
    await sliceSTL( IP, formData );
    fetchGcode( IP, saveString );

}

async function buildFormData ( editor, formData, blob ) {

    formData.append( 'stl', blob, 'modelSTL.stl' );
    formData.append( 'action', "slice" );

    editor.settings.set( formData );

}

async function sliceSTL ( IP, formData ) {

    // Send FormData to backend for slicing
    const response = await fetch( 'http://' + IP + '/put_stl',
    {
        method: 'POST',
        body: formData,
    } );

}

async function fetchGcode( IP, saveString ) {

    await fetch( 'http://' + IP + '/get_gcode' ) // get_gcode
        .then( response => response.text() )  // use .text() because it's a gcode file, not JSON
        .then( value => {
            returnGcode( value, saveString );
        })  // callback for handling gcode value)

}

function returnGcode( gcode, saveString ) {

    console.log( gcode );
    saveString( gcode, "model.gcode" );

}

export { Slice };