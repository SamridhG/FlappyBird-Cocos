import { _decorator, Component, Node, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Restart")
export class Restart extends Component {
  buttonclick() {
    director.loadScene("GameStart");
  }
  start() {}

  update(deltaTime: number) {}
}
