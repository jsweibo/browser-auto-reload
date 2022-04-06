const RECOMMENDED_CONFIG = {
  until: false,
  bypass: false,
  period: 2,
};

const configForm = document.querySelector('#config');
const untilInput = document.querySelector('#until');
const bypassInput = document.querySelector('#bypass');
const periodInput = document.querySelector('#period');
const hintField = document.querySelector('.hint-field');
const hintText = document.querySelector('.hint-field .hint');
let needSave = false;

function notify({ type = '', message = '' }) {
  if (hintField.classList.length === 1) {
    hintText.textContent = message;
    if (type === 'success') {
      hintText.classList.add('hint_success');
      hintField.classList.add('hint-field_visible');
      setTimeout(function () {
        hintField.classList.remove('hint-field_visible');
        hintText.classList.remove('hint_success');
      }, 1e3);
    } else {
      hintText.classList.add('hint_error');
      hintField.classList.add('hint-field_visible');
      setTimeout(function () {
        hintField.classList.remove('hint-field_visible');
        hintText.classList.remove('hint_error');
      }, 1e3);
    }
  }
}

configForm.addEventListener('change', function () {
  needSave = true;
});

configForm.addEventListener('submit', function (event) {
  event.preventDefault();

  // save options
  chrome.storage.local.set(
    {
      config: {
        until: untilInput.checked,
        bypass: bypassInput.checked,
        period: Number.parseInt(periodInput.value, 10),
      },
    },
    function () {
      notify({
        type: 'success',
        message: 'Saved',
      });
      needSave = false;
    }
  );
});

document.querySelector('#get-advice').addEventListener('click', function () {
  needSave = true;
  untilInput.checked = RECOMMENDED_CONFIG.until;
  bypassInput.checked = RECOMMENDED_CONFIG.bypass;
  periodInput.value = RECOMMENDED_CONFIG.period;
});

window.addEventListener('beforeunload', function (event) {
  if (needSave) {
    event.preventDefault();
    event.returnValue = '';
  }
});

// start
chrome.storage.local.get('config', function (res) {
  if ('config' in res) {
    untilInput.checked = res.config.until;
    bypassInput.checked = res.config.bypass;
    periodInput.value = res.config.period;
  }
});
