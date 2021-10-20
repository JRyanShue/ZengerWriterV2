
import * as THREE from 'three';

function EditorLights( editor ) {

    // Ambient Light

    var color = 0x222222;

    var light = new THREE.AmbientLight( color );
    light.name = 'AmbientLight';
    editor.addObject( light );

	var intensity = 1;
    var light = new THREE.DirectionalLight( color, intensity );
	light.name = 'DirectionalLight';
    editor.addObject( light );

    var intensity = 1;
    var distance = 0;
    var light = new THREE.PointLight( color, intensity, distance );
    light.name = 'PointLight';
    editor.addObject( light );

}

export { EditorLights }