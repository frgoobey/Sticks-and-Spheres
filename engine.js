class ForestEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.entities = []; // List of all game objects
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Handle window resizing
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // Add an object to the engine
    addEntity(entity) {
        this.entities.push(entity);
        if (entity.mesh) this.scene.add(entity.mesh);
    }

    // Remove an object
    removeEntity(id) {
        this.entities = this.entities.filter(e => {
            if (e.id === id) {
                this.scene.remove(e.mesh);
                return false;
            }
            return true;
        });
    }

    // The "Heartbeat" of your game
    start() {
        const loop = () => {
            requestAnimationFrame(loop);
            const deltaTime = this.clock.getDelta();

            // Update every entity (movement, animation, etc.)
            this.entities.forEach(entity => {
                if (entity.update) entity.update(deltaTime);
            });

            this.renderer.render(this.scene, this.camera);
        };
        loop();
    }
}
