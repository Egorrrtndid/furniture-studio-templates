const content = JSON.parse(document.querySelector('#site-data').textContent);
const header = document.querySelector('header');
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-open', open);
});
document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  header.classList.remove('menu-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    menu.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-open');
  }
});

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  document.querySelectorAll('.project').forEach(project => {
    project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
  });
}));

const projectDialog = document.querySelector('#project-dialog');
let selectedProject = 0;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  selectedProject = Number(button.dataset.project);
  const image = document.querySelector('#dialog-image');
  image.src = ['living.png', 'kitchen.png', 'dining.png'][selectedProject];
  image.alt = content.projectnames[selectedProject];
  document.querySelector('#dialog-title').textContent = content.projectnames[selectedProject];
  document.querySelector('#dialog-details').textContent = content.projectdetail[selectedProject];
  projectDialog.showModal();
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
document.querySelector('#project-inquire').addEventListener('click', () => {
  document.querySelector('[name=project]').selectedIndex = [1, 0, 2][selectedProject];
  projectDialog.close();
  location.hash = 'inquiry';
});

document.querySelectorAll('[data-material]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.material);
  document.querySelector('.material-preview').className = `material-preview m${index}`;
  document.querySelector('#material-name').textContent = content.matnames[index];
  document.querySelector('#material-description').textContent = content.matdesc[index];
  document.querySelector('#material-number').textContent = `0${index + 1}`;
  document.querySelectorAll('[data-material]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));

const form = document.querySelector('#inquiry-form');
const firstStep = document.querySelector('#step-one');
const secondStep = document.querySelector('#step-two');
const locationInput = form.elements.location;
if (content.lang === 'en') {
  locationInput.pattern = '[0-9]{5}(-[0-9]{4})?';
  locationInput.inputMode = 'numeric';
  locationInput.title = 'Enter a five-digit ZIP code or ZIP+4.';
}
function changeStep(second) {
  firstStep.hidden = second;
  secondStep.hidden = !second;
  secondStep.disabled = !second;
  document.querySelector('#step-indicator').textContent = second ? '02 / 02' : '01 / 02';
  document.querySelector('.progress span').style.width = second ? '100%' : '50%';
  (second ? form.elements.name : form.elements.project).focus();
}
document.querySelector('#next').addEventListener('click', () => {
  if (locationInput.reportValidity()) changeStep(true);
});
document.querySelector('#back').addEventListener('click', () => changeStep(false));
let requestText = '';
form.addEventListener('submit', event => {
  event.preventDefault();
  if (secondStep.hidden) {
    if (locationInput.reportValidity()) changeStep(true);
    return;
  }
  const values = new FormData(form);
  requestText = [content.request, '', `${content.projectlabel} ${values.get('project')}`, `${content.city}: ${values.get('location')}`, `${content.budget}: ${values.get('budget')}`, `${content.name}: ${values.get('name')}`, `${content.email}: ${values.get('email')}`, '', String(values.get('notes') || '')].join('\n');
  document.querySelector('#request-text').textContent = requestText;
  document.querySelector('#copy-status').textContent = '';
  document.querySelector('#request-dialog').showModal();
});
document.querySelector('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(requestText);
    document.querySelector('#copy-status').textContent = content.copied;
  } catch {
    document.querySelector('#copy-status').textContent = content.lang === 'uk' ? 'Скопіюйте текст вручну або завантажте заявку.' : 'Select the text to copy it, or download your inquiry.';
  }
});
document.querySelector('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([requestText], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `project-inquiry-${content.lang}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
