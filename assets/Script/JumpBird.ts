import {
  _decorator,
  Component,
  Node,
  Input,
  UITransform,
  Vec3,
  Sprite,
  absMax,
  Scheduler,
  Prefab,
  NodePool,
  instantiate,
  math,
  Rect,
  game,
  rect,
  director,
  Label,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Jump_Bird")
export class Jump_Bird extends Component {
  @property({ type: Node })
  bird: Node = null;

  @property({ type: Node })
  Background: Node = null;
  @property({ type: Node })
  Background2: Node = null;

  @property({ type: Node })
  Base: Node = null;
  @property({ type: Node })
  Base2: Node = null;

  @property(Prefab)
  Hurdels: Prefab = null;

  Hurdel: Node;
  HurdelPool: NodePool = new NodePool();
  Bird_Position: Vec3 = new Vec3();
  upper_height: number;
  lower_height: number;
  jumpOffset: number = 20;
  xAxis: number;
  poolscount: number = 5;
  HurdelArry: Node[] = [];
  baseWidth: number;
  startHurdel: number = 144;
  distanceBetweenHurdel: number = 200;
  cnavesHight: number;
  canvesWidth: number;
  hurdelsWidth: number;
  Bird_Rect: Rect;
  Base1_Rect: Rect;
  Base2_Rect: Rect;
  Score: number = 0;
  pause: Boolean = false;

  gamePause() {
    if (this.pause == false) {
      game.pause();
      this.pause = true;
      console.log("Pause");
    } else {
      game.resume();
      this.pause = false;
      console.log("Resume");
    }
  }
  gameEnd() {
    //game.pause();
    console.log("Game End");
    //game.resume();
    director.loadScene("GameOver");
  }
  backgroundMove() {
    let Position1 = this.Background.getPosition();
    let Position2 = this.Background2.getPosition();
    Position1.x -= 0.5;
    Position2.x -= 0.5;
    if (Position1.x < -this.baseWidth) {
      Position1.x = this.baseWidth;
    }
    if (Position2.x < -this.baseWidth) {
      Position2.x = this.baseWidth;
    }
    this.Background.setPosition(Position1);
    this.Background2.setPosition(Position2);
  }

  baseMove() {
    let Position1 = this.Base.getPosition();
    let Position2 = this.Base2.getPosition();
    Position1.x--;
    Position2.x--;
    if (Position1.x < -this.baseWidth) {
      Position1.x = this.baseWidth;
    }
    if (Position2.x < -this.baseWidth) {
      Position2.x = this.baseWidth;
    }
    this.Base.setPosition(Position1);
    this.Base2.setPosition(Position2);
  }

  makeHurdels() {
    for (let pole = 0; pole < this.poolscount; pole++) {
      this.Hurdel = instantiate(this.Hurdels);

      this.HurdelPool.put(this.Hurdel);
    }
  }

  addhurdel() {
    // console.log(this.HurdelPool.size());
    if (this.HurdelPool.size()) {
      let poolhardel = this.HurdelPool.get();
      let position = poolhardel.getPosition();
      // for random position
      position.x = this.canvesWidth * 0.5 + this.hurdelsWidth;
      position.y = Math.random() * 80;
      poolhardel.setPosition(position);

      this.node.getChildByName("Hurdels").addChild(poolhardel);
      //haar baar score line active kro jab add ho child
      poolhardel.getChildByName("scoreLine").active = true;
    }
  }

  movehurdel() {
    this.node.getChildByName("Hurdels").children.forEach((hurdle) => {
      let position: Vec3 = hurdle.getPosition();
      if (position.x < -(this.canvesWidth * 0.5 + this.hurdelsWidth * 0.5)) {
        this.HurdelPool.put(hurdle);
      } else {
        position.x--;
        hurdle.setPosition(position);
      }
    });
  }

  jump = () => {
    //console.log("Bird jump");
    this.Bird_Position = this.bird.getPosition();
    if (this.Bird_Position.y < this.upper_height) {
      this.Bird_Position.y = this.Bird_Position.y + this.jumpOffset;
      // console.log(this.Bird_Position.y);
      this.bird.setPosition(this.Bird_Position);
    }
  };

  // for fall
  fall = (deltaTime: number) => {
    // console.log("Bird Fall");
    //console.log(Math.abs(this.Bird_Position.y));
    if (this.Bird_Position.y > this.lower_height) {
      this.Bird_Position = this.bird.getPosition();
      this.Bird_Position.y = this.Bird_Position.y - 5 * deltaTime;
      // console.log(this.Bird_Position.y);
      this.bird.setPosition(this.Bird_Position);
    }
  };

  collisionBase() {
    this.Bird_Rect = this.bird
      .getComponent(UITransform)
      .getBoundingBoxToWorld();
    this.Base1_Rect =
      this.Base.getComponent(UITransform).getBoundingBoxToWorld();
    this.Base2_Rect =
      this.Base2.getComponent(UITransform).getBoundingBoxToWorld();
    if (this.Bird_Rect.intersects(this.Base1_Rect)) {
      console.log("Bird Touches");
      this.gameEnd();
    }
    if (this.Bird_Rect.intersects(this.Base2_Rect)) {
      console.log("Bird Touches base 2");
      this.gameEnd();
    }
  }

  onLoad() {
    this.canvesWidth = this.node.getComponent(UITransform).width;
    this.cnavesHight = this.node.getComponent(UITransform).height;
    this.baseWidth = this.Base.getComponent(UITransform).width;
    this.makeHurdels();

    this.schedule(this.addhurdel, 2);
    this.upper_height =
      this.node.getPosition().y -
      this.bird.getComponent(UITransform).height * 0.5;
    this.lower_height = -(
      this.node.getPosition().y - this.Base.getComponent(UITransform).height
    ); // lower height positive m h isliye negative kiya h kyuki niche ki taraf ja rha aur y ki position negative hogi
    // console.log(this.lower_height);
    this.hurdelsWidth = this.Hurdel.getComponent(UITransform).width;
    this.node.on(Input.EventType.TOUCH_START, this.jump, this);
    this.addhurdel();
  }

  start() {}

  CollisionWithHurdles() {
    this.Bird_Rect = this.bird
      .getComponent(UITransform)
      .getBoundingBoxToWorld();

    let noOfHurdles = this.node.getChildByName("Hurdels").children;

    noOfHurdles.forEach((hurdle) => {
      let hurdleUp = hurdle
        .getChildByName("pipeUp")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();

      let hurdleDwn = hurdle
        .getChildByName("pipeDown")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();

      let scoreLine = hurdle
        .getChildByName("scoreLine")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();
      if (
        this.Bird_Rect.intersects(hurdleUp) ||
        this.Bird_Rect.intersects(hurdleDwn)
      ) {
        console.log("Collided with hurdle!");
        this.gameEnd();
      }

      // jaise intersection ho aur intesection line active ho toh true
      if (
        this.Bird_Rect.intersects(scoreLine) &&
        hurdle.getChildByName("scoreLine").active
      ) {
        // intersection start hone k baad scoreline node to deactive krdo taki update m wapis aye toh score dubara increse na ho
        hurdle.getChildByName("scoreLine").active = false;
        this.Score++;
        console.log(this.Score);
        this.node.getChildByName("Scoreset").getComponent(Label).string =
          this.Score.toString();
      }
    });
  }

  update(deltaTime: number) {
    this.fall(deltaTime * 10);
    // this.hurdelMove();
    this.movehurdel();
    this.baseMove();
    this.backgroundMove();
    this.collisionBase();
    this.CollisionWithHurdles();
  }
}

//*******************************  for one pole */
// hurdelMove() {
//   if (
//     this.Hurdels.getPosition().x <
//     -(
//       this.node.getComponent(UITransform).width +
//       this.Hurdels.getComponent(UITransform).width
//     )
//   ) {
//     this.Hurdels.setPosition(0, 0);
//   }
//   this.xAxis = this.Hurdels.getPosition().x - 0.5;
//   this.Hurdels.setPosition(this.xAxis, this.Hurdels.getPosition().y);
// }

//**** with array */
// hurdelMove() {
//   for (let pole = 0; pole < this.poolscount; pole++) {
//     let Node = this.node
//       .getChildByName("Hurdels")
//       .children[pole].getPosition();
//     if (Node.x < -144) {
//       Node.x = 144 + 200 * pole;
//     }
//     Node.x--;
//     this.node
//       .getChildByName("Hurdels")
//       .children[pole].setPosition(Node.x, Node.y);
//   }
// }

// with nodepool

// hurdel move
// hurdelMove() {
//   for (let pole = 0; pole < this.poolscount; pole++) {
//     let position = this.node
//       .getChildByName("Hurdels")
//       .children[pole].getPosition();
//     if (position.x < -(this.canvesWidth * 0.5 + this.hurdelsWidth)) {
//       position.x = this.canvesWidth * 0.5 + this.distanceBetweenHurdel;
//     }
//     position.x--;
//     console.log(position);
//     this.node.getChildByName("Hurdels").children[pole].setPosition(position);
//   }
// }

///movehurdel
//{
// for (let pole = 0; pole < this.poolscount; pole++) {
//   let position = this.node
//     .getChildByName("Hurdels")
//     .children[pole].getPosition();

//   console.log(
//     "TOTAL HURDLES: ",
//     this.node.getChildByName("Hurdels").children.length
//   );

//   if (position.x < -(this.canvesWidth * 0.5 + this.hurdelsWidth * 0.5)) {
//     this.HurdelPool.put(this.Hurdel);
//     let poolhardel = this.HurdelPool.get();
//     let position = poolhardel.getPosition();
//     position.x = this.startHurdel + this.distanceBetweenHurdel;
//     poolhardel.setPosition(position);
//     this.node.getChildByName("Hurdels").addChild(poolhardel);
//   }
//   position.x--;
//   // console.log(position);
//   this.node.getChildByName("Hurdels").children[pole].setPosition(position);
// }
//}

//////////////  normal method
// // for creating hurdles
// makeHurdels() {
//   for (let pole = 0; pole < this.poolscount; pole++) {
//     this.Hurdel = instantiate(this.Hurdels);
//     this.HurdelPool.put(this.Hurdel);
//     let poolhardel = this.HurdelPool.get();
//     let position = poolhardel.getPosition();
//     position.x = this.startHurdel + this.distanceBetweenHurdel * pole;
//     poolhardel.setPosition(position);
//     this.node.getChildByName("Hurdels").addChild(poolhardel);
//   }
/****** with array */
// for (let pole = 0; pole < this.poolscount; pole++) {
//   this.HurdelArry[pole] = this.HurdelPool.get();
//   let Position = this.HurdelArry[pole].getPosition();
//   Position.x = 144 + 200 * pole;
//   // let ymax = 120;
//   // let ymin = -120;
//   // Position.y = ymin + Math.random() * (ymax - ymin);

//   console.log(Position.x + "  " + Position.y);
//   this.HurdelArry[pole].setPosition(Position.x, Position.y);
//   this.node.getChildByName("Hurdels").addChild(this.HurdelArry[pole]);
//   console.log(pole + " pole");
// }
// }

// for jump upward
