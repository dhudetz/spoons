import React, { useEffect } from 'react';
import * as THREE from 'three';
import './GameEnvironment.css';

function GameEnvironment({gameState, sendMessage, errorMessage, showScreen}) {
    const TOOLBAR_PADDING = 42;

    useEffect(() => {
        const { scene, camera, renderer, container } = initThree();

        if (!renderer) return;

        const handleResizeEvent = () => handleResize(camera, renderer);
        window.addEventListener('resize', handleResizeEvent);
        container.addEventListener('mousemove', (event) => {
            const [x, y] = getCursorPosition(event, container);
            sendMessage("gameMessage", {"cursorX":x, "cursorY":y})
        });

        return () => {
            window.removeEventListener('resize', handleResizeEvent);
            container.removeEventListener('mousemove', getCursorPosition);

            // Cleanup Three.js elements
            renderer.dispose();
            container.innerHTML = ''; // Clears the canvas
        };
    }, []);

    function getCursorPosition(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        return [x, y];
    }

    function initThree() {
        const container = document.getElementById('threejs-canvas');
        if (!container) return {};

        const size = Math.min(window.innerWidth, window.innerHeight - TOOLBAR_PADDING);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(size, size);
        container.appendChild(renderer.domElement);

        // Create a rotating cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }

        animate();

        return { scene, camera, renderer, container: renderer.domElement };
    }

    function handleResize(camera, renderer) {
        const newSize = Math.min(window.innerWidth, window.innerHeight - TOOLBAR_PADDING);
        renderer.setSize(newSize, newSize);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }

    return <div id="threejs-canvas" className="threejs-canvas"></div>;
}

export default GameEnvironment;
