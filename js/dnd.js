class Dnd {
  constructor() {
    this.status = document.querySelector('#status');
    this.statusTouch = document.querySelector('#statusTouch');
    this.activeEvent = null;
    this.dragSourceItem = null;
    this.dndEffect = 'copy';
    this.draggableElements = document.querySelectorAll('.draggable');
    this.dropZone = document.querySelector('#dropZone');
    this.draggableElements.forEach(element => element.addEventListener('dragstart', this.handleDragStart.bind(this)));
    this.draggableElements.forEach(element => element.addEventListener('dragend', this.handleDragEnd.bind(this)));
    this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
    this.draggableElements.forEach(element => element.addEventListener('touchstart', this.handleTouchStart.bind(this)));
    this.draggableElements.forEach(element => element.addEventListener('touchmove', this.handleTouchMove.bind(this)));
    this.draggableElements.forEach(element => element.addEventListener('touchend', this.handleTouchEnd.bind(this)));
  }

  handleDragStart(ev) {
    const target = ev.target;
    if (!target.closest('.draggable')) return;
    target.style.opacity = '0.4';
    this.dragSourceItem = target;
    this.dndEffect = target.classList.contains('cloned') ? 'move' : 'copy';
    ev.dataTransfer.effectAllowed = this.dndEffect;
    console.log(">>>>> ", this.dndEffect)
    ev.dataTransfer.setData('text/plain', target.innerText);
    this.status.innerHTML = `start drag ${target.innerText}`;
  }

  handleDragOver(ev) {
    ev.preventDefault();
    const target = ev.target;
    this.status.innerHTML = `over drag ${target.innerText}`;
  }

  handleDragEnter(ev) {
    ev.preventDefault();
    const target = ev.target;
    this.dropZone.style = `border: 2px dashed green`;
    this.status.innerHTML = `enter drag ${target.innerText}`;
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    const target = ev.target;
    this.dropZone.style = `border: 2px solid #ccc`;
    this.status.innerHTML = `leave drag ${target.innerText}`;
  }

  handleDragEnd(ev) {
    ev.stopPropagation();
    const target = ev.target;
    this.dragSourceItem.style.opacity = 1;
    this.status.innerHTML = `end ${target.innerText}`;
    this.dragSourceItem = null;
    return false;
  }

  handleDrop(ev) {
    ev.stopPropagation();
    const target = ev.target;
    const clone = this.dragSourceItem.cloneNode(true);
    clone.style.opacity = 1;
    clone.classList.add('cloned');
    this.dropZone.appendChild(clone); //FIXME check if move or copy
    clone.addEventListener('dragstart', this.handleDragStart.bind(this));
    clone.addEventListener('dragend', this.handleDragEnd.bind(this));
    this.dropZone.style = `border: 2px solid #ccc`;
    const children = Array.from(this.dropZone.children);
    document.querySelector('#expression').value = children.reduce((acc, curr) => acc + curr.innerText + ' ', '');
    this.status.innerHTML = `drop ${target.innerText}`;
    return false;
  }

  handleTouchStart(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target.getAttribute('draggable') && !this.activeEvent && !target.classList.contains('cloned')) {
      const touchLocation = ev.targetTouches[0];
      const pageX = (touchLocation.pageX - 20) + "px";
      const pageY = (touchLocation.pageY - 20) + "px";
      this.activeEvent = 'start';
      this.statusTouch.innerHTML = `touch start drag ${target.innerText}`;
      const clone = target.cloneNode(true);
      clone.style.backgroundColor = target.style.backgroundColor;
      target.after(clone);
      target.classList.add('cloned');
      target.style.position = "absolute";
      target.style.left = pageX;
      target.style.top = pageY;
      target.style.opacity = '.7';
      clone.addEventListener('touchstart', this.handleTouchStart.bind(this));
      clone.addEventListener('touchmove', this.handleTouchMove.bind(this));
      clone.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  }

  handleTouchMove(ev) {
    const target = ev.target;
    if (target.classList.contains('cloned')) {
      const touchLocation = ev.targetTouches[0];
      const pageX = (touchLocation.pageX - 20) + "px";
      const pageY = (touchLocation.pageY - 20) + "px";
      target.style.position = "absolute";
      target.style.left = pageX;
      target.style.top = pageY;
      this.activeEvent = 'move';
      this.inDropZone(this.dropZone.getBoundingClientRect(), target);
    }

  }

  handleTouchEnd(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (this.activeEvent === 'move') {
      const droppedZoneBox = this.dropZone.getBoundingClientRect();
      if (this.validDropZone(droppedZoneBox, target)) {
        const children = Array.from(this.dropZone.children);
        let index = -1;
        for (let i = 0; i < children.length; i++) {
          if (this.validDropZone(children[i].getBoundingClientRect(), target)) {
            index = i;
            break;
          }

        }

        if (index > -1) {
          this.dropZone.insertBefore(target, this.dropZone.children[index + 1]);
          target.style.position = "initial";
          target.style.opacity = 1;
          this.statusTouch.innerHTML = `touch end dropped ${target.innerText}`;
        } else {
          this.dropZone.appendChild(target);
          target.style.position = "initial";
          target.style.opacity = 1;
          this.statusTouch.innerHTML = `touch end dropped ${target.innerText}`;
        }
        const childrenBefore = Array.from(this.dropZone.children);
        document.querySelector('#expression').value = childrenBefore.reduce((acc, curr) => acc + curr.innerText + ' ', '');
      } else {
        this.statusTouch.innerHTML = `touch end remove ${target.innerText}`;
        this.removeTouchListeners(target);
        target.remove();
      }
      this.activeEvent = null;
      this.dropZone.style = `border: 2px solid #ccc`;
    }
  }


  inDropZone(box, target) {
    if (this.validDropZone(box, target)) {
      this.dropZone.style = `border: 2px dashed green`;
    } else {
      this.dropZone.style = `border: 2px solid #ccc`;
    }
  }

  validDropZone(box, target) {
    const { top, left } = this.getCoords(target);
    return (left > box.left && left < box.right) && (top > box.top && top < box.bottom);

  }
  getCoords(elem) {
    const box = elem.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset,
      right: box.right + window.pageXOffset,
      bottom: box.bottom + window.pageYOffset,
      left: box.left + window.pageXOffset
    };
  }

  removeTouchListeners(target) {
    target.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    target.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    target.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

export default Dnd;