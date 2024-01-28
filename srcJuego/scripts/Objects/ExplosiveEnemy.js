import Enemy from "./Enemy.js";
export default class ExplisiveEnemy extends Enemy{

    constructor(scene, x, y, key, pool)
    {
        super(scene, x, y, key, pool, false);
        this.explT = 600;
        //ajustar el tamaño del colider
        this.body.setSize(32,32,false);
        //ajustar el offset del colider
        this.body.setOffset(0,0);
    }

    preUpdate(t,dt){
        //para la animacion
        super.preUpdate(t,dt);
        this.explT = this.explT-1;
        if(this.explT <= 0){
            this.Explosion();
        }
    }

    Explosion(){
        this.play('explosion');
        this.body.setVelocity(0,0);
        this.scene.time.delayedCall(500, this.D, [], this);
    }
    
    D(){
        this.pool.release(this)
    }
}