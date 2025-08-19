import './navbar-toggle.css';

export default class NavbarToggle {
  constructor(selector) {
    this.element = document.querySelector(selector);
    if (this.element) {
      this.render();
      this.addBehaviour(this.element);
    }
  }
  render() {
    this.element.innerHTML = `
      <div class="navbar-togglec navbar-toggle-icon-size">
        <svg class="navbar-toggle-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M180.05 261.36l52.87-7.75a18.55 18.55 0 0 0 13.21-8.81l7.13-11.89a19.27 19.27 0 0 1 15.92-9.6 18.54 18.54 0 0 1 18.88 18.53v79.33a8.57 8.57 0 0 0 8.57 8.57H353a8.58 8.58 0 0 0 8.58-8.57v-78.73c0-8.49 5.44-16.3 13.65-18.49A18.55 18.55 0 0 1 396 232.3l7.5 12.5a18.55 18.55 0 0 0 13.21 8.81l52.88 7.75a8.18 8.18 0 0 0 6.61-14.23c-34.79-30.77-101.9-111.82-140.8-208.4a11.39 11.39 0 0 0-21.15 0c-38.9 96.58-106 177.63-140.81 208.4a8.18 8.18 0 0 0 6.61 14.23Z"/>
          <path d="M305.23 480.43h39.19a8.6 8.6 0 0 0 8.6-8.6v-97.61a6.81 6.81 0 0 0-6.81-6.8h-42.77a6.81 6.81 0 0 0-6.81 6.8v97.61a8.6 8.6 0 0 0 8.6 8.6Z"/>
        </svg>

        <svg class="navbar-toggle-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M180.05 261.36l52.87-7.75a18.55 18.55 0 0 0 13.21-8.81l7.13-11.89a19.27 19.27 0 0 1 15.92-9.6 18.54 18.54 0 0 1 18.88 18.53v79.33a8.57 8.57 0 0 0 8.57 8.57H353a8.58 8.58 0 0 0 8.58-8.57v-78.73c0-8.49 5.44-16.3 13.65-18.49A18.55 18.55 0 0 1 396 232.3l7.5 12.5a18.55 18.55 0 0 0 13.21 8.81l52.88 7.75a8.18 8.18 0 0 0 6.61-14.23c-34.79-30.77-101.9-111.82-140.8-208.4a11.39 11.39 0 0 0-21.15 0c-38.9 96.58-106 177.63-140.81 208.4a8.18 8.18 0 0 0 6.61 14.23Z"/>
          <path d="M305.23 480.43h39.19a8.6 8.6 0 0 0 8.6-8.6v-97.61a6.81 6.81 0 0 0-6.81-6.8h-42.77a6.81 6.81 0 0 0-6.81 6.8v97.61a8.6 8.6 0 0 0 8.6 8.6Z"/>
        </svg>
      </div>
    `;
  }
  addBehaviour(element) {
    element.addEventListener('click', (event) => {
      event.preventDefault();

      // hide navbar toggle if visible, show if not visible
      if (element.classList.contains('navbar-toggle_show')) {
        element.classList.remove('navbar-toggle_show');
        element.classList.add('navbar-toggle_hide');
      } else if (element.classList.contains('navbar-toggle_hide')) {
        element.classList.remove('navbar-toggle_hide');
        element.classList.add('navbar-toggle_show');
      }
      // same goes for the actual navbar
      const navbar = document.getElementById('navbar');
      if (navbar.classList.contains('navbar_show')) {
        navbar.classList.remove('navbar_show');
        navbar.classList.add('navbar_hide');
      } else if (navbar.classList.contains('navbar_hide')) {
        navbar.classList.remove('navbar_hide');
        navbar.classList.add('navbar_show');
      }
    });
  }
}
