import Pool from "../Pool.js";

/**@description Clase Base para los objetos dinámicos de la escena
 * @extends Phaser.GameObjects.Sprite
 */
export default class Mob extends Phaser.GameObjects.Sprite{
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {string} key 
     * @param {number} hp puntos de vida de la entidad
     * @param {number} damage danio de la entidad
     * @param {number} speed velocidad de movimiento de la entidad
     * @param {Pool} pool pool a la que pertenece el objeto
     */
    constructor(scene,x,y,key,hp,damage,speed, pool, bool){

        super(scene,x,y,key);
        this.key = key;
        this.health = hp;
        this.damage = damage;
        this.dir;
        this.speed = speed;
        this.pool = pool;
        this.embestir = bool;
        this.tiempo = 0;

        //añadirlo a la escena
        this.scene.add.existing(this);

        //añadirle fisicas
        this.scene.physics.add.existing(this);
    }


    /** @description Mueve el personaje y reproduce su animación de movimient se debe ajustar la dirección y la velicidad de forma externa*/
    Move(){

        if(this.health < 0) return;
        //movimiento del objeto
        
        this.body.setVelocity(this.dir.x*this.speed,this.dir.y*this.speed);
        
        //animacion de movimiento
        if(this.key !== 'kirby' && this.key !== 'bulletPlayer' && this.key !== 'bulletEnemy'){//si no somos una bala
            //animacion de idle
            if(this.dir.y == 0 && this.dir.x == 0){
                //this.stop();//parar la animacion
                this.play(this.key[0],true);
            }
            else{//animacion de movimiento
                this.play(this.key[1],true);//continuar la animacion
            }
        }

        if(this.embestir){
            this.tiempo = this.tiempo - 1;
            if(this.tiempo < 0){
                this.tiempo = 300;
            }
            
        }
    }


    /** @description La entidad recibe una cantidad de danio. Si esta la mata se "Destruye"
     * @param {number} dmg danio a recibir
    */
    ReciveDamage(dmg){
        
        //reducir la vida
        this.health -= dmg;

        //si la vida es menor que 0, y tenemos pool , hacer release
        if(this.health < 0){   
            //this.health = 0;
            if(this.pool != null){
                this.pool.release(this);      
            }
        }
    }

    /**Cambia la direccion y la normaliza
     * @param {Phaser.Math.Vector2D} direccion direccion a la que se quiere ajustar la velocidad */
    SetDirection(direccion){
        if(!this.embestir || this.tiempo <=0){
            this.dir = direccion.normalize();
        }
        
    }
    //dejo este metodo vacio porque realmente cada hijo tiene un comportamiento especifico al ser golpeado
    /**@virtual */
    Hit(dmg){}
    /**@virtual */
    setUp(){}
}