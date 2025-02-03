import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './GameEnvironment.css';

const frustumSize = 5
const aspect = 1; // Keep it square

class PlayerCursor {
    constructor(username, position = new THREE.Vector2(0, 0)) {
        this.username = username;
        this.position = position;
        const geometry = new THREE.BoxGeometry(0.1,0.1,0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.pointer = new THREE.Mesh(geometry, material);
    }

    getGeometry(){
        return this.pointer;
    }

    updatePosition(newX, newY) {
        newX = newX * 2 * frustumSize - frustumSize
        newY = -newY * 2 * frustumSize + frustumSize
        this.position.set(newX, newY);
        this.pointer.position.set(newX, newY, 1);
    }
}

class GameManager {
    constructor(container) {
        this.TOOLBAR_PADDING = 42;
        this.container = container;
        this.playerCursors = {};
        this.initThree();
    }

    initThree() {
        if (!this.container) return;

        this.size = Math.min(window.innerWidth, window.innerHeight - this.TOOLBAR_PADDING);
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(
            -frustumSize * aspect,  // left
            frustumSize * aspect,   // right
            frustumSize,            // top
            -frustumSize,           // bottom
            0.1,                    // near
            1000                    // far
        );
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(this.size, this.size);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    updateGameState(newGameState) {
        if(!newGameState) return;
        newGameState.players.forEach((p) => {
            if (this.playerCursors[p.username]) {
                this.playerCursors[p.username].updatePosition(p.cursorX, p.cursorY);
            } else {
                let newPlayerCursor = new PlayerCursor(p.username, new THREE.Vector2(p.cursorX, p.cursorY));
                this.playerCursors[p.username] = newPlayerCursor;
                this.scene.add(newPlayerCursor.getGeometry());
            }
        });
    }

    getCursorPosition(event) {
        const rect = this.container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        return [x, y];
    }

    handleResize() {
        this.size = Math.min(window.innerWidth, window.innerHeight - this.TOOLBAR_PADDING);
        this.renderer.setSize(this.size, this.size);
        this.camera.aspect = 1;
        this.camera.updateProjectionMatrix();
    }

    cleanup() {
        window.removeEventListener('resize', this.handleResize);
        this.container.removeEventListener('mousemove', this.getCursorPosition);
        this.renderer.dispose();
        this.container.innerHTML = '';
    }
}

function GameEnvironment({ started, gameState, sendMessage }) {
    const containerRef = useRef(null);
    const gameManagerRef = useRef(null);

    useEffect(() => {
        const handleResizeEvent = () => gameManagerRef.current?.handleResize();
        window.addEventListener('resize', handleResizeEvent);

        return () => {
            gameManagerRef.current?.cleanup();
            window.removeEventListener('resize', handleResizeEvent);
        };
    }, []);

    useEffect(() => {
        if (containerRef.current && started) {
            gameManagerRef.current = new GameManager(containerRef.current);
        }
    }, [started]);

    useEffect(() => {
        if (gameManagerRef.current) {
            //console.log(gameState)
            gameManagerRef.current.updateGameState(gameState);
        }
    }, [gameState]);

    const handleMouseMove = (event) => {
        if (!gameManagerRef.current) return;
        const [x, y] = gameManagerRef.current.getCursorPosition(event);
        sendMessage("gameMessage", { cursorX: x, cursorY: y });
    };

    return <div id="threejs-canvas" className="threejs-canvas" ref={containerRef} onMouseMove={handleMouseMove}></div>;
}

export default GameEnvironment;
