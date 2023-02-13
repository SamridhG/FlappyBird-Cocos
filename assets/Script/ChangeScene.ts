import { _decorator, Component, Node, Input, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("change_Scene")
export class change_Scene extends Component {
  changeScene() {
    console.log("Scene Change Event Start ");
    director.loadScene("GamePlay");
  }
  onLoad() {
    this.node.on(Input.EventType.TOUCH_START, this.changeScene, this);
  }
  start() {}

  update(deltaTime: number) {}
}
