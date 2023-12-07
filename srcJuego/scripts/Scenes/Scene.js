import Player from '../Objects/Player.js'
//import MeleeEnemy from './MeleeEnemy.js'
import RangeEnemy from '../Objects/RangeEnemy.js'
import Pool from '../Pool.js'
import Bullet from '../Objects/Bullet.js'
import Enemy from '../Objects/Enemy.js'
import InteractuableObjects from '../Objects/InteractuableObject.js'
import Dicotomías from '../Dicotomias.js'
export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: "level" })
    }
    //data transfer
    init() {

    }
    //load data
    preload() {

        let srcJuego = 'srcJuego';
        //carga de imagenes y SpriteSheets
        this.load.image('kirby', srcJuego + '/img/kirby.png');
        this.load.image('polvos', srcJuego + '/img/polvos.jpg');


        //this.load.image('player',srcJuego+ '/Sprites/Character/with_hands/death_0 - copia - copia.png');   
        this.load.spritesheet('player', srcJuego + '/sprites/Character/with_hands/SpriteSheets/walkSheet.png',
            { frameWidth: 204, frameHeight: 204});

        this.load.spritesheet('idlePlayer', srcJuego + '/sprites/Character/with_hands/SpriteSheets/idleSheet.png',
            { frameWidth: 204, frameHeight: 204 });

        //this.load.image('enemy', srcJuego+ '/Sprites/Enemy1/death_0.png');   
        this.load.spritesheet('enemy', srcJuego + '/sprites/Enemy1/SpriteSheets/walkSheet.png',
            { frameWidth: 204, frameHeight:204});

        this.load.spritesheet('idleEnemy', srcJuego + '/sprites/Enemy1/SpriteSheets/idleSheet.png',
            { frameWidth: 2048, frameHeight: 2048 });


        //carga del tilemap
        this.load.tilemapTiledJSON('tilemap', srcJuego + '/tiled/prueba2.json');

        //carga del tileset
        this.load.image('patronesTilemap', srcJuego + '/tiled/arte/Dungeon_Tileset.png');


        /**carga de json de datos de los distintos enemigos
         * 
         * tanto este como el siguente creo que necesitan una vuelta de tuerca para que nos sean todavia mas utiles
         * por ejemplo guardando la clave de animacion de ese tipo de enemigo entre otras cosas 
         * 
         * Por otra parte creo que es util ser conscientes que todos los objetos que tenemos en el juego tienen como mucho animaciones de
         * andar y de recibir danio (del feedback del danio creo que hace falta hablarlo)
         */
        this.load.json('data', 'srcJuego/scripts/JSON/data.json');

        this.load.json('waves', 'srcJuego/scripts/JSON/waves.json');

        this.cameras.main.zoom= 2;
    }

    //instance
    create() {//igual es recomendable que se haga una seccion de creacion de animaciones ya que asi ya estan listas cuando hagan falta

        //variables de las oleadas
        this.waveData = {
            waveTime: 0,
            waveCount: 0
        }
        this.maxMasillaTime = 500;
        this.masillasTimer = 0;
        this.data = this.game.cache.json.get('data');
        this.wave = this.game.cache.json.get('waves');

        // Cursor personalizado
        this.input.setDefaultCursor('url(srcJuego/img/crosshair.png) 16 16, pointer');

        //creacion del jugador
        this.player = new Player(this, 960, 540, ['idlePlayer', 'PlayerMove'], this.data.PlayerConfig);

        this.dicotomyManager = new Dicotomías(this.player, 50, 50, 50, 50);
        this.dicotomyManager.AplieDicotomy(1);
        this.dicotomyManager.AplieDicotomy(2);

        //para orden de render
        this.player.setDepth(10);

        //inicializar las pools
        this.setPools();

        //creacion de las animaciones
        this.setAnimations();

        //creacion del tilemap y variables asociadas
        this.setTileMap();

        //ajuste de las colisiones
        this.setCollisions();

        //#endregion

        //this. boton = new Button(this,200,200,'kirby',function(){console.log("tu vieja")});
        //variables para el input
        this.up = this.input.keyboard.addKey('W');
        this.left = this.input.keyboard.addKey('A');
        this.down = this.input.keyboard.addKey('S');
        this.right = this.input.keyboard.addKey('D');

        this.esc = this.input.keyboard.addKey('ESC');


        this.esc.on('down', event => {
            this.scene.sleep('UIScene');
            this.scene.launch('Menu');
            this.scene.setActive(false);
        });
        // Recogida del input de movimiento en un vector
        this._inputVector = new Phaser.Math.Vector2(0, 0);

    }

    //game tick
    update(t, dt) {

        this.playerMove();


        //actualizacion de temporizadores, le sumamos el delta time, milisegundos
        this.masillasTimer += dt;
        this.waveData.waveTime += dt;

        this.oleadasLogic();

        this.masillasLogic();

        //la cámara sigue al jugador
        this.cameras.main.startFollow(this.player);
    }

    /**inicializacion de la pools */
    setPools() {

        // creacion de pools
        this.playerBulletsPool = new Pool(this, 20);//cambiar los magics numbers por constantes
        this.enemiesBulletsPool = new Pool(this, 200);
        this.meleeEnemiesPool = new Pool(this, 50);
        this.rangeEnemiesPool = new Pool(this, 50);
        this.dustPool = new Pool(this, 100);


        let plBullets = [];

        for (let i = 0; i < 100; i++) {
            let aux = new Bullet(this, 0, 0, 'kirby', true, 0, 0, this.playerBulletsPool);
            aux.setDepth(10);
            plBullets.push(aux);
        }

        //rellenar pool de balas del player
        this.playerBulletsPool.addMultipleEntity(plBullets);

        let enBullets = [];

        for (let i = 0; i < 100; i++) {
            let aux = new Bullet(this, 0, 0, 'kirby', true, 0, 0, this.enemiesBulletsPool);
            aux.setDepth(10);
            enBullets.push(aux);
        }
        this.enemiesBulletsPool.addMultipleEntity(enBullets);

        let enemysArr = [];

        for (let i = 0; i < 100; i++) {
            let aux = new Enemy(this, 0, 0, ['idleEnemy', 'enemyMove'], this.meleeEnemiesPool);
            aux.setDepth(10);
            enemysArr.push(aux);
        }

        this.meleeEnemiesPool.addMultipleEntity(enemysArr);

        let rangeArr = [];

        for (let i = 0; i < 100; i++) {
            let aux = new RangeEnemy(this, 0, 0, ['idleEnemy', 'enemyMove'], this.rangeEnemiesPool);
            aux.setDepth(10);
            rangeArr.push(aux);
        }

        this.rangeEnemiesPool.addMultipleEntity(rangeArr);

        let dustArr = [];

        for (let i = 0; i < 100; i++) {
            let aux = new InteractuableObjects(this, 0, 0, 'polvos', this.dustPool, (amount) => {
                aux.setDepth(10);
                this.player.addDust(amount);
            });
            dustArr.push(aux);
        }

        this.dustPool.addMultipleEntity(dustArr);
    }
    /**configuracion de las colisiones y triggers */
    setCollisions() {
        //colision entre enemigos
        this.physics.add.collider(this.meleeEnemiesPool.group, this.meleeEnemiesPool.group);
        this.physics.add.collider(this.rangeEnemiesPool.group, this.rangeEnemiesPool.group);
        this.physics.add.collider(this.meleeEnemiesPool.group, this.rangeEnemiesPool.group);
        //colisiones entre las balas del jugador y los enemigos melee
        this.physics.add.collider(this.playerBulletsPool.group, this.meleeEnemiesPool.group, function (proyectle, enemy) {
            let dmg1 = proyectle.damage;
            let dmg2 = enemy.health;
            enemy.Hit(dmg1);
            proyectle.Hit(dmg2, false);
            enemy.scene.player.addEureka();
        });
        //colisiones entre las balas del jugador y los enemigos a rango
        this.physics.add.collider(this.playerBulletsPool.group, this.rangeEnemiesPool.group, function (proyectle, enemy) {
            let dmg1 = proyectle.damage;
            let dmg2 = enemy.health;
            enemy.Hit(dmg1);
            proyectle.Hit(dmg2, false);
            enemy.scene.player.addEureka()
        });


        //colisiones entre el jugador y los enemigos melee
        this.physics.add.collider(this.player, this.meleeEnemiesPool.group, function (player, enemy) {

            // Si el enemigo está listo para atacar, el player recibe un golpe y se reinicia el cooldown del ataque del enemigo.
            if (enemy._CDMeleeTimer <= 0) {
                //console.log(enemy);
                player.Hit(enemy.damage, 1);
                enemy._CDMeleeTimer = enemy._meleeAttackCD;
                player.addRage();
            }
        });

        //colisiones entre el jugador y los enemigos de rango
        this.physics.add.collider(this.player, this.rangeEnemiesPool.group, function (player, enemy) {

            //falta rellenar, seguramente se muy similar a los enemigos meele
        });


        //colisiones entre el jugador y las balas de los enemigos
        this.physics.add.collider(this.player, this.enemiesBulletsPool.group, function (player, bullet) {
            let dmg1 = bullet.damage;
            let dmg2 = player.health;
            //tengase en cuenta que si el jugador no tiene vida las balas no se desturyen (esto no va a pasar)
            bullet.Hit(dmg2, true);
            player.Hit(dmg1, 2);

            //console.log(bullet.health);
            player.addRage();
        });


        //colisiones con el trigger de los polvos
        this.physics.add.overlap(this.player, this.dustPool.group, function (player, dust) {
            dust.Hit();
            player.addDust(dust.amount);
        })

        // Colisiones de las capas del tilemap

        //decimos que las paredes tienen colisiones
        this.wallLayer.setCollisionByExclusion([-1], true);

        //añadimos las colisiones de los objetos con las capas
        this.physics.add.collider(this.player, this.wallLayer);
        this.physics.add.collider(this.meleeEnemiesPool.group, this.wallLayer);
        this.physics.add.collider(this.rangeEnemiesPool.group, this.wallLayer);

        //faltan las colisiones de las balas con las paredes


    }

    /**configuracion del tile map */
    setTileMap() {

        // Objeto tilemap       
        this.map = this.make.tilemap({
            key: 'tilemap',
            tileWidth: 32,
            tileHeight: 32
        });

        //tileset
        const tileset1 = this.map.addTilesetImage('Dungeon_Tileset', 'patronesTilemap');

        // creamos las diferentes capas a través del tileset. El nombre de la capa debe aparecer en el .json del tilemap cargado
        this.groundLayer = this.map.createLayer('Suelo', tileset1);
        this.wallLayer = this.map.createLayer('Pared', tileset1);


        //creamos el array de spawn points
        this.spawnPoints = this.map.createFromObjects('Spawns');

        //los hacemos invisibles para que no se vean
        for (let i = 0; i < this.spawnPoints.length; i++) {
            this.spawnPoints[i].setVisible(false);
        }

    }

    setAnimations() {
        //creación de las animaciones del jugador
        this.anims.create({
            key: 'PlayerMove',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 10, // Velocidad de la animación
            repeat: -1    // Animación en bucle
        });

        this.anims.create({
            key: 'idlePlayer',
            frames: this.anims.generateFrameNumbers('idlePlayer', { start: 0, end: 5 }),
            frameRate: 10, // Velocidad de la animación
            repeat: -1    // Animación en bucle
        });

        //creación de animaciones para enemigos
        this.anims.create({
            key: 'enemyMove',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 6 }),
            frameRate: 10, // Velocidad de la animación
            repeat: -1    // Animación en bucle
        });

        this.anims.create({
            key: 'idleEnemy',
            frames: this.anims.generateFrameNumbers('idleEnemy', { start: 0, end: 5 }),
            frameRate: 10, // Velocidad de la animación
            repeat: -1    // Animación en bucle
        });
    }


    playerMove() {
        //actualizar el valor del vector del input
        this._inputVector.x = this.right.isDown == this.left.isDown ? 0 : this.right.isDown ? 1 : -1;
        this._inputVector.y = this.up.isDown == this.down.isDown ? 0 : this.up.isDown ? -1 : 1;

        // Modificamos el vector de movimiento del player a partir del inputVector
        this.player.SetDirection(this._inputVector);
    }


    //oleadas
    oleadasLogic() {


        //console.log(this.wave.Waves[0].timeBetween);
        //console.log(this.waveData.waveTime);
        //si toca spawnear
        if (this.waveData.waveTime > this.wave.Waves[0].timeBetween && this.waveData.waveCount < this.wave.Waves[0].size) {
            //console.log(this.data.EnemyConfigs[0]);
            this.rangeEnemiesPool.spawn(this.wave.Waves[0].x, this.wave.Waves[0].y, 'enemyMove', this.data.RangeConfigs[0]);

            this.waveData.waveTime = 0;
            this.waveData.waveCount++;
        }

    }

    //masillas
    masillasLogic() {

        if (this.masillasTimer > this.maxMasillaTime) {
            let vector = new Phaser.Math.Vector2(0, 0);
            let spawn = Phaser.Math.RandomXY(vector, Phaser.Math.Between(300, 500));
            let enemyNumber = Phaser.Math.Between(0, 2);

            this.meleeEnemiesPool.spawn(this.player.x + spawn.x, this.player.y + spawn.y,
                'enemyMove', this.data.EnemyConfigs[enemyNumber]);
            this.masillasTimer = 0;
            this.maxMasillaTime = Phaser.Math.Between(3000, 6000);
        }

    }

    //buscar los 3 primeros spawn points en un rango
    //esto se deberia llamar cada x tiempo para refrescarlo
    sortSpawnPoints() {

    }
}