class Dnd {
  constructor() {
    this.status = document.querySelector('#status');
    this.statusTouch = document.querySelector('#statusTouch');
    this.activeEvent = null;
    this.draggableElements = document.querySelectorAll('.draggable');
    this.draggableElements.forEach(element => element.addEventListener('dragstart', this.handleDragStart.bind(this)));
    this.draggableElements.forEach(element => element.addEventListener('touchstart', this.handleTouchStart.bind(this)));
    this.draggableElements.forEach(element => element.addEventListener('touchmove', this.handleTouchMove.bind(this)));
    this.draggableElements.forEach(element => element.addEventListener('touchend', this.handleTouchEnd.bind(this)));
    this.dropZone = document.querySelector('#dropZone');
  }

  handleDragStart(ev) {
    ev.preventDefault();
    const target = ev.target;
    this.status.innerHTML = `start drag ${target.innerText}`;
  }

  handleTouchStart(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target.getAttribute('draggable') && !this.activeEvent) {
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
    }

  }

  handleTouchEnd(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (this.activeEvent === 'move') {
      const pageX = (parseInt(target.style.left) - 20);
      const pageY = (parseInt(target.style.top) - 20);
      if (this.validDropZone(this.dropZone.offsetLeft, this.dropZone.offsetTop, pageX, pageY, this.dropZone.clientWidth, this.dropZone.clientHeight)) {
        console.log(this.dropZone.offsetLeft, this.dropZone.offsetTop, pageX, pageY, this.dropZone.offsetWidth, this.dropZone.offsetHeight)
        this.dropZone.appendChild(target);
        target.style.position = "initial";
        this.statusTouch.innerHTML = `touch end dropped ${target.innerText}`;
      } else {
        this.statusTouch.innerHTML = `touch end remove ${target.innerText}`;
        target.remove();
      }
      this.activeEvent = null;
    }
  }

  validDropZone(x1, y1, x2, y2, w, h) {
    if (x2 - x1 > w)
      return false;
    if (y2 - y1 > h)
      return false;
    return true;
  }
}

export default Dnd;