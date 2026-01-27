
import { BreathViewModel } from './viewmodel/BreathViewModel.js';
import { renderBreathView } from './view/BreathRenderer.js';

export class BreathController {
    constructor(container) {
        this.container = container;
        this.vm = new BreathViewModel();
    }

    toggle(sceneText) {
        this.vm.toggle(sceneText);
        this.render();
    }

    render() {
        if (!this.vm.enabled) return;
        renderBreathView(
            this.container,
            this.vm.getViewState(),
            index => this.vm.confirmCut(index)
        );
    }
}
